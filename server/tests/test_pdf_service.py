"""
Tests for PDF service functionality
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.pdf_service import extract_text_from_pdf
import pymupdf


class TestPdfService:
    """Test cases for PDF extraction service"""
    
    @pytest.mark.asyncio
    async def test_extract_text_from_valid_pdf(self, mock_pdf_file):
        """Test text extraction from valid PDF"""
        with patch('pymupdf.open') as mock_pymupdf:
            # Setup mock PDF document
            mock_page = MagicMock()
            mock_page.get_text.return_value = "Sample resume text\nJohn Doe\nSoftware Engineer"
            
            mock_doc = MagicMock()
            mock_doc.page_count = 1
            mock_doc.__getitem__.return_value = mock_page
            
            mock_pymupdf.return_value = mock_doc
            
            result = await extract_text_from_pdf(mock_pdf_file)
            
            assert isinstance(result, str)
            assert len(result) > 0
            assert result.strip() == "Sample resume text\nJohn Doe\nSoftware Engineer"
    
    @pytest.mark.asyncio
    async def test_extract_text_from_multipage_pdf(self, mock_pdf_file):
        """Test text extraction from multi-page PDF"""
        with patch('pymupdf.open') as mock_pymupdf:
            # Setup mock PDF with multiple pages
            mock_page1 = MagicMock()
            mock_page1.get_text.return_value = "Page 1 content"
            
            mock_page2 = MagicMock()
            mock_page2.get_text.return_value = "Page 2 content"
            
            mock_doc = MagicMock()
            mock_doc.page_count = 2
            mock_doc.__getitem__.side_effect = [mock_page1, mock_page2]
            
            mock_pymupdf.return_value = mock_doc
            
            result = await extract_text_from_pdf(mock_pdf_file)
            
            assert "Page 1 content" in result
            assert "Page 2 content" in result
            assert "\n\n" in result  # Pages should be separated
    
    @pytest.mark.asyncio
    async def test_extract_text_empty_pdf(self, mock_pdf_file):
        """Test extraction from PDF with no text content"""
        with patch('pymupdf.open') as mock_pymupdf:
            # Setup mock PDF with empty content
            mock_page = MagicMock()
            mock_page.get_text.return_value = ""
            
            mock_doc = MagicMock()
            mock_doc.page_count = 1
            mock_doc.__getitem__.return_value = mock_page
            
            mock_pymupdf.return_value = mock_doc
            
            with pytest.raises(ValueError, match="No text content found"):
                await extract_text_from_pdf(mock_pdf_file)
    
    @pytest.mark.asyncio
    async def test_extract_text_invalid_pdf(self, mock_pdf_file):
        """Test extraction from corrupted/invalid PDF"""
        with patch('pymupdf.open') as mock_pymupdf:
            mock_pymupdf.side_effect = Exception("Invalid PDF structure")
            
            with pytest.raises(ValueError, match="Failed to extract text from PDF"):
                await extract_text_from_pdf(mock_pdf_file)
    
    @pytest.mark.asyncio
    async def test_extract_text_strips_whitespace(self, mock_pdf_file):
        """Test that extracted text has whitespace properly cleaned"""
        with patch('pymupdf.open') as mock_pymupdf:
            mock_page = MagicMock()
            mock_page.get_text.return_value = "  \n\n  Sample text  \n\n  "
            
            mock_doc = MagicMock()
            mock_doc.page_count = 1
            mock_doc.__getitem__.return_value = mock_page
            
            mock_pymupdf.return_value = mock_doc
            
            result = await extract_text_from_pdf(mock_pdf_file)
            
            assert result == "Sample text"
            assert not result.startswith(" ")
            assert not result.endswith(" ")
    
    @pytest.mark.asyncio
    async def test_file_pointer_reset(self, mock_pdf_file):
        """Test that file pointer is reset after reading"""
        with patch('pymupdf.open') as mock_pymupdf:
            mock_page = MagicMock()
            mock_page.get_text.return_value = "Test content"
            
            mock_doc = MagicMock()
            mock_doc.page_count = 1
            mock_doc.__getitem__.return_value = mock_page
            
            mock_pymupdf.return_value = mock_doc
            
            # Track if seek was called
            original_seek = mock_pdf_file.seek
            seek_called = False
            
            async def track_seek(pos):
                nonlocal seek_called
                seek_called = True
                await original_seek(pos)
            
            mock_pdf_file.seek = track_seek
            
            await extract_text_from_pdf(mock_pdf_file)
            
            assert seek_called, "File pointer should be reset"
    
    @pytest.mark.asyncio
    async def test_pdf_document_closed(self, mock_pdf_file):
        """Test that PDF document is properly closed after processing"""
        with patch('pymupdf.open') as mock_pymupdf:
            mock_page = MagicMock()
            mock_page.get_text.return_value = "Test content"
            
            mock_doc = MagicMock()
            mock_doc.page_count = 1
            mock_doc.__getitem__.return_value = mock_page
            
            mock_pymupdf.return_value = mock_doc
            
            await extract_text_from_pdf(mock_pdf_file)
            
            # Verify close was called
            mock_doc.close.assert_called_once()
