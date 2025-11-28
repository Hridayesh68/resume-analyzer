# backend/utils/text_extraction.py
"""
Text extraction utilities for PDF and DOCX files
"""

import os
import PyPDF2
from docx import Document


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        text_parts = []
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                except Exception:
                    # ignore page extraction problems
                    continue
        return "\n".join(text_parts).strip()
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = Document(file_path)
        text = []
        for para in doc.paragraphs:
            if para.text:
                text.append(para.text)
        return "\n".join(text).strip()
    except Exception as e:
        print(f"❌ Error extracting DOCX: {e}")
        return ""


def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"❌ Error extracting TXT: {e}")
        return ""


def extract_text_from_file(file_path: str, filename: str) -> str:
    """
    Extract text from file based on extension.
    Supports: PDF, DOCX, TXT
    """
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_ext in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    elif file_ext == '.txt':
        return extract_text_from_txt(file_path)
    else:
        # try pdf fallback
        return extract_text_from_pdf(file_path)
