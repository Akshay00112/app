
# backend/models/user.py
from datetime import datetime
import bcrypt
from bson import ObjectId
from db import get_users_collection

class User:
    """User model for authentication"""
    
    @staticmethod
    def create_user(email, password, name):
        """Create a new user with hashed password"""
        users = get_users_collection()
        
        # Check if user already exists
        if users.find_one({'email': email.lower()}):
            return None, "Email already registered"
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_doc = {
            'email': email.lower(),
            'password_hash': password_hash,
            'name': name,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = users.insert_one(user_doc)
        user_doc['_id'] = result.inserted_id
        return user_doc, None
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        users = get_users_collection()
        return users.find_one({'email': email.lower()})
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        users = get_users_collection()
        try:
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            return users.find_one({'_id': user_id})
        except Exception as e:
            print(f"[ERROR] Error parsing user ID: {e}")
            return None
    
    @staticmethod
    def verify_password(user, password):
        """Verify user password"""
        if not user or 'password_hash' not in user:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), user['password_hash'])

    @staticmethod
    def update_login_activity(user_id):
        """Record login timestamp and increment login count"""
        users = get_users_collection()
        users.update_one(
            {'_id': ObjectId(user_id) if isinstance(user_id, str) else user_id},
            {
                '$set': {'last_login': datetime.utcnow()},
                '$inc': {'login_count': 1}
            }
        )
    
    @staticmethod
    def update_password(user_id, new_password):
        """Update user password"""
        users = get_users_collection()
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        result = users.update_one(
            {'_id': ObjectId(user_id) if isinstance(user_id, str) else user_id},
            {
                '$set': {
                    'password_hash': password_hash,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    @staticmethod
    def to_dict(user):
        """Convert user document to dict (excluding password)"""
        if not user:
            return None
            
        def safe_iso(dt):
            if hasattr(dt, 'isoformat'):
                return dt.isoformat()
            elif isinstance(dt, str):
                return dt
            return None
            
        return {
            'id': str(user.get('_id', '')),
            'email': user.get('email', ''),
            'name': user.get('name', ''),
            'created_at': safe_iso(user.get('created_at')),
            'last_login': safe_iso(user.get('last_login')),
            'login_count': user.get('login_count', 0)
        }
