"""
Database operations for Followup tasks.
"""

import uuid
from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.schemas.followup import FollowupCreate


class FollowupRepository:
    @staticmethod
    def get_all(beneficiary_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM followups WHERE 1=1"
            params = []
            if beneficiary_id:
                query += " AND beneficiary_id = ?"
                params.append(beneficiary_id)
            if status:
                query += " AND completion_status = ?"
                params.append(status)
            query += " ORDER BY due_date ASC, priority DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

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
    def update_status(followup_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE followups SET completion_status = ? WHERE id = ?",
                (new_status, followup_id),
            )
            cursor.execute("SELECT * FROM followups WHERE id = ?", (followup_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
