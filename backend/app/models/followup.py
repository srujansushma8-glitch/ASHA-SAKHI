"""
Database operations for Followup tasks.
"""

import uuid
from datetime import date
from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.schemas.followup import FollowupCreate


class FollowupRepository:
    @staticmethod
    def get_all(beneficiary_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = """
                SELECT 
                    f.id, f.visit_id, f.beneficiary_id, f.task_type, f.due_date, 
                    f.priority, f.completion_status, f.notes, f.guideline_source, f.created_at,
                    b.name AS beneficiary_name,
                    b.village AS village,
                    b.category AS beneficiary_category,
                    b.phone AS phone
                FROM followups f
                LEFT JOIN beneficiaries b ON f.beneficiary_id = b.id
                WHERE 1=1
            """
            params = []
            if beneficiary_id:
                query += " AND f.beneficiary_id = ?"
                params.append(beneficiary_id)
            if status:
                query += " AND f.completion_status = ?"
                params.append(status.upper())
            query += " ORDER BY f.due_date ASC, f.priority DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            results = []
            today_str = date.today().isoformat()

            for row in rows:
                item = dict(row)
                task = (item.get("task_type") or "").upper()
                priority = (item.get("priority") or "").upper()
                raw_status = (item.get("completion_status") or "PENDING").upper()

                # Infer clinical category
                if "ANC" in task or "PREGNAN" in task or "TRIMESTER" in task:
                    item["category"] = "ANC"
                elif "IMMUNIZ" in task or "VACCIN" in task or "PENTAVALENT" in task or "OPV" in task:
                    item["category"] = "Immunization"
                elif "NEWBORN" in task or "HBNC" in task or "INFANT" in task:
                    item["category"] = "Newborn"
                elif "DANGER" in task or "HIGH" in priority or "URGENT" in priority:
                    item["category"] = "High Risk"
                else:
                    item["category"] = item.get("beneficiary_category") or "General"

                # Compute risk level based on priority
                if priority in {"CRITICAL", "URGENT", "HIGH"}:
                    item["risk_level"] = "HIGH"
                elif priority == "MEDIUM":
                    item["risk_level"] = "MODERATE"
                else:
                    item["risk_level"] = "LOW"

                # Compute normalized status: completed, overdue, upcoming, pending
                due = item.get("due_date") or today_str
                if raw_status == "COMPLETED":
                    item["status"] = "completed"
                elif raw_status in {"OVERDUE", "MISSED"} or (raw_status == "PENDING" and due < today_str):
                    item["status"] = "overdue"
                elif due > today_str:
                    item["status"] = "upcoming"
                else:
                    item["status"] = "pending"

                item["type"] = item.get("task_type")
                if not item.get("beneficiary_name"):
                    item["beneficiary_name"] = item.get("beneficiary_id")
                if not item.get("village"):
                    item["village"] = "Keregodu GP"

                item["household_id"] = f"HH-{item['beneficiary_id'][-3:]}"
                results.append(item)
            return results

    @staticmethod
    def get_pending() -> List[Dict[str, Any]]:
        return FollowupRepository.get_all(status="PENDING")

    @staticmethod
    def create(data: FollowupCreate) -> Dict[str, Any]:
        followup_id = f"FOL-{uuid.uuid4().hex[:8].upper()}"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO followups (
                    id, visit_id, beneficiary_id, task_type, due_date, priority,
                    completion_status, notes, guideline_source, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    followup_id,
                    data.visit_id,
                    data.beneficiary_id,
                    data.task_type,
                    data.due_date,
                    data.priority,
                    data.completion_status,
                    data.notes,
                    data.guideline_source,
                ),
            )
            cursor.execute("SELECT * FROM followups WHERE id = ?", (followup_id,))
            return dict(cursor.fetchone())

    @staticmethod
    def update_status(followup_id: str, new_status: str, due_date: Optional[str] = None, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            updates = ["completion_status = ?"]
            params = [new_status.upper()]
            if due_date:
                updates.append("due_date = ?")
                params.append(due_date)
            if notes:
                updates.append("notes = ?")
                params.append(notes)
            params.append(followup_id)

            sql = f"UPDATE followups SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(sql, params)
            cursor.execute("SELECT * FROM followups WHERE id = ?", (followup_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
