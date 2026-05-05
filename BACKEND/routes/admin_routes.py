from flask import Blueprint, jsonify
from models.user import User
from db import get_db
from bson import ObjectId
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/stats', methods=['GET'])
def admin_stats():
    """Aggregate stats for admin dashboard"""
    try:
        db = get_db()
        users_coll = db['users']
        history_coll = db['history']

        total_users = users_coll.count_documents({})
        total_uploads = history_coll.count_documents({})

        # Active users: logged in within the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        active_users = users_coll.count_documents({
            'last_login': {'$gte': seven_days_ago}
        })

        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_uploads': total_uploads,
                'active_users': active_users
            }
        }), 200
    except Exception as e:
        print(f"[ERROR] Admin stats failed: {e}")
        return jsonify({'success': False, 'error': 'Failed to get stats'}), 500


@admin_bp.route('/users', methods=['GET'])
def list_users():
    try:
        db = get_db()
        users_coll = db['users']
        history_coll = db['history']

        users = list(users_coll.find({}, {'password_hash': 0}))
        users_out = []
        for u in users:
            user_id = u['_id']
            uploads_count = history_coll.count_documents({'user_id': user_id})
            users_out.append({
                'id': str(user_id),
                'email': u.get('email'),
                'name': u.get('name'),
                'created_at': u.get('created_at').isoformat() if u.get('created_at') else None,
                'last_login': u.get('last_login').isoformat() if u.get('last_login') else None,
                'login_count': u.get('login_count', 0),
                'uploads_count': uploads_count
            })
        return jsonify({'success': True, 'users': users_out}), 200
    except Exception as e:
        print(f"[ERROR] Listing users failed: {e}")
        return jsonify({'success': False, 'error': 'Failed to list users'}), 500


@admin_bp.route('/users/<user_id>/activity', methods=['GET'])
def user_activity(user_id):
    """Get detailed activity for a specific user"""
    try:
        db = get_db()
        users_coll = db['users']
        history_coll = db['history']

        user = users_coll.find_one({'_id': ObjectId(user_id)}, {'password_hash': 0})
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Get user's reading history
        history = list(
            history_coll.find({'user_id': ObjectId(user_id)})
            .sort('updated_at', -1)
            .limit(50)
        )
        history_out = []
        for h in history:
            history_out.append({
                'id': str(h.get('_id')),
                'title': h.get('pdf_name') or h.get('title') or h.get('filename') or 'PDF',
                'total_pages': h.get('total_pages', 0),
                'last_page': h.get('last_page', 0),
                'total_sentences': h.get('total_sentences', 0),
                'status': h.get('status', 'unknown'),
                'created_at': h.get('created_at').isoformat() if h.get('created_at') else None,
                'updated_at': h.get('updated_at').isoformat() if h.get('updated_at') else None
            })

        return jsonify({
            'success': True,
            'user': {
                'id': str(user['_id']),
                'email': user.get('email'),
                'name': user.get('name'),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None,
                'last_login': user.get('last_login').isoformat() if user.get('last_login') else None,
                'login_count': user.get('login_count', 0)
            },
            'history': history_out,
            'total_uploads': len(history_out)
        }), 200
    except Exception as e:
        print(f"[ERROR] User activity failed: {e}")
        return jsonify({'success': False, 'error': 'Failed to get user activity'}), 500


@admin_bp.route('/uploads', methods=['GET'])
def list_uploads():
    try:
        db = get_db()
        history_coll = db['history']
        users_coll = db['users']

        uploads = list(history_coll.find({}).sort('created_at', -1).limit(100))
        uploads_out = []
        for h in uploads:
            # Resolve user name
            user_name = 'Unknown'
            if h.get('user_id'):
                u = users_coll.find_one({'_id': h['user_id']}, {'name': 1})
                if u:
                    user_name = u.get('name', 'Unknown')

            uploads_out.append({
                'id': str(h.get('_id')),
                'title': h.get('pdf_name') or h.get('title') or h.get('filename') or 'PDF',
                'user_id': str(h.get('user_id')) if h.get('user_id') else None,
                'user_name': user_name,
                'created_at': h.get('created_at').isoformat() if h.get('created_at') else None
            })
        return jsonify({'success': True, 'uploads': uploads_out}), 200
    except Exception as e:
        print(f"[ERROR] Listing uploads failed: {e}")
        return jsonify({'success': False, 'error': 'Failed to list uploads'}), 500
