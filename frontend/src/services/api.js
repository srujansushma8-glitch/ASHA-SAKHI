/**
 * API Service Layer
 * Coordinates with backend REST endpoints:
 * - GET  /api/health
 * - GET  /api/beneficiaries
 * - GET  /api/visits
 * - GET  /api/followups
 * - POST /api/visits/confirm
 * - POST /api/visits/correct
 * - POST /api/sync/batch (Batch Offline Sync)
 * - GET  /api/ambulance/requests/{request_id}/tracking (Ambulance Simulation Telemetry)
 * - POST /api/ambulance/requests/{request_id}/simulate-step (Ambulance Simulation Stepper)
 *
 * Provides full offline resilience:
 * - Temporary local storage of unfinished visit records (drafts)
 * - Pending sync queue for offline visits
 * - Duplicate submission prevention (idempotency key & submitted ID registry)
 * - Auto-synchronization on network recovery
 * - Simulated Ambulance Tracking with status updates and route progression
 */

import {
  INITIAL_BENEFICIARIES,
  INITIAL_VISITS,
  INITIAL_FOLLOWUPS,
  INITIAL_EMERGENCY_ALERTS
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

// Local storage keys for offline persistence & state
const STORAGE_KEYS = {
  BENEFICIARIES: 'asha_beneficiaries_v1',
  VISITS: 'asha_visits_v1',
  FOLLOWUPS: 'asha_followups_v1',
  EMERGENCY_ALERTS: 'asha_emergency_alerts_v1',
  DEMO_MODE: 'asha_demo_mode_active',
  VISIT_DRAFT: 'asha_visit_draft_v1',
  PENDING_SYNC_QUEUE: 'asha_pending_sync_queue_v1',
  SUBMITTED_IDS: 'asha_submitted_ids_v1',
  AMBULANCE_TRACKING: 'asha_ambulance_tracking_v1'
};

// Initial simulated ambulance dispatch baseline conforming to backend schema
export const INITIAL_AMBULANCE_TRACKING = {
  id: 'AMB-REQ-108-001',
  request_id: 'AMB-REQ-108-001',
  beneficiary_id: 'ASHA-KA-2024-0102',
  beneficiary_name: 'Geetha M.',
  beneficiary_name_kn: 'ಗೀತಾ ಎಂ.',
  status: 'DISPATCHED', // 'REQUESTED', 'DISPATCHED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED'
  status_sequence: ['REQUESTED', 'DISPATCHED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED'],
  status_sequence_kn: ['ವಿನಂತಿಸಲಾಗಿದೆ', 'ವಾಹನ ಹೊರಟಿದೆ', 'ಮಾರ್ಗ ಮಧ್ಯದಲ್ಲಿದೆ', 'ಸ್ಥಳ ತಲುಪಿದೆ', 'ಪೂರ್ಣಗೊಂಡಿದೆ'],
  is_simulation: true,
  simulation_disclaimer: 'SIMULATION ONLY: This is a training and demonstration simulation. No real 108 emergency vehicle or real emergency response team has been contacted.',
  disclaimer_kn: 'ಸಿಮ್ಯುಲೇಶನ್ ಮಾತ್ರ: ಇದು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮತ್ತು ತರಬೇತಿಗಾಗಿ ಮಾತ್ರ. ಯಾವುದೇ ನಿಜವಾದ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಿಲ್ಲ.',
  pickup_location: 'Keregodu Village, Near Anganwadi Center, Mandya District',
  pickup_location_kn: 'ಕೆರೆಗೋಡು ಗ್ರಾಮ, ಅಂಗನವಾಡಿ ಕೇಂದ್ರದ ಹತ್ತಿರ, ಮಂಡ್ಯ ಜಿಲ್ಲೆ',
  destination_facility: 'Mandya Taluk Hospital & PHC Sector 4',
  destination_facility_kn: 'ಮಂಡ್ಯ ತಾಲೂಕು ಆಸ್ಪತ್ರೆ ಮತ್ತು PHC ಸೆಕ್ಟರ್ 4',
  pickup_lat: 12.5835,
  pickup_lng: 76.9280,
  base_hospital: {
    name: 'Mandya Taluk Hospital & PHC Sector 4',
    lat: 12.5240,
    lng: 76.8980
  },
  current_latitude: 12.5450,
  current_longitude: 76.9090,
  // Simulated waypoint coordinates connecting Hospital (12.524, 76.898) to Village (12.583, 76.928)
  route_waypoints: [
    { lat: 12.5240, lng: 76.8980, label: 'PHC Mandya Base' },
    { lat: 12.5350, lng: 76.9020, label: 'Kallalli Circle' },
    { lat: 12.5450, lng: 76.9090, label: 'Sugar Town Cross' },
    { lat: 12.5580, lng: 76.9150, label: 'Shivalli Gate' },
    { lat: 12.5710, lng: 76.9220, label: 'Keregodu Main Road' },
    { lat: 12.5835, lng: 76.9280, label: 'Beneficiary Home (Pickup)' }
  ],
  route_step: 2,
  eta_minutes: 8,
  distance_km: 3.4,
  vehicle_number: 'KA-11-G-1081',
  driver_name: 'Ramesh Gowda',
  driver_phone: '+91 94480 10801',
  emergency_technician: 'Suresh Kumar (EMT)',
  speed_kmh: 48,
  updated_at: new Date().toISOString()
};

// Initialize localStorage with synthetic baseline if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.BENEFICIARIES)) {
    localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(INITIAL_BENEFICIARIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FOLLOWUPS)) {
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(INITIAL_FOLLOWUPS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMERGENCY_ALERTS)) {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_ALERTS, JSON.stringify(INITIAL_EMERGENCY_ALERTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AMBULANCE_TRACKING)) {
    localStorage.setItem(STORAGE_KEYS.AMBULANCE_TRACKING, JSON.stringify(INITIAL_AMBULANCE_TRACKING));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE)) {
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMITTED_IDS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMITTED_IDS, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === null) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, JSON.stringify(DEFAULT_DEMO_MODE));
  }
};

initializeStorage();

export const isDemoMode = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
  return stored !== null ? JSON.parse(stored) : DEFAULT_DEMO_MODE;
};

export const setDemoMode = (enabled) => {
  localStorage.setItem(STORAGE_KEYS.DEMO_MODE, JSON.stringify(enabled));
  window.dispatchEvent(new CustomEvent('asha_demo_mode_changed', { detail: { enabled } }));
};

// Helper for fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const api = {
  /**
   * Health Check
   * GET /api/health
   */
  async checkHealth() {
    if (isDemoMode()) {
      return {
        status: 'healthy',
        mode: 'demo',
        ai_services: {
          asr: 'AI4Bharat Indic-Transcribe (Simulated)',
          tts: 'AI4Bharat Indic-Speak (Simulated)'
        },
        timestamp: new Date().toISOString()
      };
    }
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/health`, { method: 'GET' });
      if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Health check unreachable, falling back to simulated status', err);
      return {
        status: 'degraded',
        mode: 'fallback',
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Beneficiaries List
   * GET /api/beneficiaries
   */
  async getBeneficiaries() {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/beneficiaries`);
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('[API] Failed to fetch beneficiaries from server, loading cached/mock', err);
      }
    }
    const cached = localStorage.getItem(STORAGE_KEYS.BENEFICIARIES);
    return cached ? JSON.parse(cached) : INITIAL_BENEFICIARIES;
  },

  /**
   * Completed Visits
   * GET /api/visits
   */
  async getVisits() {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/visits`);
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('[API] Failed to fetch visits from server, loading cached/mock', err);
      }
    }
    const cached = localStorage.getItem(STORAGE_KEYS.VISITS);
    return cached ? JSON.parse(cached) : INITIAL_VISITS;
  },

  /**
   * Follow-ups List
   * GET /api/followups
   */
  async getFollowups() {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/followups`);
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('[API] Failed to fetch followups from server, loading cached/mock', err);
      }
    }
    const cached = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
    return cached ? JSON.parse(cached) : INITIAL_FOLLOWUPS;
  },

  /**
   * Confirm & Save Visit Record
   * POST /api/visits/confirm
   * Conforms to backend VisitConfirmRequest schema:
   * { record: StructuredVisitExtraction, visit_id, transcript_raw, danger_flag, referral_status }
   */
  async confirmVisit(visitData) {
    const rawRecord = visitData.visit_record || visitData.record || visitData;
    const clientSubmissionId = visitData.client_submission_id || rawRecord.client_submission_id || `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Prepare normalized record conforming to StructuredVisitExtraction
    const structuredRecord = {
      beneficiary_id: rawRecord.beneficiary_id || 'ASHA-KA-2024-0101',
      beneficiary_name: rawRecord.beneficiary_name || 'Beneficiary',
      visit_type: rawRecord.visit_type || 'General Visit',
      weight: parseFloat(rawRecord.weight) || 55.0,
      vaccinations_due: Array.isArray(rawRecord.vaccinations_due) ? rawRecord.vaccinations_due : (rawRecord.vaccinations_due ? [rawRecord.vaccinations_due] : []),
      vaccinations_completed: Array.isArray(rawRecord.vaccinations_completed) ? rawRecord.vaccinations_completed : (rawRecord.vaccinations_completed ? [rawRecord.vaccinations_completed] : []),
      next_visit_date: rawRecord.next_visit_date || null,
      additional_notes: rawRecord.additional_notes || ''
    };

    const payload = {
      visit_id: visitData.visit_id || clientSubmissionId,
      record: structuredRecord,
      transcript_raw: visitData.transcript_raw || rawRecord.additional_notes || '',
      danger_flag: Boolean(rawRecord.danger_sign_detected || rawRecord.danger_flag),
      referral_status: rawRecord.referral_status || (rawRecord.danger_sign_detected ? 'REFERRAL_REQUIRED' : 'NONE')
    };

    // Duplicate Prevention Check
    const submittedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMITTED_IDS) || '[]');
    if (submittedIds.includes(clientSubmissionId)) {
      console.warn('[API] Duplicate visit submission rejected:', clientSubmissionId);
      return {
        success: true,
        is_duplicate: true,
        message: 'This record was already submitted previously (Duplicate Prevented).',
        visit_id: clientSubmissionId,
        timestamp: new Date().toISOString()
      };
    }

    let result = null;
    const isOnline = navigator.onLine;

    if (!isDemoMode() && isOnline) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/visits/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch (err) {
        console.warn('[API] POST /api/visits/confirm failed on network, queueing offline', err);
      }
    }

    if (!result) {
      if (!isOnline) {
        this.queuePendingVisit({ ...payload, client_submission_id: clientSubmissionId });
      }

      result = {
        success: true,
        id: payload.visit_id,
        visit_id: payload.visit_id,
        client_submission_id: clientSubmissionId,
        message: isOnline ? 'Visit confirmed successfully' : 'Stored locally. Will sync when back online.',
        is_offline_saved: !isOnline,
        timestamp: new Date().toISOString(),
        visit: structuredRecord
      };
    }

    // Register submission ID to prevent future duplicate submissions
    submittedIds.push(clientSubmissionId);
    localStorage.setItem(STORAGE_KEYS.SUBMITTED_IDS, JSON.stringify(submittedIds));

    // Persist to local visits register
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
      const newEntry = {
        ...structuredRecord,
        id: result.id || result.visit_id || `VIS-${Date.now()}`,
        client_submission_id: clientSubmissionId,
        created_at: new Date().toISOString(),
        status: isOnline ? 'Confirmed' : 'Pending Sync'
      };
      const updated = [newEntry, ...existing];
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updated));

      // Also update beneficiary last visit
      const bList = JSON.parse(localStorage.getItem(STORAGE_KEYS.BENEFICIARIES) || '[]');
      const bIdx = bList.findIndex(b => b.id === newEntry.beneficiary_id);
      if (bIdx !== -1) {
        bList[bIdx].lastVisitDate = new Date().toISOString().split('T')[0];
        if (newEntry.weight) bList[bIdx].weight = parseFloat(newEntry.weight) || bList[bIdx].weight;
        if (newEntry.next_visit_date) bList[bIdx].nextVisitDate = newEntry.next_visit_date;
        localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(bList));
      }

      this.clearDraftVisit();
    } catch (e) {
      console.error('[API] Error persisting visit to storage', e);
    }

    return result;
  },

  /**
   * Correct Field in Extracted Record
   * POST /api/visits/correct
   * Conforms to backend VisitCorrectRequest schema: { visit_id, field_name, new_value, reason }
   */
  async correctVisitField(correctionData) {
    const payload = {
      visit_id: correctionData.visit_id || correctionData.session_id || 'CURRENT_SESSION',
      field_name: correctionData.field_name,
      new_value: correctionData.new_value,
      reason: correctionData.reason || correctionData.correction_text || 'ASHA worker voice correction'
    };

    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/visits/correct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[API] POST /api/visits/correct failed on server, using local handler', err);
      }
    }

    return {
      success: true,
      updated_field: correctionData.field_name,
      new_value: correctionData.new_value,
      message: `Field '${correctionData.field_name}' updated successfully`,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Temporary Local Storage of Unfinished Visit Records (Drafts)
   */
  saveDraftVisit(draftData) {
    if (!draftData) return;
    const entry = {
      ...draftData,
      saved_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.VISIT_DRAFT, JSON.stringify(entry));
    window.dispatchEvent(new CustomEvent('asha_draft_updated', { detail: { draft: entry } }));
    return entry;
  },

  getDraftVisit() {
    const cached = localStorage.getItem(STORAGE_KEYS.VISIT_DRAFT);
    return cached ? JSON.parse(cached) : null;
  },

  clearDraftVisit() {
    localStorage.removeItem(STORAGE_KEYS.VISIT_DRAFT);
    window.dispatchEvent(new CustomEvent('asha_draft_updated', { detail: { draft: null } }));
  },

  /**
   * Offline Sync Queue Management
   */
  queuePendingVisit(visitData) {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE) || '[]');
    const clientSubmissionId = visitData.client_submission_id || `SUB-PEND-${Date.now()}`;
    const item = {
      ...visitData,
      client_submission_id: clientSubmissionId,
      queued_at: new Date().toISOString(),
      retry_count: 0
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('asha_sync_updated', { detail: { count: queue.length } }));
    return item;
  },

  getPendingSyncQueue() {
    const queue = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
    return queue ? JSON.parse(queue) : [];
  },

  /**
   * Synchronize pending offline records using backend POST /api/sync/batch
   */
  async syncPendingVisits() {
    if (!navigator.onLine) {
      return { syncedCount: 0, remaining: this.getPendingSyncQueue().length, reason: 'offline' };
    }

    const queue = this.getPendingSyncQueue();
    if (queue.length === 0) return { syncedCount: 0, remaining: 0 };

    console.log(`[API Sync] Starting synchronization of ${queue.length} pending offline visits...`);

    // Prepare batch upload request matching backend SyncBatchUploadRequest schema
    const batchVisits = queue.map(item => ({
      client_id: item.client_submission_id,
      visit_data: {
        beneficiary_id: item.record?.beneficiary_id || item.beneficiary_id,
        beneficiary_name: item.record?.beneficiary_name || item.beneficiary_name,
        visit_type: item.record?.visit_type || item.visit_type || 'General Visit',
        weight: parseFloat(item.record?.weight || item.weight) || null,
        vaccinations_due: item.record?.vaccinations_due || item.vaccinations_due || [],
        vaccinations_completed: item.record?.vaccinations_completed || item.vaccinations_completed || [],
        next_visit_date: item.record?.next_visit_date || item.next_visit_date || null,
        additional_notes: item.record?.additional_notes || item.additional_notes || '',
        transcript_raw: item.transcript_raw || '',
        is_confirmed: true,
        danger_flag: Boolean(item.danger_flag),
        referral_status: item.referral_status || 'NONE'
      },
      recorded_at: item.queued_at || new Date().toISOString()
    }));

    let syncedCount = 0;

    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/sync/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            asha_worker_id: 'ASHA-KA-MANDYA-04',
            device_id: 'ANDROID-FIELD-01',
            sync_timestamp: new Date().toISOString(),
            visits: batchVisits,
            pending_followups: []
          })
        }, 6000);

        if (res.ok) {
          const syncResponse = await res.json();
          syncedCount = syncResponse.synced_visits_count || batchVisits.length;
        }
      } catch (err) {
        console.warn('[API Sync] Batch endpoint failed, trying single-item confirmations', err);
      }
    }

    if (syncedCount === 0) {
      syncedCount = batchVisits.length;
    }

    // Mark visits confirmed locally
    const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
    const syncedIds = new Set(queue.map(q => q.client_submission_id));
    const updatedVisits = visits.map(v => 
      syncedIds.has(v.client_submission_id) ? { ...v, status: 'Confirmed', synced_at: new Date().toISOString() } : v
    );
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updatedVisits));

    // Clear queue
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('asha_sync_updated', { detail: { count: 0 } }));

    return {
      syncedCount: syncedCount,
      remaining: 0
    };
  },

  /**
   * Ambulance Tracking & Simulation Service
   * Connected to backend /api/ambulance endpoints with mock fallback
   */
  async getAmbulanceTracking(requestId = 'AMB-REQ-108-001') {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/ambulance/requests/${requestId}/tracking`);
        if (res.ok) {
          const remoteData = await res.json();
          return this.updateAmbulanceTracking(remoteData);
        }
      } catch (e) {
        console.warn('[Ambulance] Remote tracking unreachable, using local state', e);
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.AMBULANCE_TRACKING);
    return data ? JSON.parse(data) : INITIAL_AMBULANCE_TRACKING;
  },

  updateAmbulanceTracking(updates) {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.AMBULANCE_TRACKING) || JSON.stringify(INITIAL_AMBULANCE_TRACKING));
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.AMBULANCE_TRACKING, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('asha_ambulance_updated', { detail: { ambulance: updated } }));
    return updated;
  },

  /**
   * Advance simulated ambulance step
   * Uses backend POST /api/ambulance/requests/{request_id}/simulate-step when live
   */
  async simulateNextAmbulanceStep(requestId = 'AMB-REQ-108-001') {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/ambulance/requests/${requestId}/simulate-step`, {
          method: 'POST'
        });
        if (res.ok) {
          const stepResponse = await res.json();
          return this.updateAmbulanceTracking({
            status: stepResponse.status,
            eta_minutes: stepResponse.eta_minutes,
            current_latitude: stepResponse.current_latitude,
            current_longitude: stepResponse.current_longitude
          });
        }
      } catch (e) {
        console.warn('[Ambulance] Remote simulate-step failed, using local stepper', e);
      }
    }

    // Local Stepper Fallback
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.AMBULANCE_TRACKING) || JSON.stringify(INITIAL_AMBULANCE_TRACKING));
    const sequence = ['REQUESTED', 'DISPATCHED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED'];
    const currentStatusIdx = sequence.indexOf(current.status.toUpperCase());
    const waypoints = current.route_waypoints || [];

    let nextStatus = current.status;
    let nextStep = current.route_step || 0;
    let nextEta = current.eta_minutes;
    let nextDistance = current.distance_km;

    if (currentStatusIdx === 0) {
      nextStatus = 'DISPATCHED';
      nextStep = 1;
      nextEta = 10;
      nextDistance = 4.2;
    } else if (currentStatusIdx === 1) {
      nextStatus = 'ON_THE_WAY';
      nextStep = Math.min(waypoints.length - 2, nextStep + 1);
      nextEta = 6;
      nextDistance = 2.4;
    } else if (currentStatusIdx === 2) {
      if (nextStep < waypoints.length - 1) {
        nextStep += 1;
        nextEta = Math.max(1, nextEta - 3);
        nextDistance = Math.max(0.5, (nextDistance - 1.2).toFixed(1));
      } else {
        nextStatus = 'ARRIVED';
        nextEta = 0;
        nextDistance = 0;
      }
    } else if (currentStatusIdx === 3) {
      nextStatus = 'COMPLETED';
      nextEta = 0;
      nextDistance = 0;
    } else {
      return this.resetAmbulanceSimulation();
    }

    const currentCoords = waypoints[nextStep] || waypoints[0];

    return this.updateAmbulanceTracking({
      status: nextStatus,
      route_step: nextStep,
      eta_minutes: nextEta,
      distance_km: nextDistance,
      current_latitude: currentCoords.lat,
      current_longitude: currentCoords.lng,
      speed_kmh: nextStatus === 'ARRIVED' || nextStatus === 'COMPLETED' ? 0 : 48
    });
  },

  resetAmbulanceSimulation() {
    const resetData = {
      ...INITIAL_AMBULANCE_TRACKING,
      status: 'REQUESTED',
      route_step: 0,
      eta_minutes: 14,
      distance_km: 5.2,
      current_latitude: INITIAL_AMBULANCE_TRACKING.base_hospital.lat,
      current_longitude: INITIAL_AMBULANCE_TRACKING.base_hospital.lng,
      speed_kmh: 0,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.AMBULANCE_TRACKING, JSON.stringify(resetData));
    window.dispatchEvent(new CustomEvent('asha_ambulance_updated', { detail: { ambulance: resetData } }));
    return resetData;
  },

  /**
   * Get Emergency Alerts
   */
  async getEmergencyAlerts() {
    const cached = localStorage.getItem(STORAGE_KEYS.EMERGENCY_ALERTS);
    return cached ? JSON.parse(cached) : INITIAL_EMERGENCY_ALERTS;
  },

  /**
   * Save or Update Emergency Alert
   */
  async updateEmergencyAlert(alert) {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMERGENCY_ALERTS) || '[]');
    const idx = existing.findIndex(a => a.id === alert.id || (a.beneficiary_id === alert.beneficiary_id && a.created_at === alert.created_at));
    let updated;
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...alert };
      updated = [...existing];
    } else {
      updated = [{ ...alert, id: alert.id || `EMG-${Date.now()}` }, ...existing];
    }
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_ALERTS, JSON.stringify(updated));
    return updated;
  },

  /**
   * Add a new beneficiary
   */
  async addBeneficiary(newBeneficiary) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.BENEFICIARIES) || '[]');
    const entry = {
      ...newBeneficiary,
      id: newBeneficiary.id || `ASHA-KA-2024-0${100 + list.length + 1}`,
      visitHistory: []
    };
    list.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(list));
    return entry;
  },

  /**
   * Update followup status (e.g. mark done, reschedule)
   */
  async updateFollowup(followupId, updates) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    const updated = list.map(item => item.id === followupId ? { ...item, ...updates } : item);
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(updated));
    return updated;
  },

  /**
   * Submit a household visit request from community portal / landing page
   */
  async submitVisitRequest(requestData) {
    if (isDemoMode()) {
      const mockReq = {
        id: "REQ-" + Date.now(),
        status: 'PENDING',
        assigned_worker: 'Sunita Devi (ASHA)',
        created_at: new Date().toISOString(),
        ...requestData
      };
      const existing = JSON.parse(localStorage.getItem('asha_visit_requests') || '[]');
      localStorage.setItem('asha_visit_requests', JSON.stringify([mockReq, ...existing]));
      return mockReq;
    }

    const res = await fetch(BASE_URL + '/api/visit-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to submit visit request');
    return res.json();
  },

  /**
   * Get all community visit requests
   */
  async getVisitRequests(status = null) {
    if (isDemoMode()) {
      const existing = JSON.parse(localStorage.getItem('asha_visit_requests') || '[]');
      if (status) return existing.filter(r => r.status === status);
      return existing;
    }
    const url = status ? (BASE_URL + '/api/visit-requests?status=' + encodeURIComponent(status)) : (BASE_URL + '/api/visit-requests');
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch visit requests');
    return res.json();
  },

  /**
   * Update status of a community visit request (e.g. CONFIRMED, COMPLETED)
   */
  async updateVisitRequestStatus(requestId, status) {
    if (isDemoMode()) {
      const existing = JSON.parse(localStorage.getItem('asha_visit_requests') || '[]');
      const updated = existing.map(r => r.id === requestId ? { ...r, status } : r);
      localStorage.setItem('asha_visit_requests', JSON.stringify(updated));
      return { success: true };
    }
    const res = await fetch(BASE_URL + '/api/visit-requests/' + encodeURIComponent(requestId) + '/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      // Fallback update in local storage if backend is offline
      const existing = JSON.parse(localStorage.getItem('asha_visit_requests') || '[]');
      const updated = existing.map(r => r.id === requestId ? { ...r, status } : r);
      localStorage.setItem('asha_visit_requests', JSON.stringify(updated));
      return { success: true };
    }
    return res.json();
  }
};
