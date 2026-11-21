"""
Followups REST API router.
Supports listing follow-up tasks, status updates, rescheduling, and summary reporting.
"""

from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Optional, Dict, Any
from app.models.followup import FollowupRepository
from app.schemas.followup import FollowupResponse, FollowupStatusUpdate
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/followups",
    tags=["Followups"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=List[FollowupResponse])
async def list_followups(
    beneficiary_id: Optional[str] = Query(None, description="Filter by beneficiary ID"),
    status: Optional[str] = Query(None, description="Filter by status: PENDING, COMPLETED, OVERDUE, UPCOMING"),
):
    """Retrieves scheduled clinical follow-up tasks with enriched beneficiary data."""
    return FollowupRepository.get_all(beneficiary_id=beneficiary_id, status=status)


@router.get("/summary")
async def get_followups_summary():
    """Returns aggregated summary metrics for the Follow-ups & Reports dashboard."""
    all_items = FollowupRepository.get_all()
    total = len(all_items)
    pending = sum(1 for f in all_items if f.get("status") in {"pending", "overdue"})
    overdue = sum(1 for f in all_items if f.get("status") == "overdue")
    upcoming = sum(1 for f in all_items if f.get("status") == "upcoming")
    completed = sum(1 for f in all_items if f.get("status") == "completed")
    missed = sum(1 for f in all_items if f.get("status") == "overdue")

    maternal = sum(1 for f in all_items if f.get("category") == "ANC")
    immunization = sum(1 for f in all_items if f.get("category") == "Immunization")
    high_risk = sum(1 for f in all_items if f.get("category") == "High Risk")
    newborn = sum(1 for f in all_items if f.get("category") == "Newborn")

    return {
        "total_followups": total,
        "total_pending": pending,
        "overdue_count": overdue,
        "upcoming_count": upcoming,
        "completed_count": completed,
        "missed_count": missed,
        "maternal_count": maternal,
        "child_immunization_count": immunization,
        "high_risk_count": high_risk,
        "newborn_count": newborn,
    }


@router.patch("/{followup_id}")
async def update_followup(followup_id: str, req: FollowupStatusUpdate):
    """Updates followup status, due date, or clinical notes."""
    new_status = req.completion_status or (req.status.upper() if req.status else "COMPLETED")
    res = FollowupRepository.update_status(
        followup_id=followup_id,
        new_status=new_status,
        due_date=req.due_date,
        notes=req.notes,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Followup record not found.")
    return res
