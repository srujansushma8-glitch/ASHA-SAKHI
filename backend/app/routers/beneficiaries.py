"""
Beneficiaries REST API router.
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.beneficiary import BeneficiaryRepository
from app.schemas.beneficiary import BeneficiaryResponse

router = APIRouter(prefix="/api/beneficiaries", tags=["Beneficiaries"])


@router.get("", response_model=List[BeneficiaryResponse])
async def list_beneficiaries():
    """Returns all registered synthetic beneficiaries."""
    return BeneficiaryRepository.get_all()


@router.get("/{beneficiary_id}", response_model=BeneficiaryResponse)
async def get_beneficiary(beneficiary_id: str):
    """Retrieves single beneficiary details by ID."""
    ben = BeneficiaryRepository.get_by_id(beneficiary_id)
    if not ben:
        raise HTTPException(status_code=404, detail=f"Beneficiary '{beneficiary_id}' not found.")
    return ben
