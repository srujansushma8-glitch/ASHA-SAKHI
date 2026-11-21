"""
Database operations for Simulated Ambulance Requests.
Explicitly records simulation state and never makes real emergency calls.
"""

import uuid
from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.schemas.ambulance import AmbulanceRequestCreate


class AmbulanceRepository:
    @staticmethod
    def get_all(
        beneficiary_id: Optional[str] = None, status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM ambulance_requests WHERE 1=1"
            params = []
            if beneficiary_id:
                query += " AND beneficiary_id = ?"
                params.append(beneficiary_id)
            if status:
                query += " AND status = ?"
                params.append(status)
            query += " ORDER BY created_at DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def get_by_id(request_id: str) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ambulance_requests WHERE id = ?", (request_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def create(data: AmbulanceRequestCreate) -> Dict[str, Any]:
        request_id = f"AMB-SIM-{uuid.uuid4().hex[:6].upper()}"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO ambulance_requests (
                    id, beneficiary_id, emergency_id, visit_id, pickup_location,
                    status, vehicle_number, driver_name, driver_phone,
                    eta_minutes, current_latitude, current_longitude,
                    destination_facility, is_simulation, simulation_disclaimer,
                    notes, created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    'REQUESTED', 'KA-04-G-108', 'ರಮೇಶ್ (Ramesh)', '9876500108',
                    15, 13.0732, 77.7915,
                    ?, 1, 'SIMULATION ONLY - NOT A REAL 108 AMBULANCE DISPATCH',
                    ?, datetime('now'), datetime('now')
                )
                """,
                (
                    request_id,
                    data.beneficiary_id,
                    data.emergency_id,
                    data.visit_id,
                    data.pickup_location,
                    data.destination_facility or "Hoskote Taluk Hospital / PHC",
                    data.notes,
                ),
            )
            cursor.execute("SELECT * FROM ambulance_requests WHERE id = ?", (request_id,))
            return dict(cursor.fetchone())

    @staticmethod
    def update_status(
        request_id: str, new_status: str, notes: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = "UPDATE ambulance_requests SET status = ?, updated_at = datetime('now')"
            params = [new_status]
            if notes:
                query += ", notes = ?"
                params.append(notes)
            query += " WHERE id = ?"
            params.append(request_id)
            cursor.execute(query, params)
            cursor.execute("SELECT * FROM ambulance_requests WHERE id = ?", (request_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def update_location(
        request_id: str,
        current_latitude: float,
        current_longitude: float,
        eta_minutes: int,
        status: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if status:
                cursor.execute(
                    """
                    UPDATE ambulance_requests
                    SET current_latitude = ?, current_longitude = ?, eta_minutes = ?, status = ?, updated_at = datetime('now')
                    WHERE id = ?
                    """,
                    (current_latitude, current_longitude, eta_minutes, status, request_id),
                )
            else:
                cursor.execute(
                    """
                    UPDATE ambulance_requests
                    SET current_latitude = ?, current_longitude = ?, eta_minutes = ?, updated_at = datetime('now')
                    WHERE id = ?
                    """,
                    (current_latitude, current_longitude, eta_minutes, request_id),
                )
            cursor.execute("SELECT * FROM ambulance_requests WHERE id = ?", (request_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
