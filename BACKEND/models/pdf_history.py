from datetime import datetime
from bson import ObjectId
from db import get_history_collection

class PdfHistory:
    """Model for managing PDF reading history and progress"""
    
    @staticmethod
    def cleanup_duplicates(user_id):
        """Remove all duplicate entries for a user, keeping only the most recent one per book
        
        Args:
            user_id: User's MongoDB ObjectId
            
        Returns:
            Number of entries deleted
        """
        history = get_history_collection()
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        # Get all entries for this user
        all_entries = list(history.find({'user_id': user_id_obj}).sort('pdf_name', 1).sort('updated_at', -1))
        
        deleted_count = 0
        seen_books = {}
        
        # Group by pdf_name and keep only the most recent one
        for entry in all_entries:
            pdf_name = entry.get('pdf_name', '')
            
            if pdf_name not in seen_books:
                # First occurrence - keep this one
                seen_books[pdf_name] = entry['_id']
            else:
                # Duplicate - delete it
                result = history.delete_one({'_id': entry['_id']})
                deleted_count += result.deleted_count
        
        return deleted_count
    
    @staticmethod
    def find_existing_entry(user_id, pdf_name, pdf_path=None):
        """Check if a book already exists in user's history
        
        Uses pdf_name for matching (original filename) to detect re-uploads
        
        Args:
            user_id: User's MongoDB ObjectId
            pdf_name: Name of the PDF/book (original filename)
            pdf_path: Path to the file (optional, not used for matching)
            
        Returns:
            Existing entry dict if found, None if not found
        """
        history = get_history_collection()
        # Only check pdf_name, not pdf_path (since UUID changes on each upload)
        existing = history.find_one({
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
            'pdf_name': pdf_name,
            'isOnlineBook': {'$ne': True}  # Only match uploaded PDFs, not online books
        })
        return existing
    
    @staticmethod
    def add_to_history(user_id, pdf_name, pdf_path=None, total_pages=0, total_sentences=0, file_size=0, **kwargs):
        """Add a new entry to user's history or update if already exists
        
        Args:
            user_id: User's MongoDB ObjectId
            pdf_name: Name of the PDF/book (original filename)
            pdf_path: Path to the file or identifier
            total_pages: Number of pages
            total_sentences: Number of sentences
            file_size: File size in bytes
            **kwargs: Additional metadata (text_url, isOnlineBook, author, source, etc.)
            
        Returns:
            history_id: ID of the entry (new or existing)
        """
        history = get_history_collection()
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        # Check if entry already exists (for uploaded PDFs, use pdf_name only)
        existing = PdfHistory.find_existing_entry(user_id_obj, pdf_name, pdf_path)
        
        if existing:
            # Update existing entry with new file path and metadata
            update_data = {
                'pdf_path': pdf_path,  # Update to new UUID-prefixed filename
                'total_pages': total_pages,
                'total_sentences': total_sentences,
                'file_size': file_size,
                'updated_at': datetime.utcnow()
            }
            
            # Update metadata fields if provided
            for key, value in kwargs.items():
                if key not in ['last_page', 'status', 'created_at']:  # Don't override these
                    update_data[key] = value
            
            history.update_one(
                {'_id': existing['_id']},
                {'$set': update_data}
            )
            return str(existing['_id'])
        
        else:
            # Create new entry
            entry = {
                'user_id': user_id_obj,
                'pdf_name': pdf_name,
                'pdf_path': pdf_path,
                'total_pages': total_pages,
                'total_sentences': total_sentences,
                'file_size': file_size,
                'last_page': 1,
                'status': 'in_progress',
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Add any additional metadata (like text_url for online books)
            for key, value in kwargs.items():
                if key not in entry:  # Don't override core fields
                    entry[key] = value
            
            result = history.insert_one(entry)
            return str(result.inserted_id)

    @staticmethod
    def get_user_history(user_id, limit=20):
        """Get history for a specific user with limit
        
        Automatically cleans up duplicates before returning
        """
        history = get_history_collection()
        user_id_obj = ObjectId(user_id) if isinstance(user_id, str) else user_id
        
        # Clean up duplicates first
        PdfHistory.cleanup_duplicates(user_id_obj)
        
        # Now fetch the cleaned history
        cursor = history.find({'user_id': user_id_obj}).sort('updated_at', -1).limit(limit)
        
        results = []
        for entry in cursor:
            entry['id'] = str(entry.pop('_id'))
            entry['user_id'] = str(entry['user_id'])
            if 'created_at' in entry and isinstance(entry['created_at'], datetime):
                entry['created_at'] = entry['created_at'].isoformat()
            if 'updated_at' in entry and isinstance(entry['updated_at'], datetime):
                entry['updated_at'] = entry['updated_at'].isoformat()
            results.append(entry)
            
        return results

    @staticmethod
    def delete_from_history(history_id, user_id):
        """Delete a history entry"""
        history = get_history_collection()
        
        query = {
            '_id': ObjectId(history_id) if isinstance(history_id, str) else history_id,
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id
        }
        
        result = history.delete_one(query)
        return result.deleted_count > 0

    @staticmethod
    def update_progress(history_id, user_id, last_page):
        """Update progress for a document"""
        history = get_history_collection()
        
        query = {
            '_id': ObjectId(history_id) if isinstance(history_id, str) else history_id,
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id
        }
        
        update = {
            '$set': {
                'last_page': last_page,
                'updated_at': datetime.utcnow()
            }
        }
        
        result = history.update_one(query, update)
        return result.modified_count > 0

    @staticmethod
    def update_progress_stats(history_id, user_id, current_sentence=1, completed_sentences=0, total_attempts=0, correct_attempts=0):
        """Update detailed reading progress statistics"""
        history = get_history_collection()
        
        query = {
            '_id': ObjectId(history_id) if isinstance(history_id, str) else history_id,
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id
        }
        
        update = {
            '$set': {
                'current_sentence': current_sentence,
                'completed_sentences': completed_sentences,
                'total_attempts': total_attempts,
                'correct_attempts': correct_attempts,
                'updated_at': datetime.utcnow()
            }
        }
        
        print(f"[DB] Updating progress stats for {history_id}. Query: {query}")
        result = history.update_one(query, update)
        print(f"[DB] Update result: matched={result.matched_count}, modified={result.modified_count}")
        return result.matched_count > 0
