#!/usr/bin/env python3
"""
Fix remaining database issues after migration
"""
import os
import psycopg2
from urllib.parse import urlparse

def fix_remaining_issues():
    # Database URL from environment
    database_url = os.environ.get('DATABASE_URL', 'postgresql://neondb_owner:npg_7CcKbPRm2GDw@ep-odd-thunder-ade4ip4a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
    
    # Parse the database URL
    parsed = urlparse(database_url)
    
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],  # Remove leading slash
            user=parsed.username,
            password=parsed.password,
            sslmode='require'
        )
        
        with conn.cursor() as cursor:
            # Fix the UPDATE statement that failed
            print("Fixing user default values...")
            update_statements = [
                "UPDATE users SET role = 'member' WHERE role IS NULL;",
                "UPDATE users SET login_count = 0 WHERE login_count IS NULL;",
                "UPDATE users SET failed_login_attempts = 0 WHERE failed_login_attempts IS NULL;",
                "UPDATE users SET is_active = TRUE WHERE is_active IS NULL;",
                "UPDATE users SET is_verified = FALSE WHERE is_verified IS NULL;",
                "UPDATE users SET plan_type = 'free' WHERE plan_type IS NULL;",
                "UPDATE users SET subscription_plan = '1 Day Trial' WHERE subscription_plan IS NULL;",
                "UPDATE users SET status = 'pending' WHERE status IS NULL;",
                "UPDATE users SET campaigns_count = 0 WHERE campaigns_count IS NULL;",
                "UPDATE users SET daily_link_limit = 10 WHERE daily_link_limit IS NULL;",
                "UPDATE users SET links_used_today = 0 WHERE links_used_today IS NULL;",
                "UPDATE users SET last_reset_date = CURRENT_DATE WHERE last_reset_date IS NULL;",
                "UPDATE users SET telegram_enabled = FALSE WHERE telegram_enabled IS NULL;"
            ]
            
            for statement in update_statements:
                try:
                    cursor.execute(statement)
                    conn.commit()
                    print(f"✓ {statement[:50]}...")
                except Exception as e:
                    print(f"✗ Error: {e}")
                    conn.rollback()
            
            # Check if links table exists, if not create it
            print("\nChecking links table...")
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'links'
                );
            """)
            
            links_exists = cursor.fetchone()[0]
            
            if not links_exists:
                print("Creating links table...")
                cursor.execute("""
                    CREATE TABLE links (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        original_url TEXT NOT NULL,
                        short_code VARCHAR(20) UNIQUE NOT NULL,
                        short_url VARCHAR(255) NOT NULL,
                        title VARCHAR(500),
                        description TEXT,
                        clicks INTEGER DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE,
                        campaign_id INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(id),
                        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
                    );
                """)
                conn.commit()
                print("✓ Links table created")
            else:
                print("✓ Links table already exists")
                # Add campaign_id column if it doesn't exist
                cursor.execute("""
                    ALTER TABLE links ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
                """)
                conn.commit()
                print("✓ Added campaign_id column to links table")
            
            # Verify the Brain user exists and has correct role
            print("\nVerifying admin users...")
            cursor.execute("SELECT username, role FROM users WHERE username IN ('Brain', '7thbrain');")
            users = cursor.fetchall()
            
            for username, role in users:
                print(f"✓ User {username} has role: {role}")
        
        print("\n✅ All remaining issues fixed successfully!")
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("🔄 Fixing remaining database issues...")
    success = fix_remaining_issues()
    if success:
        print("🎉 All issues fixed!")
    else:
        print("💥 Fix failed!")

