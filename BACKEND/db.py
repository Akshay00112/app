import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv
import certifi
import logging
import time

load_dotenv()
logger = logging.getLogger(__name__)

client = None
db = None
last_connection_attempt = 0
CONNECTION_RETRY_DELAY = 5  # seconds

def init_db():
    global client, db, last_connection_attempt
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/dyslexia_assistant')
    
    try:
        # Optimized MongoDB connection with better timeout handling
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=30000,
            retryWrites=True,
            tlsCAFile=certifi.where(),
            maxPoolSize=50,
            minPoolSize=10,
            maxIdleTimeMS=45000
        )
        
        # Test connection
        client.server_info()
        db = client.get_database()
        logger.info(f'Connected to MongoDB: {db.name}')
        last_connection_attempt = time.time()
        return db
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        db = None
        logger.error(f'Failed to connect to MongoDB: {e}')
        last_connection_attempt = time.time()
        return None
    except Exception as e:
        db = None
        logger.error(f'Unexpected error connecting to MongoDB: {e}')
        last_connection_attempt = time.time()
        return None

def get_db():
    global db, client
    
    # Try to reconnect if connection is None
    if db is None:
        current_time = time.time()
        # Only retry if enough time has passed since last attempt
        if current_time - last_connection_attempt >= CONNECTION_RETRY_DELAY:
            logger.info("Attempting to reconnect to MongoDB...")
            db = init_db()
    
    # Verify connection is still alive
    if db is not None:
        try:
            client.server_info()
            return db
        except (ConnectionFailure, ServerSelectionTimeoutError):
            logger.warning("MongoDB connection lost, attempting reconnection...")
            db = None
            return get_db()  # Recursive retry
    
    if db is None:
        raise ConnectionError("MongoDB is not running or accessible. Please check your connection and try again.")
    
    return db

def get_users_collection():
    return get_db()['users']

def get_history_collection():
    return get_db()['history']
