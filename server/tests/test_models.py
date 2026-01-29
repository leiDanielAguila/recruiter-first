"""
Tests for Pydantic models
"""
import pytest
from pydantic import ValidationError
from app.models.health import HealthCheckResponse, WelcomeResponse
from app.models.resume import ResumeAnalysisRequest, ResumeAnalysisResponse


class TestHealthModels:
    """Test cases for health check models"""
    
    def test_health_check_response_valid(self):
        """Test valid HealthCheckResponse creation"""
        response = HealthCheckResponse(
            status="healthy",
            message="Service is running"
        )
        
        assert response.status == "healthy"
        assert response.message == "Service is running"
    
    def test_health_check_response_missing_fields(self):
        """Test HealthCheckResponse with missing fields"""
        with pytest.raises(ValidationError):
            HealthCheckResponse(status="healthy")
    
    def test_welcome_response_valid(self):
        """Test valid WelcomeResponse creation"""
        response = WelcomeResponse(
            name="Test API",
            version="1.0.0",
            description="Test description",
            endpoints=["GET /health", "POST /analyze"]
        )
        
        assert response.name == "Test API"
        assert response.version == "1.0.0"
        assert len(response.endpoints) == 2
    
    def test_welcome_response_empty_endpoints(self):
        """Test WelcomeResponse with empty endpoints list"""
        response = WelcomeResponse(
            name="Test API",
            version="1.0.0",
            description="Test",
            endpoints=[]
        )
        
        assert response.endpoints == []


class TestResumeModels:
    """Test cases for resume models"""
    
    def test_resume_analysis_request_valid(self):
        """Test valid ResumeAnalysisRequest creation"""
        request = ResumeAnalysisRequest(
            resume_file="base64encodedcontent",
            job_description="Looking for Python developer"
        )
        
        assert request.resume_file == "base64encodedcontent"
        assert request.job_description == "Looking for Python developer"
    
    def test_resume_analysis_request_missing_fields(self):
        """Test ResumeAnalysisRequest with missing fields"""
        with pytest.raises(ValidationError):
            ResumeAnalysisRequest(resume_file="content")
    
    def test_resume_analysis_response_valid(self):
        """Test valid ResumeAnalysisResponse creation"""
        response = ResumeAnalysisResponse(
            match_score=75.5,
            summary="Good candidate",
            strengths=["Python", "FastAPI"],
            gaps=["Docker"],
            recommendations=["Learn Docker"]
        )
        
        assert response.match_score == 75.5
        assert response.summary == "Good candidate"
        assert len(response.strengths) == 2
        assert len(response.gaps) == 1
        assert len(response.recommendations) == 1
    
    def test_resume_analysis_response_score_validation_min(self):
        """Test match score validation - minimum value"""
        with pytest.raises(ValidationError):
            ResumeAnalysisResponse(
                match_score=-1,  # Invalid: below 0
                summary="Test",
                strengths=[],
                gaps=[],
                recommendations=[]
            )
    
    def test_resume_analysis_response_score_validation_max(self):
        """Test match score validation - maximum value"""
        with pytest.raises(ValidationError):
            ResumeAnalysisResponse(
                match_score=101,  # Invalid: above 100
                summary="Test",
                strengths=[],
                gaps=[],
                recommendations=[]
            )
    
    def test_resume_analysis_response_score_boundary_min(self):
        """Test match score at minimum boundary"""
        response = ResumeAnalysisResponse(
            match_score=0,
            summary="No match",
            strengths=[],
            gaps=[],
            recommendations=[]
        )
        
        assert response.match_score == 0
    
    def test_resume_analysis_response_score_boundary_max(self):
        """Test match score at maximum boundary"""
        response = ResumeAnalysisResponse(
            match_score=100,
            summary="Perfect match",
            strengths=[],
            gaps=[],
            recommendations=[]
        )
        
        assert response.match_score == 100
    
    def test_resume_analysis_response_default_lists(self):
        """Test default empty lists for optional fields"""
        response = ResumeAnalysisResponse(
            match_score=50,
            summary="Average"
        )
        
        assert response.strengths == []
        assert response.gaps == []
        assert response.recommendations == []
    
    def test_resume_analysis_response_optional_recommendations(self):
        """Test that recommendations field is optional"""
        response = ResumeAnalysisResponse(
            match_score=80,
            summary="Strong candidate",
            strengths=["Python"],
            gaps=[]
        )
        
        assert response.recommendations == []
    
    def test_resume_analysis_response_json_serialization(self):
        """Test JSON serialization of response"""
        response = ResumeAnalysisResponse(
            match_score=75.0,
            summary="Test summary",
            strengths=["Skill 1", "Skill 2"],
            gaps=["Gap 1"],
            recommendations=["Rec 1"]
        )
        
        json_data = response.model_dump()
        
        assert json_data["match_score"] == 75.0
        assert json_data["summary"] == "Test summary"
        assert isinstance(json_data["strengths"], list)
        assert isinstance(json_data["gaps"], list)
        assert isinstance(json_data["recommendations"], list)
