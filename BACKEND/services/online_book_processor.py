"""
Service for processing online text-based books (Project Gutenberg, etc.)
Extracts text content and converts to sentences similar to PDF processing
"""
import requests
from typing import List, Dict
import logging
import re
from html.parser import HTMLParser

logger = logging.getLogger(__name__)

class HTMLTextExtractor(HTMLParser):
    """Extract text from HTML content"""
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.skip_content = False
        
    def handle_starttag(self, tag, attrs):
        # Skip script and style tags
        if tag in ('script', 'style'):
            self.skip_content = True
            
    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip_content = False
        # Add paragraph breaks for block elements
        elif tag in ('p', 'div', 'br', 'blockquote'):
            if self.text_parts and self.text_parts[-1] != '\n':
                self.text_parts.append('\n')
    
    def handle_data(self, data):
        if not self.skip_content:
            self.text_parts.append(data)
    
    def get_text(self):
        return ''.join(self.text_parts)

class OnlineBookProcessor:
    """Process online text-based books"""
    
    TIMEOUT = 30  # seconds
    MAX_CONTENT_SIZE = 10 * 1024 * 1024  # 10MB
    
    @classmethod
    def extract_text_from_url(cls, text_url: str) -> Dict:
        """
        Fetch and extract text content from a URL
        Handles both HTML and plain text formats
        """
        try:
            logger.info(f"Fetching content from: {text_url}")
            
            response = requests.get(
                text_url,
                timeout=cls.TIMEOUT,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            
            if 'html' in content_type:
                # Parse HTML
                logger.info("Detected HTML content, parsing...")
                parser = HTMLTextExtractor()
                parser.feed(response.text)
                text_content = parser.get_text()
            else:
                # Assume plain text
                text_content = response.text
            
            # Clean up text
            text_content = cls._clean_text(text_content)
            
            if not text_content:
                return {
                    'success': False,
                    'error': 'No readable content found'
                }
            
            logger.info(f"Extracted {len(text_content)} characters")
            
            # Extract sentences
            sentences = cls._extract_sentences(text_content)
            
            return {
                'success': True,
                'sentences': sentences,
                'sentence_count': len(sentences),
                'character_count': len(text_content)
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching URL: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to fetch content: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Error processing online book: {str(e)}")
            return {
                'success': False,
                'error': f'Error processing content: {str(e)}'
            }
    
    @classmethod
    def _clean_text(cls, text: str) -> str:
        """Clean and normalize text content"""
        # Remove extra whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Normalize paragraph breaks
        text = re.sub(r'[ \t]+', ' ', text)  # Normalize spaces
        text = text.strip()
        
        return text
    
    @classmethod
    def _extract_sentences(cls, text: str) -> List[Dict]:
        """
        Extract sentences from text
        Returns formatted sentence objects with position info
        """
        sentences = []
        sentence_counter = 0
        
        # Split by common sentence endings, but respect some abbreviations
        # This is a simplified approach; a production system might use NLTK
        sentence_pattern = r'(?<![A-Z][a-z])\s*(?<![A-Z]\.[A-Z])\.\s+(?=[A-Z"\'])|(?<!\w)\n\n+(?=\S)'
        raw_sentences = re.split(sentence_pattern, text)
        
        for page_idx, raw_sent in enumerate(raw_sentences, 1):
            # Further split by common sentence boundaries within long text blocks
            # Split on ?, !, and . that seem to end sentences
            sub_sentences = re.split(r'(?<!\w)([.!?]+)\s+(?=[A-Z"\']|$)', raw_sent)
            
            # Reconstruct sentences with punctuation
            for i in range(0, len(sub_sentences), 2):
                if i >= len(sub_sentences):
                    break
                    
                sent_text = sub_sentences[i].strip()
                punct = sub_sentences[i+1].strip() if i+1 < len(sub_sentences) else ''
                
                if sent_text:
                    full_sentence = sent_text + (' ' + punct if punct else '')
                    full_sentence = full_sentence.strip()
                    
                    # Only add if sentence has reasonable length (3+ words)
                    words = full_sentence.split()
                    if len(words) >= 3:
                        sentences.append({
                            'text': full_sentence,
                            'page': page_idx,
                            'line': i // 2 + 1,
                            'global_index': sentence_counter,
                            'word_count': len(words)
                        })
                        sentence_counter += 1
        
        logger.info(f"Extracted {len(sentences)} sentences from text")
        return sentences
