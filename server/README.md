# Recruiter First API

A FastAPI application for analyzing resumes against job descriptions.

## Project Structure

```
app/
├── main.py              # FastAPI app initialization and router configuration
├── api/                 # Route handlers
│   ├── health.py       # Health check endpoint
│   └── resume.py       # Resume analysis endpoints
├── models/             # Pydantic request/response schemas
│   ├── health.py       # Health check models
│   └── resume.py       # Resume analysis models
├── services/           # Business logic
│   └── resume_service.py
├── core/               # Configuration and settings
└── utils/              # Helper functions
```

## API Endpoints

### Root
- **GET** `/`
  - API introduction and available endpoints
  - Response:
    ```json
    {
      "name": "Recruiter First API",
      "version": "1.0.0",
      "description": "AI-powered resume analysis API...",
      "endpoints": ["..."]
    }
    ```

### Health Check
- **GET** `/health`
  - Check API service status
  - Response: `{"status": "healthy", "message": "Service is running"}`

### Resume Analysis
- **POST** `/api/v1/resume/analyze`
  - Analyze a resume PDF against a job description
  - **Parameters:**
    - `resume` (file): PDF file of the resume
    - `job_description` (form field): Text description of the job posting
  - **Response:**
    ```json
    {
      "match_score": 75.0,
      "summary": "Resume shows relevant experience...",
      "strengths": ["..."],
      "gaps": ["..."],
      "recommendations": ["..."]
    }
    ```

## Running the Application

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
uvicorn app.main:app --reload
```

3. Access the API:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- OpenAPI schema: http://localhost:8000/openapi.json

## Development

The application follows FastAPI best practices:
- Routes in `api/` contain only request/response handling
- Business logic is in `services/`
- Data models are in `models/`
- Proper error handling with HTTPException
- Type hints and documentation for all endpoints
