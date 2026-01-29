#!/bin/bash
# Test runner script for Recruiter First API

set -e  # Exit on error

echo "=================================="
echo "Recruiter First API - Test Runner"
echo "=================================="
echo ""

# Check if we're in the server directory
if [ ! -f "requirements.txt" ]; then
    echo "Error: Please run this script from the server directory"
    exit 1
fi

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Warning: Virtual environment not activated"
    echo "Attempting to activate .venv..."
    
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
        echo "✓ Virtual environment activated"
    else
        echo "Error: No virtual environment found. Please create one first:"
        echo "  python3 -m venv .venv"
        echo "  source .venv/bin/activate"
        exit 1
    fi
fi

echo ""
echo "Installing test dependencies..."
pip install -q -r requirements-test.txt

echo ""
echo "Running tests..."
echo "=================================="
echo ""

# Run tests based on argument
case "${1:-all}" in
    "all")
        pytest -v
        ;;
    "coverage")
        pytest --cov=app --cov-report=term-missing --cov-report=html
        echo ""
        echo "Coverage report generated in htmlcov/index.html"
        ;;
    "quick")
        pytest -v -x
        ;;
    "health")
        pytest -v tests/test_health.py
        ;;
    "endpoints")
        pytest -v tests/test_resume_endpoints.py
        ;;
    "services")
        pytest -v tests/test_pdf_service.py tests/test_resume_service.py
        ;;
    "models")
        pytest -v tests/test_models.py
        ;;
    "ci")
        # CI mode - quiet, with coverage, XML output
        pytest --cov=app --cov-report=xml --cov-report=term -q
        ;;
    *)
        echo "Usage: ./run_tests.sh [all|coverage|quick|health|endpoints|services|models|ci]"
        echo ""
        echo "Options:"
        echo "  all        - Run all tests (default)"
        echo "  coverage   - Run with coverage report"
        echo "  quick      - Run until first failure"
        echo "  health     - Run only health check tests"
        echo "  endpoints  - Run only endpoint tests"
        echo "  services   - Run only service tests"
        echo "  models     - Run only model tests"
        echo "  ci         - CI mode (quiet, with XML coverage)"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "Tests completed!"
echo "=================================="
