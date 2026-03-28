import pymupdf
from fastapi import UploadFile
from app.utils.sanitization import MAX_PDF_BYTES
from app.models.cover_letter import CoverLetterDocument

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


def _wrap_text_lines(
    text: str,
    max_width: float,
    font_name: str,
    font_size: float,
) -> list[str]:
    lines: list[str] = []
    paragraphs = text.replace("\r\n", "\n").split("\n")

    for paragraph in paragraphs:
        sentence = paragraph.strip()
        if not sentence:
            lines.append("")
            continue

        words = sentence.split()
        current_words: list[str] = []

        for word in words:
            candidate_words = [*current_words, word]
            candidate_line = " ".join(candidate_words)
            candidate_width = pymupdf.get_text_length(
                candidate_line,
                fontname=font_name,
                fontsize=font_size,
            )
            if candidate_width <= max_width or not current_words:
                current_words = candidate_words
                continue

            lines.append(" ".join(current_words))
            current_words = [word]

        if current_words:
            lines.append(" ".join(current_words))

    return lines


def render_cover_letter_pdf(document: CoverLetterDocument) -> bytes:
    """
    Render a generated cover letter into PDF bytes.

    Parameters:
        document (CoverLetterDocument): Generated cover letter document

    Returns:
        bytes: PDF content that can be streamed in a binary response
    """
    margin = 50
    page_width = 595
    page_height = 842
    body_font = "helv"
    body_size = 11.0
    line_height = body_size * 1.45
    max_text_width = page_width - (margin * 2)

    heading_lines = [
        f"Job Title: {document.job_title}",
        f"Hiring Manager: {document.hiring_manager_name}",
        f"Email: {document.email}",
        f"Phone: {document.phone}",
        "",
    ]

    body_lines = _wrap_text_lines(
        document.cover_letter,
        max_width=max_text_width,
        font_name=body_font,
        font_size=body_size,
    )
    all_lines = [*heading_lines, *body_lines]

    pdf_document = pymupdf.open()
    page = pdf_document.new_page(width=page_width, height=page_height)

    y_position = margin
    for line in all_lines:
        if y_position + line_height > page_height - margin:
            page = pdf_document.new_page(width=page_width, height=page_height)
            y_position = margin

        page.insert_text(
            point=(margin, y_position),
            text=line,
            fontsize=body_size,
            fontname=body_font,
        )
        y_position += line_height

    pdf_bytes = pdf_document.tobytes()
    pdf_document.close()
    return pdf_bytes
