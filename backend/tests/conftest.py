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

# Use an isolated test database
os.environ["DATABASE_URL"] = "sqlite:///./data/test_asha_sakhi.db"
os.environ["ASR_MODE"] = "mock"
os.environ["TTS_MODE"] = "mock"
os.environ["EXTRACTION_MODE"] = "deterministic"

from app.config import settings
from app.database import init_db, get_db_connection

# Update settings database path for testing
settings.DATABASE_PATH = BACKEND_DIR / "data" / "test_asha_sakhi.db"


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
