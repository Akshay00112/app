import fitz  # PyMuPDF
import pdfplumber
import uuid
import os
from typing import List, Dict, Any


class PDFProcessor:
    """
    Full document reader backend:
    - Extracts every word with exact coordinates (PDF)
    - Supports word selection
    - Tracks practice statistics
    """

    def __init__(self):
        self.words: List[Dict[str, Any]] = []
        self.sentences: List[Dict[str, Any]] = []
        self.page_texts: List[str] = []
        self.pages: int = 0
        self.current_pdf_path: str | None = None

    def _extract_from_pdf(self, pdf_path: str):
        with pdfplumber.open(pdf_path) as pdf:
            self.pages = len(pdf.pages)
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                self.page_texts.append(text)
                
                # Split by lines as they appear in the PDF
                raw_lines = text.split('\n')
                
                line_in_page = 1
                for line_text in raw_lines:
                    line_text = line_text.strip()
                    if line_text:
                        self.sentences.append({
                            'text': line_text,
                            'page': page_num + 1,
                            'line': line_in_page,
                            'selected': False,
                            'global_index': len(self.sentences)
                        })
                        line_in_page += 1

    def extract_text_with_positions(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extract text from PDF and split into lines for practice.
        """
        self.sentences = []
        self.page_texts = []
        self.current_pdf_path = file_path
        
        self._extract_from_pdf(file_path)
                        
        return self.sentences

    def get_sentence_stats(self) -> Dict[str, Any]:
        """Get statistics for sentences"""
        total = len(self.sentences)
        selected = len([s for s in self.sentences if s.get('selected')])
        
        return {
            'total_sentences': total,
            'selected_sentences': selected,
            'completion_rate': (selected / total * 100) if total > 0 else 0,
            'total_pages': self.pages
        }
