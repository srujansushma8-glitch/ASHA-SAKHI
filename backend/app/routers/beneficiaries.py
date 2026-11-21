"""
Beneficiaries REST API router.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from app.models.beneficiary import BeneficiaryRepository
from app.schemas.beneficiary import BeneficiaryResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/beneficiaries",
    tags=["Beneficiaries"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=List[BeneficiaryResponse])
async def list_beneficiaries(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Returns all registered synthetic beneficiaries."""
    return BeneficiaryRepository.get_all()[offset : offset + limit]


@router.get("/{beneficiary_id}", response_model=BeneficiaryResponse)
async def get_beneficiary(beneficiary_id: str):
    """Retrieves single beneficiary details by ID."""
    ben = BeneficiaryRepository.get_by_id(beneficiary_id)
    if not ben:
        raise HTTPException(status_code=404, detail=f"Beneficiary '{beneficiary_id}' not found.")
    return ben
