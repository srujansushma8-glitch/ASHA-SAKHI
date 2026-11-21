"""
Sakhi AI Field Operations Assistant REST Router.
Provides structured query resolution, prompt recommendations, and multilingual voice-readback text.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.sakhi_assistant import sakhi_assistant
from app.auth import get_current_user

router = APIRouter(prefix="/api/assistant", tags=["Sakhi AI Operations Assistant"])


class AssistantQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    session_id: Optional[str] = None
    user_role: Optional[str] = "asha"


class AssistantQueryResponse(BaseModel):
    intent: str
    spoken_text: str
    display_text: str
    language: str
    count: Optional[int] = None
    records: Optional[List[Dict[str, Any]]] = None
    suggested_actions: Optional[List[Dict[str, Any]]] = None


@router.post("/query", response_model=AssistantQueryResponse)
async def query_assistant(
    req: AssistantQueryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Processes healthcare domain queries against patient registers.
    Protected endpoint: requires valid JWT bearer token.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    result = sakhi_assistant.process_query(
        query=req.query,
        language=req.language or "en"
    )
    return AssistantQueryResponse(**result)


@router.get("/suggested-prompts")
async def get_suggested_prompts(language: str = "en"):
    prompts_en = [
        {"id": 1, "text": "Show all pregnant women in my assigned area."},
        {"id": 2, "text": "Which beneficiaries need ANC follow-up?"},
        {"id": 3, "text": "Show high-risk pregnancy cases."},
        {"id": 4, "text": "Show children with overdue vaccinations."},
        {"id": 5, "text": "Plan my household visits for today."},
        {"id": 6, "text": "Generate my daily fieldwork report."},
        {"id": 7, "text": "Show pending referrals."},
        {"id": 8, "text": "Track ambulance 108."},
        {"id": 9, "text": "Explain PMMVY."},
        {"id": 10, "text": "Translate this instruction into Kannada."},
        {"id": 11, "text": "Register a new beneficiary."},
        {"id": 12, "text": "Show my pending tasks."}
    ]

    prompts_kn = [
        {"id": 1, "text": "ನನ್ನ ವ್ಯಾಪ್ತಿಯ ಎಲ್ಲಾ ಗರ್ಭಿಣಿಯರನ್ನು ತೋರಿಸಿ."},
        {"id": 2, "text": "ಯಾರಿಗೆ ANC ಫಾಲೋ-ಅಪ್ ತಪಾಸಣೆ ಅಗತ್ಯವಿದೆ?"},
        {"id": 3, "text": "ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗರ್ಭಾವಸ್ಥೆ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ."},
        {"id": 4, "text": "ಲಸಿಕೆ ಬಾಕಿ ಇರುವ ಮಕ್ಕಳ ಪಟ್ಟಿ ನೀಡಿ."},
        {"id": 5, "text": "ಇಂದಿನ ಮನೆ ಭೇಟಿಗಳನ್ನು ಯೋಜಿಸಿ."},
        {"id": 6, "text": "ನನ್ನ ಇಂದಿನ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ವರದಿ ನೀಡಿ."},
        {"id": 7, "text": "ಬಾಕಿ ಇರುವ ತುರ್ತು ರೆಫರಲ್‌ಗಳನ್ನು ತೋರಿಸಿ."},
        {"id": 8, "text": "108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ."},
        {"id": 9, "text": "PMMVY ಮಾತೃ ವಂದನಾ ಯೋಜನೆ ವಿವರಿಸಿ."},
        {"id": 10, "text": "ಈ ಸೂಚನೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಿಸಿ."},
        {"id": 11, "text": "ಹೊಸ ಫಲಾನುಭವಿ ನೋಂದಾಯಿಸಿ."},
        {"id": 12, "text": "ನನ್ನ ಇಂದಿನ ಬಾಕಿ ಕೆಲಸಗಳನ್ನು ತೋರಿಸಿ."}
    ]

    prompts_hi = [
        {"id": 1, "text": "मेरे क्षेत्र की सभी गर्भवती महिलाओं की सूची दिखाएं।"},
        {"id": 2, "text": "किन गर्भवती महिलाओं का एएनसी फॉलो-अप बाकी है?"},
        {"id": 3, "text": "उच्च जोखिम वाले गर्भावस्था मामले दिखाएं।"},
        {"id": 4, "text": "टीकाकरण बकाया वाले बच्चों की सूची दें।"},
        {"id": 5, "text": "आज के गृह दौरों की योजना बनाएं।"},
        {"id": 6, "text": "मेरी आज की दैनिक फील्डवर्क रिपोर्ट तैयार करें।"},
        {"id": 7, "text": "लंबित आपातकालीन रेफरल दिखाएं।"},
        {"id": 8, "text": "108 एम्बुलेंस को ट्रैक करें।"},
        {"id": 9, "text": "PMMVY योजना के बारे में बताएं।"},
        {"id": 10, "text": "इस निर्देश का हिंदी में अनुवाद करें।"},
        {"id": 11, "text": "नया लाभार्थी पंजीकृत करें।"},
        {"id": 12, "text": "मेरे आज के लंबित कार्य दिखाएं।"}
    ]

    lang = language.lower()
    if lang.startswith("kn"):
        return {"language": "kn", "prompts": prompts_kn}
    elif lang.startswith("hi"):
        return {"language": "hi", "prompts": prompts_hi}
    else:
        return {"language": "en", "prompts": prompts_en}
