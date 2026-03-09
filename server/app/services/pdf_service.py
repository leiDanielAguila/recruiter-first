import pymupdf
from fastapi import UploadFile
from io import BytesIO

MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB


async def extract_text_from_pdf(resume: UploadFile) -> str:
    """
    Extracts text content from a PDF file using PyMuPDF.

    Parameters:
        resume (UploadFile): PDF file uploaded by the user

    Returns:
        str: Extracted text from all pages of the PDF

    Raises:
        ValueError: If the PDF exceeds 10 MB, cannot be opened, or contains no text
    """
    try:
        content = await resume.read()
        await resume.seek(0)

        if len(content) > MAX_PDF_BYTES:
            raise ValueError(
                f"PDF file is too large ({len(content) / (1024 * 1024):.1f} MB). Maximum allowed size is 10 MB."
            )

        pdf_document = pymupdf.open(stream=content, filetype="pdf")

        extracted_text = []
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            text = page.get_text()
            extracted_text.append(text)

        pdf_document.close()

        full_text = "\n\n".join(extracted_text).strip()

        if not full_text:
            raise ValueError("No text content found in the PDF")

        return full_text

    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
