from app.models.beneficiary import BeneficiaryRepository
from app.models.visit import VisitRepository
from app.models.followup import FollowupRepository
from app.models.danger_alert import DangerAlertRepository
from app.models.ambulance import AmbulanceRepository

__all__ = [
    "BeneficiaryRepository",
    "VisitRepository",
    "FollowupRepository",
    "DangerAlertRepository",
    "AmbulanceRepository",
]
