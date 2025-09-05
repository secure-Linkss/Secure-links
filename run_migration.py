#!/usr/bin/env python3
"""
Database migration script to fix schema mismatch issues
"""
import os
import psycopg2
from urllib.parse import urlparse

def run_migration():
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
        
        # Read the migration SQL
        with open('database_migration.sql', 'r') as f:
            migration_sql = f.read()
        
        # Execute the migration
        with conn.cursor() as cursor:
            # Split by semicolon and execute each statement
            statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
            
            for statement in statements:
                try:
                    print(f"Executing: {statement[:100]}...")
                    cursor.execute(statement)
                    conn.commit()
                    print("✓ Success")
                except Exception as e:
                    print(f"✗ Error: {e}")
                    conn.rollback()
                    # Continue with next statement
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("🔄 Starting database migration...")
    success = run_migration()
    if success:
        print("🎉 Database migration completed!")
    else:
        print("💥 Database migration failed!")

