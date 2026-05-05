# backend/config.py
import os

class Config:
    SECRET_KEY = 'dyslexia-assistant-secret-key'
    DEBUG = False  # Optimized for production
    
    # Use absolute paths to avoid issues with relative paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    SELECTIONS_FOLDER = os.path.join(BASE_DIR, 'static', 'selections')
    
    # Performance optimizations
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    SPEECH_RATE = 80
    SIMILARITY_THRESHOLD = 0.55
    JSON_SORT_KEYS = False
    PROPAGATE_EXCEPTIONS = True
    HF_API_TOKEN = os.getenv('HF_API_TOKEN')

# Create directories
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.SELECTIONS_FOLDER, exist_ok=True)