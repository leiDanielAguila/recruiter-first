"""
Tests for resume analysis endpoints
"""
import pytest
from fastapi import status
from unittest.mock import AsyncMock, patch, MagicMock
from io import BytesIO


class TestResumeAnalyzeEndpoint:
    """Test cases for resume analysis endpoint"""
    
    def test_analyze_endpoint_missing_file(self, client, sample_job_description):
        """Test analyze endpoint returns 422 when resume file is missing"""
        response = client.post(
            "/api/v1/resume/analyze",
            data={"job_description": sample_job_description}
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_analyze_endpoint_missing_job_description(self, client):
        """Test analyze endpoint returns 422 when job description is missing"""
        pdf_content = b"%PDF-1.4 test content"
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("test.pdf", BytesIO(pdf_content), "application/pdf")}
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_analyze_endpoint_invalid_file_format(self, client, sample_job_description):
        """Test analyze endpoint rejects non-PDF files"""
        text_content = b"This is not a PDF"
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("test.txt", BytesIO(text_content), "text/plain")},
            data={"job_description": sample_job_description}
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid file format" in response.json()["detail"]
    
    def test_analyze_endpoint_empty_job_description(self, client):
        """Test analyze endpoint rejects empty job description"""
        pdf_content = b"%PDF-1.4 test content"
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("test.pdf", BytesIO(pdf_content), "application/pdf")},
            data={"job_description": "   "}
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Job description cannot be empty" in response.json()["detail"]
    
    @patch('app.api.resume.analyze_resume')
    def test_analyze_endpoint_success(self, mock_analyze, client, sample_analysis_response):
        """Test successful resume analysis"""
        from app.models.resume import ResumeAnalysisResponse
        
        # Set up the mock to return a ResumeAnalysisResponse
        mock_analyze.return_value = ResumeAnalysisResponse(**sample_analysis_response)
        
        pdf_content = b"%PDF-1.4 test content"
        job_desc = "Looking for Python developer"
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("test.pdf", BytesIO(pdf_content), "application/pdf")},
            data={"job_description": job_desc}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "match_score" in data
        assert "summary" in data
        assert "strengths" in data
        assert "gaps" in data
        assert "recommendations" in data
    
    @patch('app.api.resume.analyze_resume')
    def test_analyze_endpoint_response_structure(self, mock_analyze, client, sample_analysis_response):
        """Test response has correct structure"""
        from app.models.resume import ResumeAnalysisResponse
        
        mock_analyze.return_value = ResumeAnalysisResponse(**sample_analysis_response)
        
        pdf_content = b"%PDF-1.4 test content"
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("test.pdf", BytesIO(pdf_content), "application/pdf")},
            data={"job_description": "Test job description"}
        )
        
        data = response.json()
        
        # Validate response structure
        assert isinstance(data["match_score"], (int, float))
        assert 0 <= data["match_score"] <= 100
        assert isinstance(data["summary"], str)
        assert isinstance(data["strengths"], list)
        assert isinstance(data["gaps"], list)
        assert isinstance(data["recommendations"], list)
    
    @patch('app.services.resume_service.analyze_resume')
    def test_analyze_endpoint_service_error(self, mock_analyze, client):
        """Test endpoint handles service errors gracefully"""
        # Mock service to raise an exception
        mock_analyze.side_effect = Exception("Service error")
        
        pdf_content = b"%PDF-1.4 test content"
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("test.pdf", BytesIO(pdf_content), "application/pdf")},
            data={"job_description": "Test job description"}
        )
        
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "error" in response.json()["detail"].lower()
    
    def test_analyze_endpoint_with_filename_no_extension(self, client):
        """Test endpoint rejects files without .pdf extension"""
        pdf_content = b"%PDF-1.4 test content"
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("testfile", BytesIO(pdf_content), "application/pdf")},
            data={"job_description": "Test job"}
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    @patch('app.api.resume.analyze_resume')
    def test_analyze_endpoint_with_long_job_description(self, mock_analyze, client, sample_analysis_response):
        """Test endpoint handles long job descriptions"""
        from app.models.resume import ResumeAnalysisResponse
        
        mock_analyze.return_value = ResumeAnalysisResponse(**sample_analysis_response)
        
        pdf_content = b"%PDF-1.4 test content"
        long_job_desc = "Requirements: " + "Python developer " * 500  # Very long description
        
        response = client.post(
            "/api/v1/resume/analyze",
            files={"resume": ("test.pdf", BytesIO(pdf_content), "application/pdf")},
            data={"job_description": long_job_desc}
        )
        
        assert response.status_code == status.HTTP_200_OK
