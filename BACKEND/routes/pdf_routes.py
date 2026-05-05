# backend/routes/pdf_routes.py
from flask import Blueprint, request, jsonify
import os
import uuid
from config import Config
from models.pdf_processor import PDFProcessor
import logging

pdf_bp = Blueprint('pdf', __name__)
pdf_processor = PDFProcessor()
logger = logging.getLogger(__name__)

@pdf_bp.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    """Handle PDF file upload and text extraction"""
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Save uploaded file
        filename = f"{uuid.uuid4()}_{pdf_file.filename}"
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        pdf_file.save(file_path)
        
        # Extract text from PDF
        sentences = pdf_processor.extract_text_with_positions(file_path)
        
        # Generate the public URL for the PDF
        base = request.host_url.rstrip('/')
        pdf_url = f"{base}/static/uploads/{filename}"
        
        response_data = {
            'success': True,
            'filename': filename,
            'original_filename': pdf_file.filename,
            'pdf_url': pdf_url,
            'total_sentences': len(sentences),
            'pages': pdf_processor.pages,
            'sentences': sentences,
            'stats': pdf_processor.get_sentence_stats()
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"PDF processing error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@pdf_bp.route('/pdf-info', methods=['GET'])
def get_pdf_info():
    """Get information about the currently loaded PDF"""
    try:
        stats = pdf_processor.get_sentence_stats()
        
        return jsonify({
            'success': True,
            'has_pdf': len(pdf_processor.sentences) > 0,
            'stats': stats,
            'current_pdf': pdf_processor.current_pdf_path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pdf_bp.route('/load-pdf', methods=['POST'])
def load_pdf():
    """Load a previously uploaded PDF and extract sentences"""
    print("[API] PDF load endpoint called")
    
    try:
        data = request.get_json()
        pdf_filename = data.get('filename') or data.get('pdf_name')
        pdf_url = data.get('pdf_url')
        
        if not pdf_filename and not pdf_url:
            return jsonify({'error': 'No PDF filename or URL provided'}), 400
        
        # If URL is provided, extract filename from URL
        if pdf_url and not pdf_filename:
            pdf_filename = pdf_url.split('/')[-1]
        
        # Construct the full file path
        file_path = os.path.join(Config.UPLOAD_FOLDER, pdf_filename)
        
        print(f"[DEBUG] Looking for PDF at: {file_path}")
        print(f"[DEBUG] Config.UPLOAD_FOLDER: {Config.UPLOAD_FOLDER}")
        print(f"[DEBUG] File exists: {os.path.exists(file_path)}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"[ERROR] PDF file not found: {file_path}")
            # Try to find it in the directory
            if os.path.exists(Config.UPLOAD_FOLDER):
                files = os.listdir(Config.UPLOAD_FOLDER)
                print(f"[DEBUG] Files in upload folder: {files}")
            return jsonify({'error': 'PDF file not found'}), 404
        
        print(f"[PDF] Loading PDF: {pdf_filename}")
        
        # Extract text from PDF
        sentences = pdf_processor.extract_text_with_positions(file_path)
        
        # Generate the public URL for the PDF (absolute URL so frontend can fetch across ports)
        base = request.host_url.rstrip('/')
        pdf_url = f"{base}/static/uploads/{pdf_filename}"
        
        print(f"[OK] PDF loaded successfully: {len(sentences)} sentences found")
        
        response_data = {
            'success': True,
            'filename': pdf_filename,
            'pdf_url': pdf_url,
            'total_sentences': len(sentences),
            'pages': pdf_processor.pages,
            'sentences': sentences,
            'stats': pdf_processor.get_sentence_stats()
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"[ERROR] PDF load error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

