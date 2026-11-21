"""
Unit tests for Evidence-Based Follow-Up Task Generation Engine.
Verifies that tasks strictly adhere to MoHFW UIP, HBNC, and ANC guidelines.
"""

import pytest
from app.schemas.visit import VisitCreate
from app.services.followup_engine import FollowupEngine


def test_anc_followup_generation():
    visit = VisitCreate(
        beneficiary_id="BEN-KA-001",
        visit_type="ANC checkup",
        visit_date="2026-11-20",
        next_visit_date="2026-12-18",
    )
    tasks = FollowupEngine.generate_followups(visit)
    assert len(tasks) >= 1
    anc_task = next(t for t in tasks if t.task_type == "ANC_CHECKUP")
    assert anc_task.due_date == "2026-12-18"
    assert anc_task.priority == "HIGH"
    assert "MoHFW Guidelines for Antenatal Care" in anc_task.guideline_source


def test_vaccination_followup_generation():
    visit = VisitCreate(
        beneficiary_id="BEN-KA-003",
        visit_type="PNC visit",
        visit_date="2026-11-20",
        vaccinations_due=["Pentavalent 1", "Rota 1"],
        next_visit_date="2026-12-10",
    )
    tasks = FollowupEngine.generate_followups(visit)
    vac_task = next(t for t in tasks if t.task_type == "VACCINATION")
    assert "Pentavalent 1" in (vac_task.notes or "")
    assert "Rota 1" in (vac_task.notes or "")
    assert vac_task.due_date == "2026-12-10"
    assert "Universal Immunization Programme" in vac_task.guideline_source


def test_newborn_hbnc_followup_generation():
    visit = VisitCreate(
        beneficiary_id="BEN-KA-004",
        visit_type="Newborn home visit",
        visit_date="2026-11-20",
    )
    tasks = FollowupEngine.generate_followups(visit)
    hbnc_task = next(t for t in tasks if t.task_type == "NEWBORN_CARE")
    assert hbnc_task.priority == "HIGH"
    assert "Home Based Newborn Care" in hbnc_task.guideline_source


def test_danger_sign_emergency_followup():
    """Danger flags must trigger CRITICAL priority 24-hour verification follow-up task."""
    visit = VisitCreate(
        beneficiary_id="BEN-KA-002",
        visit_type="ANC checkup",
        visit_date="2026-11-20",
        danger_flag=True,
        referral_status="IMMEDIATE_REFERRAL_PHC",
    )
    tasks = FollowupEngine.generate_followups(visit, danger_flag=True, referral_status="IMMEDIATE_REFERRAL_PHC")
    danger_task = next(t for t in tasks if t.task_type == "DANGER_SIGN_CHECK")
    assert danger_task.priority == "CRITICAL"
    assert danger_task.due_date == "2026-11-21"  # Next day 24-hour verification
    assert "Referral Protocol" in danger_task.guideline_source


def test_missing_beneficiary_returns_empty():
    visit = VisitCreate(
        beneficiary_id=None,
        visit_type="General Visit",
    )
    tasks = FollowupEngine.generate_followups(visit)
    assert tasks == []
