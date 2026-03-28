"""Tests for job application service requirement generation and merge behavior."""

from uuid import uuid4
from unittest.mock import AsyncMock, patch
from typing import cast

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.job_application import JobApplicationCreate
from app.services.job_application_service import create_job_application


class _FakeDB:
    def __init__(self) -> None:
        self.added = None
        self.committed = False
        self.refreshed = False
        self.rolled_back = False

    def add(self, model) -> None:
        self.added = model

    def commit(self) -> None:
        self.committed = True

    def refresh(self, model) -> None:
        self.refreshed = True

    def rollback(self) -> None:
        self.rolled_back = True


@pytest.mark.asyncio
async def test_create_job_application_skips_ai_when_manual_has_five():
    db = _FakeDB()
    application = JobApplicationCreate(
        job="Backend Engineer",
        company="Acme",
        date="2026-03-28",
        status="Applied",
        description="Detailed backend engineering role description.",
        hiring_manager_name="",
        requirements=["Python", "FastAPI", "SQL", "Docker", "Kubernetes"],
    )

    with patch(
        "app.services.job_application_service.generate_job_requirements_from_description",
        new_callable=AsyncMock,
    ) as mock_generate:
        result = await create_job_application(cast(Session, db), uuid4(), application)

    assert db.committed is True
    assert db.refreshed is True
    assert mock_generate.await_count == 0
    assert cast(list[str], result.requirements) == ["Python", "FastAPI", "SQL", "Docker", "Kubernetes"]


@pytest.mark.asyncio
async def test_create_job_application_merges_manual_then_ai_with_normalized_dedupe():
    db = _FakeDB()
    application = JobApplicationCreate(
        job="Backend Engineer",
        company="Acme",
        date="2026-03-28",
        status="Applied",
        description="Strong backend role with cloud and API ownership.",
        hiring_manager_name="",
        requirements=[" Python ", "fastapi"],
    )

    with patch(
        "app.services.job_application_service.generate_job_requirements_from_description",
        new_callable=AsyncMock,
    ) as mock_generate:
        mock_generate.return_value.requirements = [
            "FastAPI",
            "Docker",
            " SQL  ",
            "Python",
            "AWS",
        ]

        result = await create_job_application(cast(Session, db), uuid4(), application)

    assert db.committed is True
    assert mock_generate.await_count == 1
    assert cast(list[str], result.requirements) == ["Python", "fastapi", "Docker", "SQL", "AWS"]


@pytest.mark.asyncio
async def test_create_job_application_requires_description_when_manual_under_five():
    db = _FakeDB()
    application = JobApplicationCreate.model_construct(
        job="Backend Engineer",
        company="Acme",
        date="2026-03-28",
        status="Applied",
        description="   ",
        hiring_manager_name="",
        requirements=["Python", "FastAPI"],
    )

    with pytest.raises(HTTPException) as error:
        await create_job_application(cast(Session, db), uuid4(), application)

    assert error.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "job description is required" in error.value.detail.lower()
    assert db.committed is False


@pytest.mark.asyncio
async def test_create_job_application_requires_description_even_when_manual_has_five():
    db = _FakeDB()
    application = JobApplicationCreate.model_construct(
        job="Backend Engineer",
        company="Acme",
        date="2026-03-28",
        status="Applied",
        description="   ",
        hiring_manager_name="",
        requirements=["Python", "FastAPI", "SQL", "Docker", "Kubernetes"],
    )

    with pytest.raises(HTTPException) as error:
        await create_job_application(cast(Session, db), uuid4(), application)

    assert error.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "job description is required" in error.value.detail.lower()
    assert db.committed is False


@pytest.mark.asyncio
async def test_create_job_application_returns_502_when_ai_generation_fails():
    db = _FakeDB()
    application = JobApplicationCreate(
        job="Backend Engineer",
        company="Acme",
        date="2026-03-28",
        status="Applied",
        description="Role requires distributed systems knowledge.",
        hiring_manager_name="",
        requirements=["Python"],
    )

    with patch(
        "app.services.job_application_service.generate_job_requirements_from_description",
        new_callable=AsyncMock,
    ) as mock_generate:
        mock_generate.side_effect = RuntimeError("Model unavailable")

        with pytest.raises(HTTPException) as error:
            await create_job_application(cast(Session, db), uuid4(), application)

    assert error.value.status_code == status.HTTP_502_BAD_GATEWAY
    assert db.committed is False
