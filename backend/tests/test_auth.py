"""
Unit and integration tests for Authentication and Authorization.
Verifies:
- Password validation and rejection of bypasses / empty / invalid credentials
- Secure PBKDF2 password hashing and constant-time verification
- Signed JWT token creation, expiration handling, and validation
- Strict Role-Based Access Control (ASHA, Supervisor, Medical Officer)
- Protection of sensitive endpoints (/api/beneficiaries, /api/visits, /api/followups,
  /api/ambulance, /api/sync, /api/assistant/query, /api/visit-requests)
- Environment-based demo authentication guardrails and secret enforcement
"""

from datetime import timedelta
import pytest
from httpx import AsyncClient, ASGITransport
from jose import jwt

from app.main import app
from app.config import settings
from app.auth import (
    create_access_token,
    hash_password,
    verify_password,
    get_jwt_secret_key,
)


@pytest.mark.asyncio
async def test_auth_login_valid_credentials():
    """Valid credentials for demo accounts (asha, supervisor, medical_officer, anm, mo) succeed."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # 1. Login as asha
        res_asha = await client.post("/api/auth/login", json={"username": "asha", "password": "password"})
        assert res_asha.status_code == 200
        data_asha = res_asha.json()
        assert "access_token" in data_asha
        assert data_asha["token_type"] == "bearer"
        assert data_asha["role"] == "asha"
        assert data_asha["username"] == "asha"

        # 2. Login as supervisor
        res_sup = await client.post("/api/auth/login", json={"username": "supervisor", "password": "password"})
        assert res_sup.status_code == 200
        data_sup = res_sup.json()
        assert "access_token" in data_sup
        assert data_sup["role"] == "supervisor"

        # 3. Login as medical officer
        res_mo = await client.post("/api/auth/login", json={"username": "medical_officer", "password": "password"})
        assert res_mo.status_code == 200
        data_mo = res_mo.json()
        assert data_mo["role"] == "medical_officer"

        # 4. Login as aliases (mo, anm)
        res_mo_alias = await client.post("/api/auth/login", json={"username": "mo", "password": "password"})
        assert res_mo_alias.status_code == 200
        assert res_mo_alias.json()["role"] == "medical_officer"


@pytest.mark.asyncio
async def test_auth_login_requires_valid_password():
    """Missing, empty, wrong, or bypass passwords are strictly rejected."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # 1. Missing password field -> 422
        res_missing = await client.post("/api/auth/login", json={"username": "asha"})
        assert res_missing.status_code == 422

        # 2. Empty string password -> 401 or 422
        res_empty = await client.post("/api/auth/login", json={"username": "asha", "password": ""})
        assert res_empty.status_code in (401, 422)

        # 3. Whitespace-only password -> 401 or 422
        res_whitespace = await client.post("/api/auth/login", json={"username": "asha", "password": "   "})
        assert res_whitespace.status_code in (401, 422)

        # 4. Wrong password -> 401
        res_wrong = await client.post("/api/auth/login", json={"username": "asha", "password": "incorrect_password"})
        assert res_wrong.status_code == 401

        # 5. Former bypass: demo123 -> 401
        res_demo123 = await client.post("/api/auth/login", json={"username": "asha", "password": "demo123"})
        assert res_demo123.status_code == 401

        # 6. Former bypass: username as password -> 401
        res_user_as_pass = await client.post("/api/auth/login", json={"username": "asha", "password": "asha"})
        assert res_user_as_pass.status_code == 401

        # 7. Unknown user -> 401
        res_unknown = await client.post("/api/auth/login", json={"username": "non_existent_worker", "password": "password"})
        assert res_unknown.status_code == 401


def test_password_hashing_and_verification():
    """Tests PBKDF2-HMAC-SHA256 password hashing with salt and constant-time verification."""
    plain = "SecUr3_P@ssw0rd!_2026"
    hashed = hash_password(plain, iterations=1000)  # fast iteration count for unit test
    assert hashed.startswith("pbkdf2_sha256$1000$")
    assert verify_password(plain, hashed) is True
    assert verify_password("wrong_password", hashed) is False
    assert verify_password("", hashed) is False
    assert verify_password(plain, "") is False
    assert verify_password(plain, "malformed_hash") is False


@pytest.mark.asyncio
async def test_token_expiry_and_validation():
    """Expired or tampered JWT tokens return 401 Unauthorized."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # Create an expired token (expired 10 minutes ago)
        expired_token = create_access_token(
            data={"sub": "asha", "role": "asha"},
            expires_delta=timedelta(minutes=-10),
        )
        res_expired = await client.get("/api/beneficiaries", headers={"Authorization": f"Bearer {expired_token}"})
        assert res_expired.status_code == 401

        # Tampered / invalid token
        res_invalid = await client.get("/api/beneficiaries", headers={"Authorization": "Bearer invalid_signature_abc_123"})
        assert res_invalid.status_code == 401

        # Valid token succeeds
        valid_token = create_access_token(data={"sub": "asha", "role": "asha"})
        res_valid = await client.get("/api/beneficiaries", headers={"Authorization": f"Bearer {valid_token}"})
        assert res_valid.status_code == 200


@pytest.mark.asyncio
async def test_protected_endpoints_require_token():
    """All sensitive clinical, operational, and synchronization endpoints reject unauthenticated access."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # Public health check
        res_health = await client.get("/api/health")
        assert res_health.status_code == 200

        # Protected endpoints return 401 when token is missing
        assert (await client.get("/api/beneficiaries")).status_code == 401
        assert (await client.get("/api/visits")).status_code == 401
        assert (await client.get("/api/followups")).status_code == 401
        assert (await client.get("/api/ambulance/requests")).status_code == 401
        assert (await client.get("/api/sync/delta")).status_code == 401
        assert (await client.post("/api/assistant/query", json={"query": "Show pregnant women"})).status_code == 401
        assert (await client.get("/api/visit-requests")).status_code == 401


@pytest.mark.asyncio
async def test_role_permissions_enforcement():
    """Role-based access controls enforce permission boundaries between ASHA, Supervisor, and MO."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        asha_token = create_access_token(data={"sub": "asha", "role": "asha"})
        supervisor_token = create_access_token(data={"sub": "supervisor", "role": "supervisor"})
        mo_token = create_access_token(data={"sub": "medical_officer", "role": "medical_officer"})

        # 1. /api/auth/me returns current user profile
        me_asha = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {asha_token}"})
        assert me_asha.status_code == 200
        assert me_asha.json()["role"] == "asha"

        # 2. ASHA cannot access supervisor or MO endpoints
        asha_sup = await client.get("/api/auth/supervisor-only", headers={"Authorization": f"Bearer {asha_token}"})
        assert asha_sup.status_code == 403

        asha_mo = await client.get("/api/auth/medical-officer-only", headers={"Authorization": f"Bearer {asha_token}"})
        assert asha_mo.status_code == 403

        # 3. Supervisor can access supervisor endpoint, but not MO endpoint
        sup_sup = await client.get("/api/auth/supervisor-only", headers={"Authorization": f"Bearer {supervisor_token}"})
        assert sup_sup.status_code == 200

        sup_mo = await client.get("/api/auth/medical-officer-only", headers={"Authorization": f"Bearer {supervisor_token}"})
        assert sup_mo.status_code == 403

        # 4. Medical officer can access both supervisor and MO endpoints
        mo_sup = await client.get("/api/auth/supervisor-only", headers={"Authorization": f"Bearer {mo_token}"})
        assert mo_sup.status_code == 200

        mo_mo = await client.get("/api/auth/medical-officer-only", headers={"Authorization": f"Bearer {mo_token}"})
        assert mo_mo.status_code == 200


@pytest.mark.asyncio
async def test_demo_auth_disabled_in_production(monkeypatch):
    """In production or when ENABLE_DEMO_AUTH is False, demo authentication is rejected with 401."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # Case 1: ENABLE_DEMO_AUTH = False
        monkeypatch.setattr(settings, "ENABLE_DEMO_AUTH", False)
        res1 = await client.post("/api/auth/login", json={"username": "asha", "password": "password"})
        assert res1.status_code == 401

        # Case 2: APP_ENV = "production"
        monkeypatch.setattr(settings, "ENABLE_DEMO_AUTH", True)
        monkeypatch.setattr(settings, "APP_ENV", "production")
        res2 = await client.post("/api/auth/login", json={"username": "asha", "password": "password"})
        assert res2.status_code == 401


def test_jwt_secret_required_in_production(monkeypatch):
    """When running in production, get_jwt_secret_key() strictly raises RuntimeError if JWT_SECRET_KEY is empty."""
    monkeypatch.setattr(settings, "APP_ENV", "production")
    monkeypatch.setattr(settings, "JWT_SECRET_KEY", "")
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)

    with pytest.raises(RuntimeError) as exc_info:
        get_jwt_secret_key()
    assert "JWT_SECRET_KEY environment variable is required in production" in str(exc_info.value)
