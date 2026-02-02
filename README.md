# Recruiter First

A web application that analyzes PDF resumes against job descriptions using AI-powered matching. The application provides a match score, identifies candidate strengths and gaps, and generates specific interview questions to assess areas where the candidate may need further evaluation.

> **Note:** This project is primarily a learning platform for exploring CI/CD pipelines, automated testing, and deployment orchestration practices.

## 🎯 Features

- **PDF Resume Parsing**: Automatically extracts text from uploaded PDF resumes using PyMuPDF
- **AI-Powered Analysis**: Uses LLM (Claude or GPT-4) to analyze resume-job description fit
- **Match Scoring**: Provides a quantitative match score between candidate and role
- **Gap Analysis**: Identifies specific areas where the candidate may lack experience
- **Interview Questions**: Generates targeted interview questions based on identified gaps
- **REST API**: FastAPI-based backend with async support

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.14** - Core programming language
- **PyMuPDF** - PDF text extraction library
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server for running the application

### API & Integration
- **LLM Integration** - Claude/GPT-4 for resume analysis (planned)
- **CORS Middleware** - Cross-origin resource sharing support

### Development Tools
- **Python Virtual Environment** - Isolated dependency management
- **Git** - Version control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.10 or higher
- pip (Python package manager)
- Git

## 🚀 Installation

Follow these steps to set up the application locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd recruiter-first
```

### 2. Set Up the Backend

Navigate to the server directory and create a virtual environment:

```bash
cd server
python3 -m venv .venv
```

### 3. Activate Virtual Environment

**On macOS/Linux:**
```bash
source .venv/bin/activate
```

**On Windows:**
```bash
.venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables (Optional)

Create a `.env` file in the `server` directory for any API keys or configuration:

```bash
# Example .env file
# LLM_API_KEY=your_api_key_here
# LLM_MODEL=claude-3-opus-20240229
```

### 6. Run the Application

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`

### 7. Access API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
recruiter-first/
├── client/              # Frontend application (to be implemented)
├── server/              # Backend API
│   ├── app/
│   │   ├── api/        # API endpoints
│   │   ├── core/       # Core configuration
│   │   ├── models/     # Pydantic models
│   │   ├── services/   # Business logic
│   │   └── main.py     # Application entry point
│   ├── requirements.txt
│   └── .venv/
└── README.md
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```
Returns the API health status.

### Resume Analysis
```
POST /api/v1/resume/analyze
```
**Parameters:**
- `resume` (file): PDF file of the candidate's resume
- `job_description` (form data): Text description of the job posting

**Response:**
```json
{
  "match_score": 75.0,
  "summary": "Overall analysis summary",
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
```

## 🧪 Testing

The project includes a comprehensive test suite with **45 unit tests** achieving **99% code coverage**.

### Quick Start

```bash
cd server

# Install test dependencies
pip install -r requirements-test.txt

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=term-missing

# Use the convenience script
./run_tests.sh
```

### Test Categories

- **Health Checks** (6 tests): API health and welcome endpoints
- **Models** (14 tests): Pydantic model validation and constraints
- **PDF Service** (7 tests): PDF text extraction functionality
- **Resume Service** (9 tests): LLM integration and analysis logic
- **API Endpoints** (9 tests): Request validation and error handling

### For AI Agents / CI/CD

```bash
# Simple command for automated testing
cd server && source .venv/bin/activate && pytest

# With coverage for CI pipelines
cd server && source .venv/bin/activate && pytest --cov=app --cov-report=xml

# Exit codes: 0 = success, 1 = tests failed
```

See `server/tests/README.md` for detailed documentation.

## 🚢 CI/CD & Deployment

This project serves as a learning environment for:
- **Continuous Integration**: Automated testing and code quality checks
- **Continuous Deployment**: Automated deployment pipelines
- **Infrastructure as Code**: Automated infrastructure provisioning
- **Container Orchestration**: Docker and Kubernetes workflows

CI/CD configurations and deployment scripts will be added as the project evolves.

## 🤝 Contributing

This is a learning project, but contributions and suggestions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is for educational purposes.

## 🔮 Roadmap

- [ ] Implement LLM integration for resume analysis
- [ ] Build frontend client application
- [ ] Add user authentication
- [ ] Set up CI/CD pipeline
- [ ] Add automated testing suite
- [ ] Implement Docker containerization
- [ ] Deploy to cloud platform
- [ ] Add monitoring and logging
