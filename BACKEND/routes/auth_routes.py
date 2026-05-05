# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from datetime import timedelta
from models.user import User
from routes.auth_middleware import jwt_required_custom
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        # Validation
        if not email or not password or not name:
            return jsonify({
                'success': False,
                'error': 'Email, password, and name are required'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 6 characters'
            }), 400
        
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Create user
        user, error = User.create_user(email, password, name)
        
        if error:
            return jsonify({'success': False, 'error': error}), 409
        
        # Create access token
        access_token = create_access_token(
            identity=str(user['_id']),
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully',
            'user': User.to_dict(user),
            'access_token': access_token
        }), 201
        
    except ConnectionError:
        return jsonify({
            'success': False, 
            'error': 'Database connection error. Please ensure MongoDB is running.'
        }), 503
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'error': 'Registration failed'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        try:
            # Find user
            user = User.find_by_email(email)
            
            if not user or not User.verify_password(user, password):
                return jsonify({
                    'success': False,
                    'error': 'Invalid email or password'
                }), 401
            
            # Record login activity
            User.update_login_activity(user['_id'])
            
            # Create access token
            access_token = create_access_token(
                identity=str(user['_id']),
                expires_delta=timedelta(days=30)
            )
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': User.to_dict(user),
                'access_token': access_token
            }), 200
            
        except ConnectionError as db_error:
            logger.error(f"Database connection error during login: {str(db_error)}")
            return jsonify({
                'success': False, 
                'error': 'Service temporarily unavailable. Please try again in a moment.'
            }), 503
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'error': 'Login failed. Please try again.'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required_custom
def get_current_user():
    """Get current authenticated user info"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': User.to_dict(user)
        }), 200
        
    except ConnectionError as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({
            'success': False, 
            'error': 'Database connection error. Please ensure MongoDB is running.'
        }), 503
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[ERROR] Get user failed: {e}")
        return jsonify({'success': False, 'error': 'Failed to get user'}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user (client-side token removal)"""
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password - requires old password"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        user_id = data.get('user_id', '')
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not user_id or not old_password or not new_password:
            return jsonify({
                'success': False,
                'error': 'user_id, old_password, and new_password are required'
            }), 400
        
        if len(new_password) < 6:
            return jsonify({
                'success': False,
                'error': 'New password must be at least 6 characters'
            }), 400
        
        # Find user and verify old password
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        if not User.verify_password(user, old_password):
            return jsonify({
                'success': False,
                'error': 'Old password is incorrect'
            }), 401
        
        # Update password
        if User.update_password(user_id, new_password):
            return jsonify({
                'success': True,
                'message': 'Password updated successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update password'
            }), 500
        
    except Exception as e:
        print(f"[ERROR] Password reset failed: {e}")
        return jsonify({'success': False, 'error': 'Password reset failed'}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Forgot password - reset by email (for demo, just validates email exists)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        
        if not email:
            return jsonify({'success': False, 'error': 'Email is required'}), 400
        
        # Find user by email
        user = User.find_by_email(email)
        if not user:
            # For security, don't reveal if email exists
            return jsonify({
                'success': True,
                'message': 'If account exists, password reset instructions have been sent'
            }), 200
        
        # TODO: Send password reset email in production
        # For now, in development, we'll return a reset code
        import secrets
        reset_code = secrets.token_urlsafe(32)
        
        return jsonify({
            'success': True,
            'message': 'Password reset instructions sent to email',
            'reset_code': reset_code,  # In production, don't return this
            'user_id': str(user['_id'])
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Forgot password failed: {e}")
        return jsonify({'success': False, 'error': 'Forgot password request failed'}), 500