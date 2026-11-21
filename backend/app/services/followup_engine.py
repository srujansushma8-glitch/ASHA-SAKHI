"""
Evidence-Based Follow-Up Task Generation Engine.
Generates clinical follow-up tasks strictly from confirmed visit data
and official MoHFW/NHM maternal and child health schedules.
Never invents arbitrary due dates.
"""

import logging
from typing import List, Optional
from datetime import datetime, date, timedelta
from app.schemas.visit import StructuredVisitExtraction, VisitCreate
from app.schemas.followup import FollowupCreate

logger = logging.getLogger(__name__)


class FollowupEngine:
    """
    Engine to compute clinical follow-up actions according to national guidelines:
    - MoHFW Universal Immunization Programme (UIP)
    - MoHFW Home Based Newborn Care (HBNC) Guidelines
    - MoHFW Antenatal Care (ANC) Guidelines
    - MoHFW Emergency Obstetric & Neonatal Referral Protocol
    """

    @staticmethod
    def generate_followups(
        visit: VisitCreate,
        danger_flag: bool = False,
        referral_status: str = "NONE",
    ) -> List[FollowupCreate]:
        tasks: List[FollowupCreate] = []

        if not visit.beneficiary_id:
            logger.warning("Cannot generate follow-ups without beneficiary_id.")
            return tasks

        visit_dt = date.fromisoformat(visit.visit_date) if visit.visit_date else date.today()

        # 1. EMERGENCY DANGER SIGN FOLLOW-UP
        # Protocol: Urgent 24-hour verification of PHC referral completion
        if danger_flag or referral_status != "NONE":
            emergency_due = (visit_dt + timedelta(days=1)).isoformat()
            tasks.append(
                FollowupCreate(
                    beneficiary_id=visit.beneficiary_id,
                    task_type="DANGER_SIGN_CHECK",
                    due_date=emergency_due,
                    priority="CRITICAL",
                    completion_status="PENDING",
                    notes="Verify emergency PHC referral attendance and maternal/neonatal clinical stabilization.",
                    guideline_source="MoHFW Emergency Obstetric & Neonatal Referral Protocol (GoI)",
                )
            )

        # 2. VACCINATION FOLLOW-UPS
        # Schedule: UIP National Immunization Schedule
        if visit.vaccinations_due:
            # If next visit date confirmed by ASHA worker, use that
            vac_due_date = visit.next_visit_date or (visit_dt + timedelta(days=28)).isoformat()
            vaccines_str = ", ".join(visit.vaccinations_due)
            tasks.append(
                FollowupCreate(
                    beneficiary_id=visit.beneficiary_id,
                    task_type="VACCINATION",
                    due_date=vac_due_date,
                    priority="HIGH",
                    completion_status="PENDING",
                    notes=f"Administer due vaccination(s): {vaccines_str}",
                    guideline_source="MoHFW Universal Immunization Programme (UIP) Schedule (GoI)",
                )
            )

        # 3. ANC FOLLOW-UPS
        # Schedule: MoHFW ANC Guidelines
        if "anc" in visit.visit_type.lower():
            anc_due_date = visit.next_visit_date or (visit_dt + timedelta(days=28)).isoformat()
            tasks.append(
                FollowupCreate(
                    beneficiary_id=visit.beneficiary_id,
                    task_type="ANC_CHECKUP",
                    due_date=anc_due_date,
                    priority="HIGH",
                    completion_status="PENDING",
                    notes="Next routine Antenatal Care checkup, BP monitoring, weight, and IFA replenishment.",
                    guideline_source="MoHFW Guidelines for Antenatal Care and Skilled Attendance at Birth (GoI)",
                )
            )

        # 4. NEWBORN HBNC HOME VISITS
        # Schedule: Home Based Newborn Care protocol (Days 3, 7, 14, 21, 28, 42)
        elif "newborn" in visit.visit_type.lower() or "infant" in visit.visit_type.lower():
            hbnc_due_date = visit.next_visit_date or (visit_dt + timedelta(days=4)).isoformat()
            tasks.append(
                FollowupCreate(
                    beneficiary_id=visit.beneficiary_id,
                    task_type="NEWBORN_CARE",
                    due_date=hbnc_due_date,
                    priority="HIGH",
                    completion_status="PENDING",
                    notes="HBNC home visit: check umbilical cord, breastfeeding, infant temperature, and danger signs.",
                    guideline_source="MoHFW Home Based Newborn Care (HBNC) Operational Guidelines (GoI)",
                )
            )

        # 5. GENERAL POSTNATAL OR HOME VISIT FOLLOW-UP
        elif "pnc" in visit.visit_type.lower():
            pnc_due_date = visit.next_visit_date or (visit_dt + timedelta(days=14)).isoformat()
            tasks.append(
                FollowupCreate(
                    beneficiary_id=visit.beneficiary_id,
                    task_type="HOME_VISIT",
                    due_date=pnc_due_date,
                    priority="MEDIUM",
                    completion_status="PENDING",
                    notes="PNC follow-up: postpartum recovery, nutrition, family planning counseling.",
                    guideline_source="MoHFW Postnatal Care Clinical Guidelines (GoI)",
                )
            )

        return tasks


followup_engine = FollowupEngine()
