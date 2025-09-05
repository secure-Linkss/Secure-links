import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from flask import Flask, request, jsonify, session
from src.models import db
from src.models.user import User
import re

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

def handler(request):
    with app.app_context():
        try:
            # Initialize database if needed
            db.create_all()
            
            # Parse request data
            if hasattr(request, 'get_json'):
                data = request.get_json()
            else:
                # For Vercel serverless function
                body = getattr(request, 'body', '{}')
                if isinstance(body, bytes):
                    body = body.decode('utf-8')
                data = json.loads(body) if body else {}
            
            if not data:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': 'No data provided'})
                }
            
            username = sanitize_input(data.get('username', ''))
            password = data.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': 'Username and password are required'})
                }
            
            # Find user by username or email
            user = User.query.filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if user and user.check_password(password):
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Login successful',
                        'user': user.to_dict()
                    })
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': 'Invalid credentials'})
                }
                
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': f'Server error: {str(e)}'})
            }

# For local testing
if __name__ == "__main__":
    app.run(debug=True)

