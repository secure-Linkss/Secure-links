import sys
import os
import json
import hashlib
import psycopg2
from urllib.parse import parse_qs

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

def sanitize_input(text):
    if not text:
        return ''
    return text.strip()

def check_password(stored_password, provided_password):
    """Simple password checking - in production you'd use proper hashing"""
    # For now, just check if they match (assuming stored passwords are hashed)
    return stored_password == hashlib.sha256(provided_password.encode()).hexdigest()

def create_user_dict(user_data):
    """Convert user data to dictionary"""
    return {
        'id': user_data[0],
        'username': user_data[1],
        'email': user_data[2],
        'role': user_data[4] if len(user_data) > 4 else 'user'
    }

def handler(request):
    """Main handler function for Vercel"""
    try:
        # Set CORS headers
        headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
        # Handle OPTIONS request for CORS
        if request.method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }
        
        # Parse request body
        if hasattr(request, 'body'):
            body = request.body
            if isinstance(body, bytes):
                body = body.decode('utf-8')
            data = json.loads(body) if body else {}
        else:
            data = {}
        
        if not data:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'No data provided'})
            }
        
        username = sanitize_input(data.get('username', ''))
        password = data.get('password', '')
        
        if not username or not password:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Username and password are required'})
            }
        
        # Connect to database
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Database not configured'})
            }
        
        try:
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            # Create users table if it doesn't exist
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(80) UNIQUE NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'user'
                )
            """)
            
            # Create default admin user if not exists
            cur.execute("SELECT id FROM users WHERE username = %s", ('Brain',))
            if not cur.fetchone():
                admin_password_hash = hashlib.sha256('Mayflower1!!'.encode()).hexdigest()
                cur.execute("""
                    INSERT INTO users (username, email, password_hash, role) 
                    VALUES (%s, %s, %s, %s)
                """, ('Brain', 'admin@brainlinktracker.com', admin_password_hash, 'main_admin'))
                conn.commit()
            
            # Find user by username or email
            cur.execute("""
                SELECT id, username, email, password_hash, role 
                FROM users 
                WHERE username = %s OR email = %s
            """, (username, username))
            
            user_data = cur.fetchone()
            
            if user_data and check_password(user_data[3], password):
                user_dict = create_user_dict(user_data)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Login successful',
                        'user': user_dict,
                        'token': 'dummy-token'
                    })
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'error': 'Invalid credentials'})
                }
                
        except psycopg2.Error as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': f'Database error: {str(e)}'})
            }
        finally:
            if 'conn' in locals():
                conn.close()
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'success': False, 'error': f'Server error: {str(e)}'})
        }

