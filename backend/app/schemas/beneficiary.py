"""
Pydantic schemas for Beneficiary entity.
"""

from pydantic import BaseModel, Field
from typing import Optional


class BeneficiaryBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: str = "Female"
    phone: Optional[str] = None
    village: Optional[str] = None
    category: str = "Pregnant Woman"  # Pregnant Woman, Lactating Mother, Infant, Child
    lmp_date: Optional[str] = None
    delivery_date: Optional[str] = None


class BeneficiaryCreate(BeneficiaryBase):
    id: str


class BeneficiaryResponse(BeneficiaryBase):
    id: str
    created_at: str
    updated_at: str
