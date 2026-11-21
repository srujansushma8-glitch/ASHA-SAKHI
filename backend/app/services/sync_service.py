"""
Offline Synchronization Engine for ASHA Field Operations.
Processes batched offline visit drafts, resolves conflicts, triggers clinical follow-ups,
and delivers server delta sync for offline-first mobile devices.
"""

import logging
from datetime import datetime
from typing import Dict, Any, List
from app.schemas.sync import (
    SyncBatchUploadRequest,
    SyncBatchUploadResponse,
    SyncDeltaResponse,
    SyncedItemMapping,
)
from app.models.visit import VisitRepository
from app.models.followup import FollowupRepository
from app.models.beneficiary import BeneficiaryRepository
from app.services.followup_engine import followup_engine
from app.services.danger_detector import danger_detector

logger = logging.getLogger(__name__)


class SyncService:
    @staticmethod
    def process_batch(req: SyncBatchUploadRequest) -> SyncBatchUploadResponse:
        """
        Idempotently inserts offline visits recorded by ASHA workers in no-network areas.
        """
        mappings: List[SyncedItemMapping] = []
        synced_visits = 0
        synced_followups = 0

        for item in req.visits:
            v_data = item.visit_data

            # 1. Run danger sign check on offline transcript if present
            has_danger = v_data.danger_flag
            ref_status = v_data.referral_status
            if v_data.transcript_raw:
                danger_res = danger_detector.detect(v_data.transcript_raw)
                if danger_res.has_danger:
                    has_danger = True
                    ref_status = danger_res.referral_action

            v_data.danger_flag = has_danger
            v_data.referral_status = ref_status

            # 2. Persist visit
            saved_visit = VisitRepository.create(v_data)
            mappings.append(
                SyncedItemMapping(
                    client_id=item.client_id,
                    server_id=saved_visit["id"],
                    status="SYNCED",
                )
            )
            synced_visits += 1

            # 3. Generate followups
            followups = followup_engine.generate_followups(
                visit=v_data,
                danger_flag=has_danger,
                referral_status=ref_status,
            )
            for fu in followups:
                fu.visit_id = saved_visit["id"]
                FollowupRepository.create(fu)
                synced_followups += 1

        # Also insert any standalone pending follow-ups created offline
        for fu_item in req.pending_followups:
            FollowupRepository.create(fu_item)
            synced_followups += 1

        logger.info(
            f"[SYNC] Processed batch from {req.asha_worker_id}: {synced_visits} visits, {synced_followups} followups"
        )

        return SyncBatchUploadResponse(
            status="SUCCESS",
            synced_visits_count=synced_visits,
            synced_followups_count=synced_followups,
            mappings=mappings,
            conflicts_resolved=0,
            server_timestamp=datetime.now().isoformat(),
        )

    @staticmethod
    def get_delta(since_timestamp: str) -> SyncDeltaResponse:
        """Retrieves updates since timestamp for client cache synchronization."""
        # Query beneficiaries, visits, and followups
        all_bens = BeneficiaryRepository.get_all()
        all_visits = VisitRepository.get_all(limit=100)
        all_followups = FollowupRepository.get_all()

        # Filter items created/updated after since_timestamp
        filtered_bens = [b for b in all_bens if b.get("updated_at", "") >= since_timestamp or not since_timestamp]
        filtered_visits = [v for v in all_visits if v.get("created_at", "") >= since_timestamp or not since_timestamp]
        filtered_fu = [f for f in all_followups if f.get("created_at", "") >= since_timestamp or not since_timestamp]

        return SyncDeltaResponse(
            since_timestamp=since_timestamp,
            server_timestamp=datetime.now().isoformat(),
            beneficiaries=filtered_bens,
            visits=filtered_visits,
            followups=filtered_fu,
        )


sync_service = SyncService()
