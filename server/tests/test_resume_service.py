"""
Tests for resume analysis service
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.resume_service import analyze_resume
from app.models.resume import ResumeAnalysisResponse
import json


class TestResumeService:
    """Test cases for resume analysis service"""
    
    @pytest.mark.asyncio
    async def test_analyze_resume_success(self, mock_pdf_file, sample_job_description):
        """Test successful resume analysis"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                # Mock PDF extraction
                mock_extract.return_value = "John Doe - Python Developer\nExperience with FastAPI"
                
                # Mock LLM response
                mock_response = MagicMock()
                mock_response.text = json.dumps({
                    "match_score": 85.0,
                    "summary": "Strong candidate with relevant experience",
                    "strengths": ["Python expertise", "FastAPI experience"],
                    "gaps": ["Limited cloud experience"],
                    "recommendations": ["Learn AWS or GCP"]
                })
                mock_generate.return_value = mock_response
                
                result = await analyze_resume(mock_pdf_file, sample_job_description)
                
                assert isinstance(result, ResumeAnalysisResponse)
                assert result.match_score == 85.0
                assert result.summary == "Strong candidate with relevant experience"
                assert len(result.strengths) == 2
                assert len(result.gaps) == 1
                assert len(result.recommendations) == 1
    
    @pytest.mark.asyncio
    async def test_analyze_resume_with_json_markdown(self, mock_pdf_file, sample_job_description):
        """Test handling of JSON wrapped in markdown code blocks"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                mock_extract.return_value = "Resume text"
                
                # Mock LLM response with markdown code block
                mock_response = MagicMock()
                mock_response.text = '''```json
{
    "match_score": 75.0,
    "summary": "Good fit",
    "strengths": ["Python"],
    "gaps": ["Docker"],
    "recommendations": ["Learn Docker"]
}
```'''
                mock_generate.return_value = mock_response
                
                result = await analyze_resume(mock_pdf_file, sample_job_description)
                
                assert result.match_score == 75.0
                assert result.summary == "Good fit"
    
    @pytest.mark.asyncio
    async def test_analyze_resume_json_parse_error(self, mock_pdf_file, sample_job_description):
        """Test handling of invalid JSON response"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                mock_extract.return_value = "Resume text"
                
                # Mock invalid JSON response
                mock_response = MagicMock()
                mock_response.text = "This is not valid JSON"
                mock_generate.return_value = mock_response
                
                result = await analyze_resume(mock_pdf_file, sample_job_description)
                
                assert result.match_score == 0.0
                assert "Error parsing" in result.summary
                assert result.strengths == []
                assert result.gaps == []
    
    @pytest.mark.asyncio
    async def test_analyze_resume_llm_error(self, mock_pdf_file, sample_job_description):
        """Test handling of LLM API errors"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                mock_extract.return_value = "Resume text"
                
                # Mock LLM error
                mock_generate.side_effect = Exception("API rate limit exceeded")
                
                result = await analyze_resume(mock_pdf_file, sample_job_description)
                
                assert result.match_score == 0.0
                assert "Error during analysis" in result.summary
                assert "API rate limit exceeded" in result.summary
    
    @pytest.mark.asyncio
    async def test_analyze_resume_pdf_extraction_error(self, mock_pdf_file, sample_job_description):
        """Test handling of PDF extraction errors"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            # Mock extraction error
            mock_extract.side_effect = ValueError("Failed to extract text from PDF")
            
            with pytest.raises(ValueError, match="Failed to extract text from PDF"):
                await analyze_resume(mock_pdf_file, sample_job_description)
    
    @pytest.mark.asyncio
    async def test_analyze_resume_missing_fields(self, mock_pdf_file, sample_job_description):
        """Test handling of response with missing fields"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                mock_extract.return_value = "Resume text"
                
                # Mock response with missing fields
                mock_response = MagicMock()
                mock_response.text = json.dumps({
                    "match_score": 60.0,
                    "summary": "Average candidate"
                    # Missing strengths, gaps, recommendations
                })
                mock_generate.return_value = mock_response
                
                result = await analyze_resume(mock_pdf_file, sample_job_description)
                
                assert result.match_score == 60.0
                assert result.summary == "Average candidate"
                assert result.strengths == []
                assert result.gaps == []
                assert result.recommendations == []
    
    @pytest.mark.asyncio
    async def test_analyze_resume_score_conversion(self, mock_pdf_file, sample_job_description):
        """Test that match score is properly converted to float"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                mock_extract.return_value = "Resume text"
                
                # Mock response with integer score
                mock_response = MagicMock()
                mock_response.text = json.dumps({
                    "match_score": 90,  # Integer instead of float
                    "summary": "Excellent match",
                    "strengths": ["All requirements met"],
                    "gaps": [],
                    "recommendations": []
                })
                mock_generate.return_value = mock_response
                
                result = await analyze_resume(mock_pdf_file, sample_job_description)
                
                assert isinstance(result.match_score, float)
                assert result.match_score == 90.0
    
    @pytest.mark.asyncio
    async def test_analyze_resume_prompt_structure(self, mock_pdf_file, sample_job_description):
        """Test that the prompt includes both resume and job description"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                resume_text = "Test resume content"
                mock_extract.return_value = resume_text
                
                mock_response = MagicMock()
                mock_response.text = json.dumps({
                    "match_score": 50.0,
                    "summary": "Test",
                    "strengths": [],
                    "gaps": [],
                    "recommendations": []
                })
                mock_generate.return_value = mock_response
                
                await analyze_resume(mock_pdf_file, sample_job_description)
                
                # Check that generate_content was called
                mock_generate.assert_called_once()
                
                # Get the prompt that was used
                call_args = mock_generate.call_args
                prompt = call_args[1]['contents']
                
                # Verify both resume and job description are in prompt
                assert resume_text in prompt
                assert sample_job_description in prompt
    
    @pytest.mark.asyncio
    async def test_analyze_resume_empty_response_text(self, mock_pdf_file, sample_job_description):
        """Test handling of empty response text from LLM"""
        with patch('app.services.resume_service.extract_text_from_pdf') as mock_extract:
            with patch('app.services.resume_service.client.models.generate_content') as mock_generate:
                mock_extract.return_value = "Resume text"
                
                # Mock empty response
                mock_response = MagicMock()
                mock_response.text = ""
                mock_generate.return_value = mock_response
                
                result = await analyze_resume(mock_pdf_file, sample_job_description)
                
                assert result.match_score == 0.0
                assert "Error parsing" in result.summary
