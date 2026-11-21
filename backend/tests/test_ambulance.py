"""
Unit and Integration tests for Ambulance Simulation Engine.
Verifies request creation, status lifecycle, location simulation, and strict simulation safety rules.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.ambulance_service import ambulance_service, AmbulanceStatus


@pytest.mark.asyncio
async def test_create_simulated_ambulance_request():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "beneficiary_id": "BEN-KA-001",
            "emergency_id": "DNG-TEST-001",
            "pickup_location": "Hoskote Village",
            "notes": "Emergency referral for vaginal bleeding"
        }
        res = await client.post("/api/ambulance/requests", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["id"].startswith("AMB-SIM-")
        assert data["status"] == "REQUESTED"
        assert data["is_simulation"] is True
        assert "SIMULATION ONLY" in data["simulation_disclaimer"]
        assert data["eta_minutes"] == 15
        assert data["vehicle_number"] == "KA-04-G-108"
        assert "ರಮೇಶ್" in data["driver_name"]


@pytest.mark.asyncio
async def test_step_simulation_lifecycle():
    """Verifies that simulation steps through REQUESTED -> DISPATCHED -> ON_THE_WAY -> ARRIVED -> COMPLETED."""
    created = ambulance_service.create_request(
        beneficiary_id="BEN-KA-002",
        pickup_location="Devanahalli",
        notes="Simulation step test"
    )
    req_id = created["id"]
    assert created["status"] == AmbulanceStatus.REQUESTED.value

    # Step 1: DISPATCHED
    s1 = ambulance_service.step_simulation(req_id)
    assert s1["status"] == AmbulanceStatus.DISPATCHED.value
    assert s1["eta_minutes"] == 12

    # Step 2: ON_THE_WAY
    s2 = ambulance_service.step_simulation(req_id)
    assert s2["status"] == AmbulanceStatus.ON_THE_WAY.value
    assert s2["eta_minutes"] == 6

    # Step 3: ARRIVED
    s3 = ambulance_service.step_simulation(req_id)
    assert s3["status"] == AmbulanceStatus.ARRIVED.value
    assert s3["eta_minutes"] == 0

    # Step 4: COMPLETED
    s4 = ambulance_service.step_simulation(req_id)
    assert s4["status"] == AmbulanceStatus.COMPLETED.value


@pytest.mark.asyncio
async def test_ambulance_tracking_telemetry():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create request
        created = ambulance_service.create_request(
            beneficiary_id="BEN-KA-004",
            pickup_location="Ramanagara",
        )
        req_id = created["id"]

        # Call tracking endpoint
        res = await client.get(f"/api/ambulance/requests/{req_id}/tracking")
        assert res.status_code == 200
        tracking = res.json()
        assert tracking["request_id"] == req_id
        assert tracking["status"] == "REQUESTED"
        assert tracking["progress_percentage"] == 10
        assert tracking["is_simulation"] is True
        assert "driver_name" in tracking
        assert "current_latitude" in tracking


@pytest.mark.asyncio
async def test_update_ambulance_location_manual():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        created = ambulance_service.create_request(
            beneficiary_id="BEN-KA-005",
            pickup_location="Channapatna",
        )
        req_id = created["id"]

        update_payload = {
            "current_latitude": 12.6600,
            "current_longitude": 77.2150,
            "eta_minutes": 4,
            "status": "ON_THE_WAY"
        }
        res = await client.patch(f"/api/ambulance/requests/{req_id}/location", json=update_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["current_latitude"] == 12.6600
        assert data["eta_minutes"] == 4
        assert data["status"] == "ON_THE_WAY"
