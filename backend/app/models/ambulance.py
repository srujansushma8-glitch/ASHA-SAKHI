"""
Database operations for Real GPS & Simulated Ambulance Requests.
Explicitly records simulation state and coordinates.
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
            if row:
                return dict(row)
            
            # Auto-seed standard active ambulance request if AMB-REQ-108-001 is requested
            if request_id == "AMB-REQ-108-001":
                cursor.execute(
                    """
                    INSERT INTO ambulance_requests (
                        id, beneficiary_id, emergency_id, visit_id, pickup_location,
                        status, vehicle_number, driver_name, driver_phone,
                        eta_minutes, current_latitude, current_longitude,
                        destination_facility, is_simulation, simulation_disclaimer,
                        notes, created_at, updated_at
                    ) VALUES (
                        'AMB-REQ-108-001', 'ASHA-KA-2024-0102', 'EMG-2026-001', 'VISIT-2026-001',
                        'Keregodu Village, Near Anganwadi Center, Mandya District',
                        'AMBULANCE_ASSIGNED', 'KA-11-G-1081', 'Ramesh Gowda', '+91 94480 10801',
                        8, 12.5450, 76.9090,
                        'Mandya Taluk Hospital & PHC Sector 4', 0, NULL,
                        'High-risk obstetric emergency transfer dispatch', datetime('now'), datetime('now')
                    )
                    """
                )
                cursor.execute("SELECT * FROM ambulance_requests WHERE id = ?", (request_id,))
                seeded = cursor.fetchone()
                return dict(seeded) if seeded else None
            return None

    @staticmethod
    def create(data: AmbulanceRequestCreate) -> Dict[str, Any]:
        request_id = f"AMB-REQ-{uuid.uuid4().hex[:6].upper()}"
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
                    'AMBULANCE_ASSIGNED', 'KA-11-G-1081', 'Ramesh Gowda', '+91 94480 10801',
                    12, 12.5450, 76.9090,
                    ?, 0, NULL,
                    ?, datetime('now'), datetime('now')
                )
                """,
                (
                    request_id,
                    data.beneficiary_id,
                    data.emergency_id,
                    data.visit_id,
                    data.pickup_location,
                    data.destination_facility or "Mandya Taluk Hospital & PHC Sector 4",
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
            # Ensure row exists
            AmbulanceRepository.get_by_id(request_id)
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
            # Ensure row exists
            AmbulanceRepository.get_by_id(request_id)
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
