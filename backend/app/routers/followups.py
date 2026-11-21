"""
Followups REST API router.
"""

from fastapi import APIRouter, Query, Depends
from typing import List, Optional
from app.models.followup import FollowupRepository
from app.schemas.followup import FollowupResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/followups",
    tags=["Followups"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=List[FollowupResponse])
async def list_followups(
    beneficiary_id: Optional[str] = Query(None, description="Filter by beneficiary ID"),
    status: Optional[str] = Query(None, description="Filter by status: PENDING, COMPLETED, OVERDUE"),
):
    """Retrieves scheduled clinical follow-up tasks."""
    return FollowupRepository.get_all(beneficiary_id=beneficiary_id, status=status)
