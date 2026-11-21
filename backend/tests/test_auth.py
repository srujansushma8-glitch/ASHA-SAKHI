"""
Unit and integration tests for Authentication and Authorization.
Verifies login for demo users (asha, supervisor), JWT token issuance,
protection on secured routers, and public access on health endpoint.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_auth_login_demo_users():
    transport = ASGITransport(app=app)
    # Explicitly empty auth header
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # 1. Login as asha
        res_asha = await client.post("/api/auth/login", json={"username": "asha"})
        assert res_asha.status_code == 200
        data_asha = res_asha.json()
        assert "access_token" in data_asha
        assert data_asha["token_type"] == "bearer"
        assert data_asha["role"] == "asha"
        assert data_asha["username"] == "asha"

        # 2. Login as supervisor
        res_sup = await client.post("/api/auth/login", json={"username": "supervisor"})
        assert res_sup.status_code == 200
        data_sup = res_sup.json()
        assert "access_token" in data_sup
        assert data_sup["role"] == "supervisor"

        # 3. Invalid credentials
        res_invalid = await client.post("/api/auth/login", json={"username": "unknown_user"})
        assert res_invalid.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoints_require_token():
    transport = ASGITransport(app=app)
    # Request without token
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # Public health endpoint returns 200
        res_health = await client.get("/api/health")
        assert res_health.status_code == 200

        # Protected endpoints return 401
        res_ben = await client.get("/api/beneficiaries")
        assert res_ben.status_code == 401

        res_visits = await client.get("/api/visits")
        assert res_visits.status_code == 401

        res_followups = await client.get("/api/followups")
        assert res_followups.status_code == 401

        res_ambulance = await client.get("/api/ambulance/requests")
        assert res_ambulance.status_code == 401

        res_sync = await client.get("/api/sync/delta")
        assert res_sync.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoints_with_valid_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Authorization": ""}) as client:
        # Login
        login_res = await client.post("/api/auth/login", json={"username": "asha"})
        token = login_res.json()["access_token"]

        # Call protected endpoint with valid Bearer token
        res = await client.get("/api/beneficiaries", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert len(res.json()) >= 1
