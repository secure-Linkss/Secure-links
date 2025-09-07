#!/usr/bin/env python3
"""
Clean up duplicate database tables and ensure consistency
"""
import os
import psycopg2
from urllib.parse import urlparse

def cleanup_duplicate_tables():
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
            print("Cleaning up duplicate tables...")
            
            # 1. Check if old tables have data that needs to be migrated
            print("1. Checking for data in old tables...")
            
            # Check 'link' table (old) vs 'links' table (new)
            cursor.execute("SELECT COUNT(*) FROM link;")
            old_link_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM links;")
            new_link_count = cursor.fetchone()[0]
            
            print(f"   Old 'link' table has {old_link_count} records")
            print(f"   New 'links' table has {new_link_count} records")
            
            # Check 'tracking_event' table (old) vs 'tracking_events' table (new)
            cursor.execute("SELECT COUNT(*) FROM tracking_event;")
            old_event_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM tracking_events;")
            new_event_count = cursor.fetchone()[0]
            
            print(f"   Old 'tracking_event' table has {old_event_count} records")
            print(f"   New 'tracking_events' table has {new_event_count} records")
            
            # Check 'user' table (old) vs 'users' table (new)
            cursor.execute("SELECT COUNT(*) FROM \"user\";")
            old_user_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM users;")
            new_user_count = cursor.fetchone()[0]
            
            print(f"   Old 'user' table has {old_user_count} records")
            print(f"   New 'users' table has {new_user_count} records")
            
            # 2. Migrate data if needed
            if old_link_count > 0 and new_link_count == 0:
                print("2. Migrating data from 'link' to 'links' table...")
                cursor.execute("""
                    INSERT INTO links SELECT * FROM link;
                """)
                conn.commit()
                print("   ✓ Link data migrated")
            else:
                print("2. No link data migration needed")
            
            if old_event_count > 0 and new_event_count == 0:
                print("3. Migrating data from 'tracking_event' to 'tracking_events' table...")
                cursor.execute("""
                    INSERT INTO tracking_events SELECT * FROM tracking_event;
                """)
                conn.commit()
                print("   ✓ Tracking event data migrated")
            else:
                print("3. No tracking event data migration needed")
            
            if old_user_count > 0 and new_user_count == 0:
                print("4. Migrating data from 'user' to 'users' table...")
                cursor.execute("""
                    INSERT INTO users SELECT * FROM \"user\";
                """)
                conn.commit()
                print("   ✓ User data migrated")
            else:
                print("4. No user data migration needed")
            
            # 3. Drop old tables (be careful!)
            print("5. Dropping old duplicate tables...")
            
            # Drop old tables if they exist and new tables have data
            if old_link_count == 0 or new_link_count > 0:
                cursor.execute("DROP TABLE IF EXISTS link CASCADE;")
                print("   ✓ Dropped old 'link' table")
            
            if old_event_count == 0 or new_event_count > 0:
                cursor.execute("DROP TABLE IF EXISTS tracking_event CASCADE;")
                print("   ✓ Dropped old 'tracking_event' table")
            
            if old_user_count == 0 or new_user_count > 0:
                cursor.execute("DROP TABLE IF EXISTS \"user\" CASCADE;")
                print("   ✓ Dropped old 'user' table")
            
            conn.commit()
            
            # 4. Verify final table list
            print("\n6. Final table verification...")
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            print("Remaining tables:")
            for table in tables:
                print(f"  ✓ {table[0]}")
        
        print("\n✅ Database cleanup completed successfully!")
        
    except Exception as e:
        print(f"❌ Database cleanup failed: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("🔄 Cleaning up duplicate database tables...")
    success = cleanup_duplicate_tables()
    if success:
        print("🎉 Database cleanup completed!")
    else:
        print("💥 Database cleanup failed!")

