"""
Database operations for Beneficiary entities.
"""

from typing import List, Optional, Dict, Any
from app.database import get_db_connection
from app.schemas.beneficiary import BeneficiaryCreate, BeneficiaryResponse


class BeneficiaryRepository:
    @staticmethod
    def get_all() -> List[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM beneficiaries ORDER BY name ASC")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def get_by_id(beneficiary_id: str) -> Optional[Dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM beneficiaries WHERE id = ?", (beneficiary_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    @staticmethod
    def create(data: BeneficiaryCreate) -> Dict[str, Any]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO beneficiaries (id, name, age, gender, phone, village, category, lmp_date, delivery_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                """,
                (
                    data.id,
                    data.name,
                    data.age,
                    data.gender,
                    data.phone,
                    data.village,
                    data.category,
                    data.lmp_date,
                    data.delivery_date,
                ),
            )
            cursor.execute("SELECT * FROM beneficiaries WHERE id = ?", (data.id,))
            return dict(cursor.fetchone())
