# Test Suite Documentation

This directory contains comprehensive unit tests for the Recruiter First API.

## Test Structure

```
tests/
├── __init__.py                  # Package initialization
├── conftest.py                  # Shared fixtures and test configuration
├── test_health.py               # Health check endpoint tests
├── test_resume_endpoints.py     # Resume analysis endpoint tests
├── test_pdf_service.py          # PDF extraction service tests
├── test_resume_service.py       # Resume analysis service tests
└── test_models.py               # Pydantic model validation tests
```

## Test Coverage

### Endpoints (`test_health.py`, `test_resume_endpoints.py`)
- ✅ Health check endpoint
- ✅ Root/welcome endpoint
- ✅ Resume analysis endpoint
- ✅ Input validation
- ✅ Error handling
- ✅ CORS configuration

### Services (`test_pdf_service.py`, `test_resume_service.py`)
- ✅ PDF text extraction
- ✅ Multi-page PDF handling
- ✅ Empty/invalid PDF handling
- ✅ LLM integration
- ✅ Response parsing
- ✅ Error scenarios

### Models (`test_models.py`)
- ✅ Pydantic model validation
- ✅ Field constraints
- ✅ Default values
- ✅ JSON serialization

## Running Tests

### Install Test Dependencies

```bash
# Install test requirements
pip install -r requirements-test.txt
```

### Run All Tests

```bash
# Run all tests with verbose output
pytest

# Run all tests in quiet mode
pytest -q

# Run with detailed output
pytest -v
```

### Run Specific Test Files

```bash
# Run only health tests
pytest tests/test_health.py

# Run only endpoint tests
pytest tests/test_resume_endpoints.py

# Run only service tests
pytest tests/test_pdf_service.py tests/test_resume_service.py
```

### Run Specific Test Classes or Functions

```bash
# Run a specific test class
pytest tests/test_health.py::TestHealthEndpoints

# Run a specific test function
pytest tests/test_health.py::TestHealthEndpoints::test_health_check_endpoint
```

### Run with Coverage

```bash
# Run tests with coverage report
pytest --cov=app

# Run with coverage and HTML report
pytest --cov=app --cov-report=html

# Run with coverage and show missing lines
pytest --cov=app --cov-report=term-missing
```

### Run Tests in Parallel

```bash
# Install pytest-xdist first: pip install pytest-xdist
pytest -n auto
```

## For AI Agents

This test suite is designed to be easily run by AI agents for automated testing:

### Simple Command
```bash
pytest
```

### With Coverage
```bash
pytest --cov=app --cov-report=term-missing
```

### Exit Codes
- `0` - All tests passed
- `1` - Tests failed
- `2` - Test execution was interrupted
- `3` - Internal error
- `4` - pytest command line usage error
- `5` - No tests collected

### CI/CD Integration

Example for GitHub Actions:
```yaml
- name: Run tests
  run: |
    pip install -r requirements-test.txt
    pytest --cov=app --cov-report=xml
```

Example for GitLab CI:
```yaml
test:
  script:
    - pip install -r requirements-test.txt
    - pytest --cov=app --cov-report=term
```

## Test Fixtures

Common fixtures available in `conftest.py`:

- `client`: FastAPI TestClient for endpoint testing
- `sample_job_description`: Sample job posting text
- `sample_resume_text`: Sample resume content
- `mock_pdf_file`: Mock PDF file for testing
- `sample_analysis_response`: Sample analysis result
- `env_setup`: Auto-configured environment variables

## Writing New Tests

### Example Test Structure

```python
import pytest
from fastapi import status

class TestNewFeature:
    """Test cases for new feature"""
    
    def test_feature_success(self, client):
        """Test successful scenario"""
        response = client.get("/new-endpoint")
        
        assert response.status_code == status.HTTP_200_OK
        assert "expected_field" in response.json()
    
    @pytest.mark.asyncio
    async def test_async_function(self):
        """Test async function"""
        result = await some_async_function()
        assert result is not None
```

### Best Practices

1. **Use descriptive test names** - Test name should describe what is being tested
2. **One assertion per concept** - Focus each test on a single behavior
3. **Use fixtures** - Reuse common setup code via fixtures
4. **Mock external dependencies** - Don't make real API calls in tests
5. **Test edge cases** - Include boundary conditions and error scenarios
6. **Keep tests independent** - Tests should not depend on each other

## Troubleshooting

### Import Errors
If you get import errors, ensure you're running from the server directory:
```bash
cd /path/to/server
pytest
```

### Async Test Issues
Make sure `pytest-asyncio` is installed:
```bash
pip install pytest-asyncio
```

### Mock Not Working
Ensure you're patching the correct path:
```python
# Patch where it's used, not where it's defined
@patch('app.services.resume_service.extract_text_from_pdf')
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. They:
- ✅ Don't require external services (all mocked)
- ✅ Run quickly (no network calls)
- ✅ Are deterministic (no flaky tests)
- ✅ Provide clear error messages
- ✅ Support parallel execution
