import pytest
from fastapi.testclient import TestClient
from app.main import app
import os
from unittest.mock import Mock
from io import BytesIO


@pytest.fixture
def client():
    """FastAPI test client fixture"""
    return TestClient(app)


@pytest.fixture
def sample_job_description():
    """Sample job description for testing"""
    return """
    Senior Python Developer
    
    Requirements:
    - 5+ years of Python development experience
    - Experience with FastAPI or similar web frameworks
    - Strong knowledge of SQL and NoSQL databases
    - Experience with Docker and Kubernetes
    - Excellent problem-solving skills
    - Bachelor's degree in Computer Science or related field
    
    Nice to have:
    - Experience with AWS or GCP
    - Machine Learning knowledge
    - Open source contributions
    """


@pytest.fixture
def sample_resume_text():
    """Sample resume text for testing"""
    return """
    John Doe
    Senior Software Engineer
    
    Experience:
    Software Engineer at Tech Corp (2018-2024)
    - Developed Python applications using FastAPI
    - Managed PostgreSQL databases
    - Deployed applications using Docker
    - Led team of 5 developers
    
    Education:
    BS Computer Science, University of Example (2014-2018)
    
    Skills:
    Python, FastAPI, PostgreSQL, Docker, Git, Linux
    """


@pytest.fixture
def mock_pdf_file():
    """Create a mock PDF file for testing"""
    pdf_content = b"%PDF-1.4 mock content"
    
    class MockUploadFile:
        def __init__(self, filename, content):
            self.filename = filename
            self.content_type = "application/pdf"
            self.file = BytesIO(content)
            self._content = content
            
        async def read(self):
            return self._content
            
        async def seek(self, position):
            self.file.seek(position)
            
    return MockUploadFile("test_resume.pdf", pdf_content)


@pytest.fixture
def mock_invalid_file():
    """Create a mock invalid file for testing"""
    class MockUploadFile:
        def __init__(self):
            self.filename = "test_resume.txt"
            self.content_type = "text/plain"
            
    return MockUploadFile()


@pytest.fixture
def sample_analysis_response():
    """Sample analysis response data"""
    return {
        "match_score": 75.0,
        "summary": "Good fit with strong Python and FastAPI experience",
        "strengths": [
            "5+ years Python experience",
            "FastAPI framework expertise",
            "Docker deployment experience"
        ],
        "gaps": [
            "No Kubernetes experience mentioned",
            "Limited cloud platform experience"
        ],
        "recommendations": [
            "Gain Kubernetes certification",
            "Consider AWS or GCP training"
        ]
    }


@pytest.fixture(autouse=True)
def env_setup(monkeypatch):
    """Set up environment variables for testing"""
    monkeypatch.setenv("GOOGLE_API_KEY", "test-api-key-12345")
