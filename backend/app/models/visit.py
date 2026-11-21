"""
Database operations for Visit entities.
"""

import json
import uuid
from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.schemas.visit import VisitCreate


class VisitRepository:
    @staticmethod
    def get_all(limit: int = 50) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM visits ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            results = []
            for row in rows:
                item = dict(row)
                item["vaccinations_due"] = json.loads(item["vaccinations_due"]) if item["vaccinations_due"] else []
                item["vaccinations_completed"] = json.loads(item["vaccinations_completed"]) if item["vaccinations_completed"] else []
                item["is_confirmed"] = bool(item["is_confirmed"])
                item["danger_flag"] = bool(item["danger_flag"])
                results.append(item)
            return results

    @staticmethod
    def get_by_id(visit_id: str) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM visits WHERE id = ?", (visit_id,))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            item["vaccinations_due"] = json.loads(item["vaccinations_due"]) if item["vaccinations_due"] else []
            item["vaccinations_completed"] = json.loads(item["vaccinations_completed"]) if item["vaccinations_completed"] else []
            item["is_confirmed"] = bool(item["is_confirmed"])
            item["danger_flag"] = bool(item["danger_flag"])
            return item

    @staticmethod
    def get_by_beneficiary_id(beneficiary_id: str) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM visits WHERE beneficiary_id = ? ORDER BY created_at DESC", (beneficiary_id,))
            rows = cursor.fetchall()
            results = []
            for row in rows:
                item = dict(row)
                item["vaccinations_due"] = json.loads(item["vaccinations_due"]) if item["vaccinations_due"] else []
                item["vaccinations_completed"] = json.loads(item["vaccinations_completed"]) if item["vaccinations_completed"] else []
                item["is_confirmed"] = bool(item["is_confirmed"])
                item["danger_flag"] = bool(item["danger_flag"])
                results.append(item)
            return results

    @staticmethod
    def create(data: VisitCreate) -> Dict[str, Any]:
        visit_id = f"VIS-{uuid.uuid4().hex[:8].upper()}"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO visits (
                    id, beneficiary_id, beneficiary_name, visit_type, visit_date, weight,
                    vaccinations_due, vaccinations_completed, next_visit_date, additional_notes,
                    transcript_raw, is_confirmed, danger_flag, referral_status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    visit_id,
                    data.beneficiary_id,
                    data.beneficiary_name,
                    data.visit_type,
                    data.visit_date,
                    data.weight,
                    json.dumps(data.vaccinations_due, ensure_ascii=False),
                    json.dumps(data.vaccinations_completed, ensure_ascii=False),
                    data.next_visit_date,
                    data.additional_notes,
                    data.transcript_raw,
                    1 if data.is_confirmed else 0,
                    1 if data.danger_flag else 0,
                    data.referral_status,
                ),
            )
            cursor.execute("SELECT * FROM visits WHERE id = ?", (visit_id,))
            row = cursor.fetchone()
            item = dict(row)
            item["vaccinations_due"] = json.loads(item["vaccinations_due"]) if item["vaccinations_due"] else []
            item["vaccinations_completed"] = json.loads(item["vaccinations_completed"]) if item["vaccinations_completed"] else []
            item["is_confirmed"] = bool(item["is_confirmed"])
            item["danger_flag"] = bool(item["danger_flag"])
            return item

    @staticmethod
    def update_field(visit_id: str, field_name: str, new_value: Any) -> Optional[Dict[str, Any]]:
        allowed_fields = {
            "weight", "beneficiary_name", "beneficiary_id", "visit_type",
            "next_visit_date", "additional_notes", "vaccinations_due", "vaccinations_completed",
            "is_confirmed", "danger_flag", "referral_status"
        }
        if field_name not in allowed_fields:
            raise ValueError(f"Field '{field_name}' cannot be updated.")

        val_to_store = new_value
        if field_name in ["vaccinations_due", "vaccinations_completed"] and isinstance(new_value, list):
            val_to_store = json.dumps(new_value, ensure_ascii=False)
        elif field_name in ["is_confirmed", "danger_flag"]:
            val_to_store = 1 if new_value else 0

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE visits SET {field_name} = ? WHERE id = ?", (val_to_store, visit_id))
            cursor.execute("SELECT * FROM visits WHERE id = ?", (visit_id,))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            item["vaccinations_due"] = json.loads(item["vaccinations_due"]) if item["vaccinations_due"] else []
            item["vaccinations_completed"] = json.loads(item["vaccinations_completed"]) if item["vaccinations_completed"] else []
            item["is_confirmed"] = bool(item["is_confirmed"])
            item["danger_flag"] = bool(item["danger_flag"])
            return item
