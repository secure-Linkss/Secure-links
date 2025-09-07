#!/usr/bin/env python3
"""
Test password verification for users
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.models.user import User, db
from flask import Flask

# Create Flask app for database context
app = Flask(__name__)
database_url = os.environ.get('DATABASE_URL', 'postgresql://neondb_owner:npg_7CcKbPRm2GDw@ep-odd-thunder-ade4ip4a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def test_passwords():
    with app.app_context():
        print("Testing password verification...")
        
        # Get the Brain user
        user = User.query.filter_by(username='Brain').first()
        if user:
            print(f"Found user: {user.username} ({user.email})")
            
            # Test different passwords
            passwords_to_test = [
                "Mayflower1!!",
                "Mayflower1!",
                "mayflower1!!",
                "Mayflower1"
            ]
            
            for password in passwords_to_test:
                result = user.check_password(password)
                print(f"Password '{password}': {'✓ CORRECT' if result else '✗ INCORRECT'}")
        else:
            print("User 'Brain' not found")

if __name__ == "__main__":
    test_passwords()

