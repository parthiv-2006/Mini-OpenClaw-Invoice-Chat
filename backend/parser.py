import fitz  # PyMuPDF
import re

def extract_text_from_pdf(filepath: str) -> str:
    """
    Extracts raw text from a PDF file using PyMuPDF.
    """
    try:
        doc = fitz.open(filepath)
        raw_text = ""
        for page in doc:
            raw_text += page.get_text("text") + "\n"
        doc.close()
        return raw_text
    except Exception as e:
        print(f"Error extracting text from {filepath}: {e}")
        return ""

def clean_extracted_text(raw_text: str) -> str:
    """
    Cleans raw text extracted from a PDF to remove excessive whitespace,
    newlines, and strange formatting common in invoices.
    """
    if not raw_text:
        return ""
        
    # Replace multiple spaces with a single space
    cleaned_text = re.sub(r'[ \t]+', ' ', raw_text)
    
    # Replace 3 or more consecutive newlines with just 2 newlines
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
    
    # Strip leading/trailing whitespace
    cleaned_text = cleaned_text.strip()
    
    return cleaned_text
