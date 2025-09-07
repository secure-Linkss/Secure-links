#!/usr/bin/env python3
"""
Check what users exist in the database
"""
import os
import psycopg2
from urllib.parse import urlparse

def check_users():
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
            print("Checking users in database...")
            
            # Get all users
            cursor.execute("""
                SELECT id, username, email, role, is_active, is_verified, status
                FROM users 
                ORDER BY id;
            """)
            users = cursor.fetchall()
            
            print(f"Found {len(users)} users:")
            for user in users:
                print(f"  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Role: {user[3]}, Active: {user[4]}, Verified: {user[5]}, Status: {user[6]}")
        
        print("\n✅ User check completed!")
        
    except Exception as e:
        print(f"❌ User check failed: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("🔄 Checking users in database...")
    check_users()

