from flask import Blueprint, request, jsonify, session
from src.models.user import db, User
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_input(text):
    if not text:
        return ''
    return text.strip()

@auth_bp.route('/auth', methods=['GET', 'POST'])
def auth():
    if request.method == 'GET':
        # Check if user is logged in
        if 'user_id' in session:
            user = User.query.get(session['user_id'])
            if user:
                return jsonify({
                    'authenticated': True,
                    'user': user.to_dict()
                })
        
        return jsonify({'authenticated': False})
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        action = data.get('action', '')
        
        if action == 'login':
            username = sanitize_input(data.get('username', ''))
            password = data.get('password', '')
            
            if not username or not password:
                return jsonify({'success': False, 'error': 'Username and password are required'}), 400
            
            # Find user by username or email
            user = User.query.filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if user and user.check_password(password):
                session['user_id'] = user.id
                return jsonify({
                    'success': True,
                    'message': 'Login successful',
                    'user': user.to_dict()
                })
            else:
                return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        elif action == 'register':
            username = sanitize_input(data.get('username', ''))
            email = sanitize_input(data.get('email', ''))
            password = data.get('password', '')
            confirm_password = data.get('confirm_password', '')

            if not username and not email:
                return jsonify({'success': False, 'error': 'Username or email is required'}), 400
            
            if not password:
                return jsonify({'success': False, 'error': 'Password is required'}), 400

            if password != confirm_password:
                return jsonify({'success': False, 'error': 'Passwords do not match'}), 400

            if len(password) < 6:
                return jsonify({'success': False, 'error': 'Password must be at least 6 characters long'}), 400

            # If only username is provided, and it's not an email format, use a placeholder email
            if username and not email:
                if not validate_email(username):
                    email = f"{username}@placeholder.com" # Use a placeholder email
                else:
                    email = username # If username is an email, use it as email
            
            # If only email is provided, use a derived username
            if email and not username:
                username = email.split('@')[0] # Simple username from email prefix

            if not validate_email(email):
                return jsonify({'success': False, 'error': 'Invalid email format'}), 400
            
            # Check if user already exists
            existing_user = User.query.filter(
                (User.username == username) | (User.email == email)
            ).first()
            
            if existing_user:
                return jsonify({'success': False, 'error': 'Username or email already exists'}), 409
            
            # Create new user
            try:
                user = User(username=username, email=email)
                user.set_password(password)
                db.session.add(user)
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'User created successfully',
                    'user_id': user.id
                })
            except Exception as e:
                db.session.rollback()
                return jsonify({'success': False, 'error': f'Failed to create user: {str(e)}'}), 500
        
        elif action == 'logout':
            session.pop('user_id', None)
            return jsonify({
                'success': True,
                'message': 'Logout successful'
            })
        
        else:
            return jsonify({'success': False, 'error': 'Invalid action'}), 400


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"Login request data: {data}")  # Debug logging
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    username = sanitize_input(data.get('username', ''))
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password are required'}), 400
    
    # Find user by username or email
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    
    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict()
        })
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    username = sanitize_input(data.get('username', ''))
    email = sanitize_input(data.get('email', ''))
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    if not username and not email:
        return jsonify({'success': False, 'error': 'Username or email is required'}), 400
    
    if not password:
        return jsonify({'success': False, 'error': 'Password is required'}), 400

    if password != confirm_password:
        return jsonify({'success': False, 'error': 'Passwords do not match'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters long'}), 400

    # If only username is provided, and it's not an email format, use a placeholder email
    if username and not email:
        if not validate_email(username):
            email = f"{username}@placeholder.com" # Use a placeholder email
        else:
            email = username # If username is an email, use it as email
    
    # If only email is provided, use a derived username
    if email and not username:
        username = email.split('@')[0] # Simple username from email prefix

    if not validate_email(email):
        return jsonify({'success': False, 'error': 'Invalid email format'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        return jsonify({'success': False, 'error': 'Username or email already exists'}), 409
    
    # Create new user
    try:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user_id': user.id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': f'Failed to create user: {str(e)}'}), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

