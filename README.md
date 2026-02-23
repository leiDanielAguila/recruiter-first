# Recruiter First

An AI-powered resume analysis tool that matches PDF resumes against job descriptions. This is a **proof of concept** demonstrating how AI agents can automate recruiting workflows by extracting resume content, analyzing candidate-role fit, and generating targeted interview questions.

## Purpose

This project showcases the integration of AI agents into real-world HR workflows, automating the time-consuming process of resume screening and initial candidate assessment.

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- TailwindCSS + ShadCN UI
- Zustand (state management)
- React Router

### Backend

- FastAPI (Python 3.14)
- PyMuPDF (PDF parsing)
- Pydantic (validation)
- SlowAPI (rate limiting)
- LLM Integration (Claude/GPT-4)

### Testing

- Pytest (99% code coverage, 45 unit tests)

---

## Getting Started

<details>
<summary><b>📦 Installation</b></summary>

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd client
npm install
```

### Environment Variables

Create `server/.env`:

```bash
# LLM_API_KEY=your_api_key_here
# LLM_MODEL=claude-3-opus-20240229
```

</details>

<details>
<summary><b>🚀 Running the Application</b></summary>

### Start Backend

```bash
cd server
source .venv/bin/activate
uvicorn app.main:app --reload
```

API runs at: `http://localhost:8000`

### Start Frontend

```bash
cd client
npm run dev
```

Client runs at: `http://localhost:5173`

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

</details>

<details>
<summary><b>🧪 Running Tests</b></summary>

```bash
cd server
source .venv/bin/activate

# Install test dependencies
pip install -r requirements-test.txt

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=term-missing

# Quick script
./run_tests.sh
```

**Test Coverage**: 99% across 45 unit tests covering API endpoints, models, services, and PDF parsing.

</details>

<details>
<summary><b>📁 Project Structure</b></summary>

```
recruiter-first/
├── client/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # UI components (ShadCN)
│   │   ├── services/    # API clients
│   │   └── config/      # Configuration
│   └── package.json
│
└── server/              # FastAPI backend
    ├── app/
    │   ├── api/         # Route handlers
    │   ├── models/      # Pydantic schemas
    │   ├── services/    # Business logic
    │   └── core/        # Configuration
    ├── tests/           # Unit tests (99% coverage)
    └── requirements.txt
```

</details>

<details>
<summary><b>🔌 API Endpoints</b></summary>

### Health Check

```http
GET /health
```

### Resume Analysis

```http
POST /api/v1/resume/analyze
Content-Type: multipart/form-data
```

**Parameters:**

- `resume` (file): PDF file
- `job_description` (text): Job posting text

**Response:**

```json
{
  "match_score": 75.0,
  "summary": "Overall fit analysis",
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
```

</details>

---

## License

Educational purposes only.
