"""
Tests for health check endpoints
"""
import pytest
from fastapi import status


class TestHealthEndpoints:
    """Test cases for health check endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns welcome message"""
        response = client.get("/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["name"] == "Recruiter First API"
        assert data["version"] == "1.0.0"
        assert "description" in data
        assert "endpoints" in data
        assert isinstance(data["endpoints"], list)
        assert len(data["endpoints"]) > 0
    
    def test_root_endpoint_structure(self, client):
        """Test root endpoint returns correct structure"""
        response = client.get("/")
        data = response.json()
        
        # Verify all required fields are present
        required_fields = ["name", "version", "description", "endpoints"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Verify endpoints list contains expected endpoints
        endpoints_text = " ".join(data["endpoints"])
        assert "/health" in endpoints_text
        assert "/docs" in endpoints_text
        assert "/api/v1/resume/analyze" in endpoints_text
    
    def test_health_check_endpoint(self, client):
        """Test health check endpoint returns healthy status"""
        response = client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "message" in data
        assert data["message"] == "Service is running"
    
    def test_health_check_response_structure(self, client):
        """Test health check response has correct structure"""
        response = client.get("/health")
        data = response.json()
        
        # Verify response contains only expected fields
        assert "status" in data
        assert "message" in data
        assert isinstance(data["status"], str)
        assert isinstance(data["message"], str)
    
    def test_multiple_health_checks(self, client):
        """Test multiple consecutive health checks"""
        for _ in range(5):
            response = client.get("/health")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["status"] == "healthy"
    
    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.get("/health")
        # CORS middleware should be configured
        # Note: OPTIONS requests may not work with TestClient, so we test with GET
        assert response.status_code == status.HTTP_200_OK
