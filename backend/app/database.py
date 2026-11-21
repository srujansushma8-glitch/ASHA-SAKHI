"""
Database management for ASHA Sakhi using SQLite.
Includes connection pooling, schema initialization, safe backups, and synthetic seeding.
"""

import sqlite3
import shutil
import logging
from datetime import datetime
from pathlib import Path
from contextlib import contextmanager
from typing import Generator
from app.config import settings

logger = logging.getLogger(__name__)


def get_db_path() -> Path:
    settings.DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    return settings.DATABASE_PATH


def backup_database() -> str | None:
    """Creates a timestamped backup of the database if it exists."""
    db_path = get_db_path()
    if db_path.exists() and db_path.stat().st_size > 0:
        backup_dir = db_path.parent / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = backup_dir / f"asha_sakhi_backup_{timestamp}.db"
        shutil.copy2(db_path, backup_path)
        logger.info(f"Database backed up to {backup_path}")
        return str(backup_path)
    return None


@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """Provides a thread-safe connection with dictionary-like row access."""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error, rolled back transaction: {e}")
        raise
    finally:
        conn.close()


def init_db(seed_synthetic: bool = True) -> None:
    """Initializes tables and optionally seeds synthetic beneficiaries."""
    get_db_path()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Beneficiaries table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS beneficiaries (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER,
                gender TEXT NOT NULL,
                phone TEXT,
                village TEXT,
                category TEXT NOT NULL,
                lmp_date TEXT,
                delivery_date TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )

        # 2. Visits table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS visits (
                id TEXT PRIMARY KEY,
                beneficiary_id TEXT,
                beneficiary_name TEXT,
                visit_type TEXT NOT NULL,
                visit_date TEXT NOT NULL,
                weight REAL,
                vaccinations_due TEXT,
                vaccinations_completed TEXT,
                next_visit_date TEXT,
                additional_notes TEXT,
                transcript_raw TEXT,
                is_confirmed INTEGER NOT NULL DEFAULT 0,
                danger_flag INTEGER NOT NULL DEFAULT 0,
                referral_status TEXT NOT NULL DEFAULT 'NONE',
                created_at TEXT NOT NULL,
                FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id)
            );
            """
        )

        # 3. Follow-ups table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS followups (
                id TEXT PRIMARY KEY,
                visit_id TEXT,
                beneficiary_id TEXT NOT NULL,
                task_type TEXT NOT NULL,
                due_date TEXT NOT NULL,
                priority TEXT NOT NULL,
                completion_status TEXT NOT NULL DEFAULT 'PENDING',
                notes TEXT,
                guideline_source TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (visit_id) REFERENCES visits (id),
                FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id)
            );
            """
        )

        # 4. Danger Alerts table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS danger_alerts (
                id TEXT PRIMARY KEY,
                visit_id TEXT,
                beneficiary_id TEXT,
                sign_id TEXT NOT NULL,
                category TEXT NOT NULL,
                detected_phrase TEXT NOT NULL,
                severity TEXT NOT NULL,
                source_guideline TEXT NOT NULL,
                referral_action TEXT NOT NULL,
                audio_alert_spoken INTEGER NOT NULL DEFAULT 0,
                resolved INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (visit_id) REFERENCES visits (id),
                FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries (id)
            );
            """
        )

        cursor.execute("CREATE INDEX IF NOT EXISTS idx_visits_ben ON visits(beneficiary_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_followups_ben ON followups(beneficiary_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_danger_alerts_visit ON danger_alerts(visit_id);")

        # Check if beneficiaries exist; if not and seeding requested, insert synthetic records
        cursor.execute("SELECT COUNT(*) FROM beneficiaries")
        count = cursor.fetchone()[0]
        if count == 0 and seed_synthetic:
            seed_synthetic_beneficiaries(cursor)


def seed_synthetic_beneficiaries(cursor: sqlite3.Cursor) -> None:
    """Populates synthetic test beneficiaries for the hackathon demo."""
    now = datetime.now().isoformat()
    synthetic_records = [
        (
            "BEN-KA-001",
            "ಲಕ್ಷ್ಮಿ (Lakshmi)",
            24,
            "Female",
            "9876543210",
            "ಹೊಸಕೋಟೆ (Hoskote)",
            "Pregnant Woman",
            "2026-05-15",
            None,
            now,
            now,
        ),
        (
            "BEN-KA-002",
            "ಸುಮಿತ್ರಾ (Sumitra)",
            22,
            "Female",
            "9876543211",
            "ದೇವನಹಳ್ಳಿ (Devanahalli)",
            "Pregnant Woman",
            "2026-08-01",
            None,
            now,
            now,
        ),
        (
            "BEN-KA-003",
            "ರಾಧಾ (Radha)",
            26,
            "Female",
            "9876543212",
            "ವಿಜಯಪುರ (Vijayapura)",
            "Lactating Mother",
            "2025-11-10",
            "2026-08-20",
            now,
            now,
        ),
        (
            "BEN-KA-004",
            "ಬೇಬಿ ಆಫ್ ಕವಿತಾ (Baby of Kavitha)",
            0,
            "Child",
            "9876543213",
            "ರಾಮನಗರ (Ramanagara)",
            "Infant",
            None,
            "2026-11-10",
            now,
            now,
        ),
        (
            "BEN-KA-005",
            "ಬೇಬಿ ಆಫ್ ರೂಪಾ (Baby of Roopa)",
            0,
            "Child",
            "9876543214",
            "ಚನ್ನಪಟ್ಟಣ (Channapatna)",
            "Infant",
            None,
            "2026-11-14",
            now,
            now,
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO beneficiaries (
            id, name, age, gender, phone, village, category, lmp_date, delivery_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        synthetic_records,
    )
    logger.info(f"Seeded {len(synthetic_records)} synthetic beneficiaries.")
