# backend/routes/online_books_routes.py
from flask import Blueprint, request, jsonify
from routes.auth_middleware import jwt_required_custom
from services.online_books_service import OnlineBooksService
from services.online_book_processor import OnlineBookProcessor

online_books_bp = Blueprint('online_books', __name__)

@online_books_bp.route('', methods=['GET'])
@jwt_required_custom
def get_default_books():
    """Get default/featured books - called when no specific endpoint is specified"""
    try:
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)  # Cap at 50
        
        result = OnlineBooksService.get_featured_books(limit)
        return jsonify(result), 200 if result['success'] else 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@online_books_bp.route('/featured', methods=['GET'])
@jwt_required_custom
def get_featured_books():
    """Get featured/most downloaded books from Project Gutenberg"""
    try:
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)  # Cap at 50
        
        result = OnlineBooksService.get_featured_books(limit)
        return jsonify(result), 200 if result['success'] else 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@online_books_bp.route('/search', methods=['GET', 'POST'])
@jwt_required_custom
def search_books():
    """Search for books by title or author"""
    try:
        if request.method == 'POST':
            data = request.get_json()
            query = data.get('query', '').strip()
        else:
            query = request.args.get('query', '').strip()
        
        if not query:
            return jsonify({'success': False, 'error': 'Search query required'}), 400
        
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)
        
        result = OnlineBooksService.search_books(query, limit)
        return jsonify(result), 200 if result['success'] else 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@online_books_bp.route('/genre/<genre>', methods=['GET'])
@jwt_required_custom
def get_books_by_genre(genre):
    """Get books by genre/category"""
    try:
        genre = genre.strip()
        if not genre:
            return jsonify({'success': False, 'error': 'Genre required'}), 400
        
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)
        
        result = OnlineBooksService.get_books_by_genre(genre, limit)
        return jsonify(result), 200 if result['success'] else 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@online_books_bp.route('/process', methods=['POST'])
@jwt_required_custom
def process_online_book():
    """Process online book - fetch text and extract sentences"""
    try:
        data = request.get_json()
        text_url = data.get('text_url', '').strip()
        
        if not text_url:
            return jsonify({'success': False, 'error': 'Text URL required'}), 400
        
        result = OnlineBookProcessor.extract_text_from_url(text_url)
        return jsonify(result), 200 if result['success'] else 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
