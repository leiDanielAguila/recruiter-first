import pymupdf
from fastapi import UploadFile
from io import BytesIO


async def extract_text_from_pdf(resume: UploadFile) -> str:
    """
    Extracts text content from a PDF file using PyMuPDF.
    
    Parameters:
        resume (UploadFile): PDF file uploaded by the user
    
    Returns:
        str: Extracted text from all pages of the PDF
    
    Raises:
        ValueError: If the PDF cannot be opened or processed
    """
    try:
        # Read the file content 
        content = await resume.read() 
        
        # Reset file pointer for potential reuse
        await resume.seek(0)
        
        # Open PDF from bytes
        pdf_document = pymupdf.open(stream=content, filetype="pdf")
        
        # Extract text from all pages
        extracted_text = []
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            text = page.get_text()
            extracted_text.append(text)
        
        # Close the document
        pdf_document.close()
        
        # Join all pages with double newline separator
        full_text = "\n\n".join(extracted_text)
        
        # Clean up extra whitespace
        full_text = full_text.strip()
        
        if not full_text:
            raise ValueError("No text content found in the PDF")
        
        return full_text
        
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
