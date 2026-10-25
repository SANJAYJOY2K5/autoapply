from __future__ import annotations

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on Python sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.security import create_test_jwt


@pytest.fixture
def client() -> TestClient:
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def test_user_id() -> str:
    return "00000000-0000-0000-0000-000000000001"


@pytest.fixture
def test_user_email() -> str:
    return "fresher.chennai@example.com"


@pytest.fixture
def auth_token(test_user_id: str, test_user_email: str) -> str:
    """Generates a valid signed JWT for test user."""
    return create_test_jwt(user_id=test_user_id, email=test_user_email)


@pytest.fixture
def auth_headers(auth_token: str) -> dict:
    """Authorization headers with Bearer token."""
    return {"Authorization": f"Bearer {auth_token}"}
