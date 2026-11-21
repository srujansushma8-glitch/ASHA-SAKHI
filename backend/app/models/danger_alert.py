"""
Database operations for Danger Alerts.
"""

import uuid
from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.schemas.danger_alert import DangerAlertCreate


class DangerAlertRepository:
    @staticmethod
    def get_all(unresolved_only: bool = False) -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM danger_alerts"
            if unresolved_only:
                query += " WHERE resolved = 0"
            query += " ORDER BY created_at DESC"
            cursor.execute(query)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def create(data: DangerAlertCreate) -> Dict[str, Any]:
        alert_id = f"DNG-{uuid.uuid4().hex[:8].upper()}"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO danger_alerts (
                    id, visit_id, beneficiary_id, sign_id, category, detected_phrase,
                    severity, source_guideline, referral_action, audio_alert_spoken, resolved, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    alert_id,
                    data.visit_id,
                    data.beneficiary_id,
                    data.sign_id,
                    data.category,
                    data.detected_phrase,
                    data.severity,
                    data.source_guideline,
                    data.referral_action,
                    1 if data.audio_alert_spoken else 0,
                    1 if data.resolved else 0,
                ),
            )
            cursor.execute("SELECT * FROM danger_alerts WHERE id = ?", (alert_id,))
            return dict(cursor.fetchone())

    @staticmethod
    def mark_resolved(alert_id: str) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE danger_alerts SET resolved = 1 WHERE id = ?",
                (alert_id,),
            )
            cursor.execute("SELECT * FROM danger_alerts WHERE id = ?", (alert_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
