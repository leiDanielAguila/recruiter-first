from unittest.mock import AsyncMock, patch

import pytest

from app.models.cover_letter import CoverLetterGenerateRequest
from app.services.cover_letter_service import generate_cover_letter


@pytest.mark.asyncio
async def test_generate_cover_letter_success():
    payload = CoverLetterGenerateRequest(
        job_title="Software Engineer",
        hiring_manager_name="",
        email="candidate@example.com",
        phone="+1-555-000-0000",
        requirements=["Python", "FastAPI", "SQL"],
        company="Acme",
    )

    mock_response = type("MockResponse", (), {"text": "Dear Acme Hiring Team,\n\nI am excited to apply."})()

    with patch(
        "app.services.cover_letter_service.client.aio.models.generate_content",
        new_callable=AsyncMock,
    ) as mock_generate:
        mock_generate.return_value = mock_response
        document = await generate_cover_letter(payload)

    assert document.cover_letter.startswith("Dear Acme Hiring Team")
    assert document.hiring_manager_name == "Acme Hiring Team"
    assert document.job_title == "Software Engineer"


@pytest.mark.asyncio
async def test_generate_cover_letter_raises_on_empty_ai_output():
    payload = CoverLetterGenerateRequest(
        job_title="Software Engineer",
        hiring_manager_name="Hiring Team",
        email="candidate@example.com",
        phone="+1-555-000-0000",
        requirements=["Python", "FastAPI", "SQL"],
        company="",
    )

    mock_response = type("MockResponse", (), {"text": ""})()

    with patch(
        "app.services.cover_letter_service.client.aio.models.generate_content",
        new_callable=AsyncMock,
    ) as mock_generate:
        mock_generate.return_value = mock_response
        with pytest.raises(ValueError):
            await generate_cover_letter(payload)


@pytest.mark.asyncio
async def test_generate_cover_letter_wraps_provider_error():
    payload = CoverLetterGenerateRequest(
        job_title="Software Engineer",
        hiring_manager_name="Hiring Team",
        email="candidate@example.com",
        phone="+1-555-000-0000",
        requirements=["Python", "FastAPI", "SQL"],
        company="",
    )

    with patch(
        "app.services.cover_letter_service.client.aio.models.generate_content",
        new_callable=AsyncMock,
    ) as mock_generate:
        mock_generate.side_effect = Exception("provider unavailable")
        with pytest.raises(RuntimeError):
            await generate_cover_letter(payload)
