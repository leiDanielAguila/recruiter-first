# Quick Test Reference Guide

## For Developers

### Installation
```bash
cd server
pip install -r requirements-test.txt
```

### Running Tests
```bash
# All tests
pytest

# Specific file
pytest tests/test_health.py

# Specific test
pytest tests/test_health.py::TestHealthEndpoints::test_health_check_endpoint

# With coverage
pytest --cov=app --cov-report=html

# Use the script
./run_tests.sh          # All tests
./run_tests.sh coverage # With coverage report
./run_tests.sh quick    # Stop on first failure
```

## For AI Agents

### Simple Test Execution
```bash
cd /path/to/server
source .venv/bin/activate
pytest
```

### Expected Output
- ✅ Exit code 0 = All tests passed
- ❌ Exit code 1 = Tests failed
- 📊 45 tests should run
- 📈 ~99% code coverage

### CI/CD Integration
```bash
# Install dependencies
pip install -r requirements-test.txt

# Run tests with coverage
pytest --cov=app --cov-report=term --cov-report=xml -v

# Check exit code
echo $?  # Should be 0 for success
```

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures
├── test_health.py           # 6 tests - Health endpoints
├── test_models.py           # 14 tests - Pydantic models
├── test_pdf_service.py      # 7 tests - PDF extraction
├── test_resume_service.py   # 9 tests - Analysis service
└── test_resume_endpoints.py # 9 tests - Resume API endpoints
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `pytest` | Run all tests |
| `pytest -v` | Verbose output |
| `pytest -x` | Stop on first failure |
| `pytest -k "health"` | Run tests matching "health" |
| `pytest --lf` | Run last failed tests |
| `pytest --cov=app` | Run with coverage |
| `./run_tests.sh` | Use convenience script |

## Troubleshooting

### Import Errors
```bash
# Ensure you're in server directory
cd server
pytest
```

### Environment Issues
```bash
# Activate virtual environment
source .venv/bin/activate
pip install -r requirements-test.txt
```

### Async Warnings
These are normal deprecation warnings from pytest-asyncio and can be safely ignored.

## Test Categories

- **Unit Tests**: All mocked, no external dependencies
- **Integration Tests**: N/A (coming later)
- **E2E Tests**: N/A (coming later)

## Coverage Goals

- ✅ Current: 99% (99/100 statements)
- 🎯 Target: 95%+ for production code
- 📊 View report: `pytest --cov=app --cov-report=html` then open `htmlcov/index.html`
