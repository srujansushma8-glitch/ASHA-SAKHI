import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.database import get_db_connection

class VisitRequestCreate(BaseModel):
    beneficiary_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    village: str = Field(..., min_length=2)
    service_type: str = Field(...)
    preferred_date: str = Field(...)
    concern: Optional[str] = None

class VisitRequestResponse(BaseModel):
    id: str
    beneficiary_name: str
    phone: str
    village: str
    service_type: str
    preferred_date: str
    concern: Optional[str]
    status: str
    assigned_worker: str
    created_at: str

class VisitRequestRepository:
    @staticmethod
    def create(req: VisitRequestCreate) -> Dict[str, Any]:
        req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
        created_at = datetime.now().isoformat()
        assigned_worker = "Sunita Devi (ASHA)"
        status = "PENDING"

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO visit_requests (
                    id, beneficiary_name, phone, village, service_type, preferred_date, concern, status, assigned_worker, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    req_id,
                    req.beneficiary_name,
                    req.phone,
                    req.village,
                    req.service_type,
                    req.preferred_date,
                    req.concern or "Requested via ASHA Sakhi web portal",
                    status,
                    assigned_worker,
                    created_at
                )
            )

        return {
            "id": req_id,
            "beneficiary_name": req.beneficiary_name,
            "phone": req.phone,
            "village": req.village,
            "service_type": req.service_type,
            "preferred_date": req.preferred_date,
            "concern": req.concern,
            "status": status,
            "assigned_worker": assigned_worker,
            "created_at": created_at
        }

    @staticmethod
    def get_all(status: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if status:
                cursor.execute("SELECT * FROM visit_requests WHERE status = ? ORDER BY created_at DESC", (status,))
            else:
                cursor.execute("SELECT * FROM visit_requests ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def update_status(req_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE visit_requests SET status = ? WHERE id = ?", (new_status, req_id))
            cursor.execute("SELECT * FROM visit_requests WHERE id = ?", (req_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
