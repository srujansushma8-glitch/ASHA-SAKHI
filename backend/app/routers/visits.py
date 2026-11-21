"""
Visits REST API router.
Supports listing visits, confirming and committing visits, and voice-correction updates.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.visit import VisitRepository
from app.models.followup import FollowupRepository
from app.models.danger_alert import DangerAlertRepository
from app.schemas.visit import (
    VisitResponse,
    VisitConfirmRequest,
    VisitCorrectRequest,
    VisitCreate,
)
from app.services.followup_engine import followup_engine
from app.services.tts_adapter import get_tts_adapter

router = APIRouter(prefix="/api/visits", tags=["Visits"])
tts_adapter = get_tts_adapter()


@router.get("", response_model=List[VisitResponse])
async def list_visits(limit: int = 50):
    """Retrieves all logged ASHA field visits."""
    return VisitRepository.get_all(limit=limit)


@router.post("/confirm")
async def confirm_visit(req: VisitConfirmRequest):
    """
    Explicitly confirms and saves a structured visit record into SQLite.
    Generates follow-up tasks and logs danger sign alerts.
    """
    rec = req.record
    if not rec.beneficiary_id and not rec.beneficiary_name:
        raise HTTPException(
            status_code=400,
            detail="Cannot confirm record without beneficiary identification.",
        )

    visit_data = VisitCreate(
        beneficiary_id=rec.beneficiary_id,
        beneficiary_name=rec.beneficiary_name,
        visit_type=rec.visit_type or "General Visit",
        weight=rec.weight,
        vaccinations_due=rec.vaccinations_due,
        vaccinations_completed=rec.vaccinations_completed,
        next_visit_date=rec.next_visit_date,
        additional_notes=rec.additional_notes,
        transcript_raw=req.transcript_raw,
        is_confirmed=True,
        danger_flag=req.danger_flag,
        referral_status=req.referral_status,
    )

    # 1. Save visit in DB
    saved_visit = VisitRepository.create(visit_data)

    # 2. Generate guideline-based follow-ups
    followups = followup_engine.generate_followups(
        visit=visit_data,
        danger_flag=req.danger_flag,
        referral_status=req.referral_status,
    )
    saved_followups = []
    for fu in followups:
        fu.visit_id = saved_visit["id"]
        saved_fu = FollowupRepository.create(fu)
        saved_followups.append(saved_fu)

    # 3. Generate spoken confirmation audio
    confirm_text = "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ."
    spoken_ack = await tts_adapter.synthesize(confirm_text, language="kn")

    return {
        "status": "success",
        "message": "Visit confirmed and persisted successfully.",
        "visit": saved_visit,
        "followups": saved_followups,
        "confirmation_audio_base64": spoken_ack.audio_base64,
        "confirmation_text": confirm_text,
    }


@router.post("/correct")
async def correct_visit(req: VisitCorrectRequest):
    """
    Applies a field correction to an existing visit or active draft.
    Validates updated values and returns natural Kannada voice acknowledgment.
    """
    if not req.visit_id:
        raise HTTPException(status_code=400, detail="visit_id is required for correction.")

    try:
        updated_visit = VisitRepository.update_field(
            visit_id=req.visit_id,
            field_name=req.field_name,
            new_value=req.new_value,
        )
        if not updated_visit:
            raise HTTPException(status_code=404, detail=f"Visit '{req.visit_id}' not found.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    field_labels_kn = {
        "weight": "ತೂಕವನ್ನು",
        "beneficiary_name": "ಹೆಸರನ್ನು",
        "beneficiary_id": "ಐಡಿಯನ್ನು",
        "visit_type": "ಭೇಟಿ ಪ್ರಕಾರವನ್ನು",
        "next_visit_date": "ಮುಂದಿನ ದಿನಾಂಕವನ್ನು",
    }
    label = field_labels_kn.get(req.field_name, req.field_name)
    ack_text = f"{label} {req.new_value} ಎಂದು ಬದಲಾಯಿಸಲಾಗಿದೆ. ಈಗ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?"
    spoken_ack = await tts_adapter.synthesize(ack_text, language="kn")

    return {
        "status": "success",
        "message": f"Field '{req.field_name}' successfully corrected.",
        "visit": updated_visit,
        "ack_text": ack_text,
        "ack_audio_base64": spoken_ack.audio_base64,
    }
