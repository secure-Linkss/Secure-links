import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from flask import Flask, request, jsonify
from src.models import db
from src.models.user import User

# Create a minimal Flask app for this endpoint
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'ej5B3Amppi4gjpbC65te6rJuvJzgVCWW_xfB-ZLR1TE')

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url and 'postgresql' in database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///temp.db'

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

def sanitize_input(text):
    if not text:
        return ''
    return text.strip()

# This is the main handler function for Vercel
def handler(event, context):
    with app.app_context():
        try:
            # Initialize database if needed
            db.create_all()
            
            # Create default users if they don't exist
            if not User.query.filter_by(username="Brain").first():
                admin_user = User(username="Brain", email="admin@brainlinktracker.com", role="main_admin")
                admin_user.set_password("Mayflower1!!")
                db.session.add(admin_user)
                db.session.commit()
            
            # Parse request data from Vercel event
            if 'body' in event:
                body = event['body']
                if isinstance(body, str):
                    data = json.loads(body) if body else {}
                else:
                    data = body
            else:
                data = {}
            
            if not data:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps({'success': False, 'error': 'No data provided'})
                }
            
            username = sanitize_input(data.get('username', ''))
            password = data.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps({'success': False, 'error': 'Username and password are required'})
                }
            
            # Find user by username or email
            user = User.query.filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if user and user.check_password(password):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Login successful',
                        'user': user.to_dict(),
                        'token': 'dummy-token'
                    })
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    'body': json.dumps({'success': False, 'error': 'Invalid credentials'})
                }
                
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

# For local testing
if __name__ == "__main__":
    app.run(debug=True)

