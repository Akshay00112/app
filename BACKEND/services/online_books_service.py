"""
Service for fetching free online books from Project Gutenberg
"""
import requests
import json
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class OnlineBooksService:
    """Fetch and manage free online books from Project Gutenberg"""
    
    # Project Gutenberg API endpoint
    GUTENBERG_API = "https://gutendex.com/books"
    
    CLIENT_TIMEOUT = 5  # seconds
    MAX_RESULTS = 50
    
    # Fallback mock books if Gutendex is down
    MOCK_FEATURED_BOOKS = [
        {
            'id': 1342,
            'title': 'Pride and Prejudice',
            'author': 'Jane Austen',
            'download_count': 50000,
            'text_url': 'https://www.gutenberg.org/files/1342/1342-0.txt',
            'source': 'Project Gutenberg',
            'language': 'en',
            'source_url': 'https://www.gutenberg.org/ebooks/1342'
        },
        {
            'id': 11,
            'title': 'Alice\'s Adventures in Wonderland',
            'author': 'Lewis Carroll',
            'download_count': 45000,
            'text_url': 'https://www.gutenberg.org/files/11/11-0.txt',
            'source': 'Project Gutenberg',
            'language': 'en',
            'source_url': 'https://www.gutenberg.org/ebooks/11'
        },
        {
            'id': 84,
            'title': 'Frankenstein',
            'author': 'Mary Wollstonecraft Shelley',
            'download_count': 40000,
            'text_url': 'https://www.gutenberg.org/files/84/84-0.txt',
            'source': 'Project Gutenberg',
            'language': 'en',
            'source_url': 'https://www.gutenberg.org/ebooks/84'
        }
    ]
    
    @classmethod
    def get_featured_books(cls, limit: int = 20) -> Dict:
        """
        Get featured books from Project Gutenberg
        
        Args:
            limit: Number of books to fetch (default 20)
            
        Returns:
            Dictionary with success status and books list
        """
        try:
            params = {
                'sort': 'popular',
                'page': 1
            }
            
            response = requests.get(
                cls.GUTENBERG_API,
                params=params,
                timeout=cls.CLIENT_TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            books = cls._format_books(data.get('results', [])[:limit])
            
            return {
                'success': True,
                'books': books,
                'count': len(books)
            }
        except requests.exceptions.RequestException as e:
            logger.warning(f"Gutendex API unavailable, falling back to mock books. Error: {str(e)}")
            # Fallback to mock data to prevent app errors when Gutendex is down
            return {
                'success': True,
                'books': cls.MOCK_FEATURED_BOOKS[:limit],
                'count': len(cls.MOCK_FEATURED_BOOKS[:limit])
            }
    
    @classmethod
    def search_books(cls, query: str, limit: int = 20) -> Dict:
        """
        Search for books by title or author
        
        Args:
            query: Search term (title or author)
            limit: Number of results to return
            
        Returns:
            Dictionary with success status and search results
        """
        try:
            params = {
                'search': query,
                'page': 1
            }
            
            response = requests.get(
                cls.GUTENBERG_API,
                params=params,
                timeout=cls.CLIENT_TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            books = cls._format_books(data.get('results', [])[:limit])
            
            return {
                'success': True,
                'query': query,
                'books': books,
                'count': len(books)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching Project Gutenberg: {str(e)}")
            return {
                'success': False,
                'error': 'Search failed',
                'books': []
            }
    
    @classmethod
    def get_books_by_genre(cls, genre: str, limit: int = 20) -> Dict:
        """
        Get books filtered by genre/category
        
        Args:
            genre: Genre name
            limit: Number of results to return
            
        Returns:
            Dictionary with success status and books list
        """
        try:
            # Note: Gutendex doesn't have direct genre filtering
            # Using search as a workaround
            params = {
                'search': genre,
                'sort': 'popular',
                'page': 1
            }
            
            response = requests.get(
                cls.GUTENBERG_API,
                params=params,
                timeout=cls.CLIENT_TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            books = cls._format_books(data.get('results', [])[:limit])
            
            return {
                'success': True,
                'genre': genre,
                'books': books,
                'count': len(books)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching genre books: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to fetch genre books',
                'books': []
            }
    
    @classmethod
    def _format_books(cls, raw_books: List) -> List[Dict]:
        """
        Format raw API response into standardized book format
        
        Args:
            raw_books: List of raw book data from API
            
        Returns:
            List of formatted book dictionaries
        """
        formatted = []
        
        for book in raw_books:
            try:
                # Extract text format URL (prefer HTML or TXT)
                text_url = None
                formats = book.get('formats', {})
                
                # Prefer HTML format
                if 'text/html' in formats:
                    text_url = formats['text/html']
                elif 'text/plain' in formats:
                    text_url = formats['text/plain']
                elif 'text/plain; charset=utf-8' in formats:
                    text_url = formats['text/plain; charset=utf-8']
                elif 'text/plain; charset=iso-8859-1' in formats:
                    text_url = formats['text/plain; charset=iso-8859-1']
                
                # Get authors
                authors = []
                for author in book.get('authors', []):
                    authors.append(author.get('name', 'Unknown'))
                
                formatted_book = {
                    'id': book.get('id'),
                    'title': book.get('title', 'Unknown'),
                    'author': ', '.join(authors) if authors else 'Unknown',
                    'cover_image': book.get('formats', {}).get('image/jpeg'),
                    'download_count': book.get('download_count', 0),
                    'text_url': text_url,
                    'source': 'Project Gutenberg',
                    'language': book.get('languages', ['unknown'])[0] if book.get('languages') else 'unknown',
                    'source_url': f"https://www.gutenberg.org/ebooks/{book.get('id')}"
                }
                
                # Only add if we have a text URL
                if formatted_book['text_url']:
                    formatted.append(formatted_book)
            except Exception as e:
                logger.warning(f"Error formatting book: {str(e)}")
                continue
        
        return formatted
