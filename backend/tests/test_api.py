"""
Integration tests for REST API endpoints and Database persistence.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import backup_database


@pytest.mark.asyncio
async def test_api_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "ASHA" in data["app_name"]


@pytest.mark.asyncio
async def test_get_beneficiaries_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/beneficiaries")
        assert res.status_code == 200
        data = res.json()
        assert len(data) >= 5
        assert any(b["id"] == "BEN-KA-001" for b in data)


@pytest.mark.asyncio
async def test_get_single_beneficiary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/beneficiaries/BEN-KA-001")
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == "BEN-KA-001"
        assert "ಲಕ್ಷ್ಮಿ" in data["name"]

        # 404 for non-existent
        res_404 = await client.get("/api/beneficiaries/BEN-UNKNOWN")
        assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_confirm_visit_and_followup_generation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "record": {
                "beneficiary_id": "BEN-KA-001",
                "beneficiary_name": "ಲಕ್ಷ್ಮಿ",
                "visit_type": "ANC checkup",
                "weight": 54.0,
                "vaccinations_completed": ["TT injection"],
                "vaccinations_due": [],
                "next_visit_date": "2026-12-15",
                "additional_notes": "IFA tablets distributed",
            },
            "transcript_raw": "ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ BEN-KA-001, ANC checkup, weight 54 kg",
            "danger_flag": False,
            "referral_status": "NONE",
        }
        res = await client.post("/api/visits/confirm", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["visit"]["id"].startswith("VIS-")
        assert data["visit"]["weight"] == 54.0
        assert len(data["followups"]) >= 1
        assert "confirmation_audio_base64" in data

        # Check visit appears in GET /api/visits
        visits_res = await client.get("/api/visits")
        assert visits_res.status_code == 200
        visits = visits_res.json()
        assert any(v["id"] == data["visit"]["id"] for v in visits)

        # Check followups in GET /api/followups
        fu_res = await client.get("/api/followups?beneficiary_id=BEN-KA-001")
        assert fu_res.status_code == 200
        followups = fu_res.json()
        assert len(followups) >= 1


@pytest.mark.asyncio
async def test_correct_visit_field():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First create a visit
        create_payload = {
            "record": {
                "beneficiary_id": "BEN-KA-002",
                "beneficiary_name": "ಸುಮಿತ್ರಾ",
                "visit_type": "ANC checkup",
                "weight": 50.0,
                "vaccinations_completed": [],
                "vaccinations_due": [],
            },
            "transcript_raw": "Initial utterance",
        }
        create_res = await client.post("/api/visits/confirm", json=create_payload)
        visit_id = create_res.json()["visit"]["id"]

        # Apply correction to weight (e.g. from 50.0 to 52.5)
        correct_payload = {
            "visit_id": visit_id,
            "field_name": "weight",
            "new_value": 52.5,
        }
        correct_res = await client.post("/api/visits/correct", json=correct_payload)
        assert correct_res.status_code == 200
        correct_data = correct_res.json()
        assert correct_data["visit"]["weight"] == 52.5
        assert "52.5" in correct_data["ack_text"]
        assert "ack_audio_base64" in correct_data


def test_database_backup_mechanism():
    """Verifies that database backup creates a clean backup file."""
    backup_file = backup_database()
    assert backup_file is not None
    import os
    assert os.path.exists(backup_file)
