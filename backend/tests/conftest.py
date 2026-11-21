"""
Pytest configuration and fixtures.
Ensures an isolated test database is used for tests.
"""

import os
import sys
from pathlib import Path
import pytest

# Ensure backend directory is in Python path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Use an isolated test database and test configuration
os.environ["DATABASE_URL"] = "sqlite:///./data/test_asha_sakhi.db"
os.environ["ASR_MODE"] = "mock"
os.environ["TTS_MODE"] = "mock"
os.environ["EXTRACTION_MODE"] = "deterministic"
os.environ["JWT_SECRET_KEY"] = "test_jwt_secret_key_for_unit_tests_only_2026"
os.environ["ENABLE_DEMO_AUTH"] = "True"

from app.config import settings
from app.database import init_db, get_db_connection

# Update settings database path and jwt key for testing
settings.DATABASE_PATH = BACKEND_DIR / "data" / "test_asha_sakhi.db"
settings.JWT_SECRET_KEY = "test_jwt_secret_key_for_unit_tests_only_2026"
settings.ENABLE_DEMO_AUTH = True


@pytest.fixture(autouse=True)
def setup_test_db():
    """Initializes a fresh test database for test runs."""
    test_db = settings.DATABASE_PATH
    test_db.parent.mkdir(parents=True, exist_ok=True)
    if test_db.exists():
        try:
            test_db.unlink()
        except Exception:
            pass

    init_db(seed_synthetic=True)
    yield
    # Cleanup after test session if needed


@pytest.fixture(scope="session")
def test_token() -> str:
    """Generates a valid test JWT for testing authenticated endpoints."""
    from app.auth import create_access_token
    return create_access_token(data={"sub": "asha", "role": "asha"})


@pytest.fixture(autouse=True)
def auto_auth_client(monkeypatch, test_token):
    """
    Ensures httpx.AsyncClient automatically carries the Authorization Bearer header
    for existing tests unless explicitly overridden.
    """
    from httpx import AsyncClient
    orig_init = AsyncClient.__init__

    def patched_init(self, *args, **kwargs):
        headers = kwargs.get("headers")
        if headers is None:
            headers = {}
        elif not isinstance(headers, dict):
            headers = dict(headers)
        else:
            headers = dict(headers)

        if "Authorization" not in headers and "authorization" not in headers:
            headers["Authorization"] = f"Bearer {test_token}"
        kwargs["headers"] = headers
        orig_init(self, *args, **kwargs)

    monkeypatch.setattr(AsyncClient, "__init__", patched_init)
