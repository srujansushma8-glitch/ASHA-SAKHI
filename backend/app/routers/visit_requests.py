from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends
from app.models.visit_request import VisitRequestCreate, VisitRequestResponse, VisitRequestRepository
from app.auth import get_current_user

router = APIRouter(prefix="/api/visit-requests", tags=["Visit Requests"])


@router.post("", response_model=VisitRequestResponse, status_code=201)
def create_visit_request(req: VisitRequestCreate):
    """
    Submits a new household visit request from the landing page.
    Publicly accessible to villagers without prior authentication.
    """
    try:
        created = VisitRequestRepository.create(req)
        return created
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create visit request: {e}")


@router.get("", response_model=List[VisitRequestResponse])
def get_visit_requests(
    status: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns all visit requests, optionally filtered by status (PENDING, CONFIRMED, COMPLETED).
    Protected: accessible to authenticated healthcare workers.
    """
    return VisitRequestRepository.get_all(status)


@router.patch("/{request_id}")
def update_visit_request_status(
    request_id: str,
    status: str = Query(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Updates the status of a visit request (e.g. ASHA worker confirms or marks visited).
    Protected: accessible to authenticated healthcare workers.
    """
    updated = VisitRequestRepository.update_status(request_id, status.upper())
    if not updated:
        raise HTTPException(status_code=404, detail="Visit request not found")
    return updated
