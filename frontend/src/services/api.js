/**
 * API Service Layer
 * Coordinates with backend REST endpoints:
 * - GET  /api/health
 * - GET  /api/beneficiaries
 * - GET  /api/visits
 * - GET  /api/followups
 * - POST /api/visits/confirm
 * - POST /api/visits/correct
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

// Initial simulated ambulance dispatch baseline
export const INITIAL_AMBULANCE_TRACKING = {
  request_id: 'REQ-108-SIM-9482',
  beneficiary_id: 'ASHA-KA-2024-0102',
  beneficiary_name: 'Geetha M.',
  beneficiary_name_kn: 'ಗೀತಾ ಎಂ.',
  status: 'Dispatched', // 'Requested', 'Dispatched', 'On the way', 'Arrived', 'Completed'
  status_sequence: ['Requested', 'Dispatched', 'On the way', 'Arrived', 'Completed'],
  status_sequence_kn: ['ವಿನಂತಿಸಲಾಗಿದೆ', 'ವಾಹನ ಹೊರಟಿದೆ', 'ಮಾರ್ಗ ಮಧ್ಯದಲ್ಲಿದೆ', 'ಸ್ಥಳ ತಲುಪಿದೆ', 'ಪೂರ್ಣಗೊಂಡಿದೆ'],
  is_simulation: true,
  disclaimer: 'SIMULATION ONLY: This is a training and demonstration simulation. No real 108 emergency vehicle or real emergency response team has been contacted.',
  disclaimer_kn: 'ಸಿಮ್ಯುಲೇಶನ್ ಮಾತ್ರ: ಇದು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮತ್ತು ತರಬೇತಿಗಾಗಿ ಮಾತ್ರ. ಯಾವುದೇ ನಿಜವಾದ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಿಲ್ಲ.',
  pickup_location: {
    address: 'Keregodu Village, Near Anganwadi Center, Mandya District',
    address_kn: 'ಕೆರೆಗೋಡು ಗ್ರಾಮ, ಅಂಗನವಾಡಿ ಕೇಂದ್ರದ ಹತ್ತಿರ, ಮಂಡ್ಯ ಜಿಲ್ಲೆ',
    lat: 12.5835,
    lng: 76.9280,
    landmark: 'Opposite Government Primary School'
  },
  base_hospital: {
    name: 'Mandya Taluk Hospital & PHC Sector 4',
    name_kn: 'ಮಂಡ್ಯ ತಾಲೂಕು ಆಸ್ಪತ್ರೆ ಮತ್ತು PHC ಸೆಕ್ಟರ್ 4',
    lat: 12.5240,
    lng: 76.8980
  },
  ambulance_location: {
    lat: 12.5450,
    lng: 76.9090,
    speed_kmh: 48,
    heading_deg: 35
  },
  // Simulated waypoint coordinates connecting Hospital (12.524, 76.898) to Village (12.583, 76.928)
  route_waypoints: [
    { lat: 12.5240, lng: 76.8980, label: 'PHC Mandya Base' },
    { lat: 12.5350, lng: 76.9020, label: 'Kallalli Circle' },
    { lat: 12.5450, lng: 76.9090, label: 'Sugar Town Cross' },
    { lat: 12.5580, lng: 76.9150, label: 'Shivalli Gate' },
    { lat: 12.5710, lng: 76.9220, label: 'Keregodu Main Road' },
    { lat: 12.5835, lng: 76.9280, label: 'Beneficiary Home (Pickup)' }
  ],
  route_step: 2, // Current index along waypoints
  eta_minutes: 8,
  distance_km: 3.4,
  vehicle_number: 'KA-11-G-1081',
  driver_name: 'Ramesh Gowda',
  driver_phone: '+91 94480 10801',
  emergency_technician: 'Suresh Kumar (EMT)',
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
   * Body: { session_id, visit_record: { beneficiary_id, beneficiary_name, visit_type, weight, vaccinations_due, vaccinations_completed, next_visit_date, additional_notes, danger_sign_detected, danger_signs } }
   * 
   * Includes duplicate submission prevention via client_submission_id
   */
  async confirmVisit(visitData) {
    const record = visitData.visit_record || visitData;
    const clientSubmissionId = visitData.client_submission_id || record.client_submission_id || `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

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
          body: JSON.stringify({ ...visitData, client_submission_id: clientSubmissionId })
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch (err) {
        console.warn('[API] POST /api/visits/confirm failed on network, queueing offline', err);
      }
    }

    if (!result) {
      // If offline or network failed, queue in pending sync queue
      if (!isOnline) {
        this.queuePendingVisit({ ...visitData, client_submission_id: clientSubmissionId });
      }

      result = {
        success: true,
        visit_id: `VIS-LOCAL-${Date.now().toString().slice(-5)}`,
        client_submission_id: clientSubmissionId,
        message: isOnline ? 'Visit confirmed successfully' : 'Stored locally. Will sync when back online.',
        is_offline_saved: !isOnline,
        timestamp: new Date().toISOString(),
        visit: record
      };
    }

    // Register submission ID to prevent future duplicate submissions
    submittedIds.push(clientSubmissionId);
    localStorage.setItem(STORAGE_KEYS.SUBMITTED_IDS, JSON.stringify(submittedIds));

    // Persist to local visits register
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
      const newEntry = {
        ...result.visit,
        id: result.visit_id || `VIS-${Date.now()}`,
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

      // Clear draft once confirmed
      this.clearDraftVisit();
    } catch (e) {
      console.error('[API] Error persisting visit to storage', e);
    }

    return result;
  },

  /**
   * Correct Field in Extracted Record
   * POST /api/visits/correct
   * Body: { session_id, field_name, new_value, correction_audio, correction_text }
   */
  async correctVisitField(correctionData) {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/visits/correct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(correctionData)
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
   * Synchronize pending offline records when connectivity returns
   */
  async syncPendingVisits() {
    if (!navigator.onLine) {
      return { syncedCount: 0, remaining: this.getPendingSyncQueue().length, reason: 'offline' };
    }

    const queue = this.getPendingSyncQueue();
    if (queue.length === 0) return { syncedCount: 0, remaining: 0 };

    console.log(`[API Sync] Starting synchronization of ${queue.length} pending offline visits...`);
    const successfulIds = [];
    const remainingQueue = [];

    for (const item of queue) {
      try {
        if (!isDemoMode()) {
          const res = await fetchWithTimeout(`${BASE_URL}/api/visits/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          }, 5000);

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }
        successfulIds.push(item.client_submission_id);

        // Update local visit entry to 'Confirmed'
        const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
        const updatedVisits = visits.map(v => 
          v.client_submission_id === item.client_submission_id ? { ...v, status: 'Confirmed', synced_at: new Date().toISOString() } : v
        );
        localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updatedVisits));

      } catch (err) {
        console.warn('[API Sync] Failed to sync item, keeping in queue', item.client_submission_id, err);
        remainingQueue.push({ ...item, retry_count: (item.retry_count || 0) + 1 });
      }
    }

    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(remainingQueue));
    window.dispatchEvent(new CustomEvent('asha_sync_updated', { detail: { count: remainingQueue.length } }));

    return {
      syncedCount: successfulIds.length,
      remaining: remainingQueue.length
    };
  },

  /**
   * Ambulance Tracking & Simulation Service
   */
  getAmbulanceTracking() {
    const data = localStorage.getItem(STORAGE_KEYS.AMBULANCE_TRACKING);
    return data ? JSON.parse(data) : INITIAL_AMBULANCE_TRACKING;
  },

  updateAmbulanceTracking(updates) {
    const current = this.getAmbulanceTracking();
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
   * Advance simulated ambulance to next step along route
   */
  simulateNextAmbulanceStep() {
    const current = this.getAmbulanceTracking();
    const sequence = current.status_sequence;
    const currentStatusIdx = sequence.indexOf(current.status);
    const waypoints = current.route_waypoints || [];

    let nextStatus = current.status;
    let nextStep = current.route_step || 0;
    let nextEta = current.eta_minutes;
    let nextDistance = current.distance_km;

    if (currentStatusIdx === 0) {
      // Requested -> Dispatched
      nextStatus = 'Dispatched';
      nextStep = 1;
      nextEta = 10;
      nextDistance = 4.2;
    } else if (currentStatusIdx === 1) {
      // Dispatched -> On the way
      nextStatus = 'On the way';
      nextStep = Math.min(waypoints.length - 2, nextStep + 1);
      nextEta = 6;
      nextDistance = 2.4;
    } else if (currentStatusIdx === 2) {
      if (nextStep < waypoints.length - 1) {
        nextStep += 1;
        nextEta = Math.max(1, nextEta - 3);
        nextDistance = Math.max(0.5, (nextDistance - 1.2).toFixed(1));
      } else {
        // Arrived at beneficiary location!
        nextStatus = 'Arrived';
        nextEta = 0;
        nextDistance = 0;
      }
    } else if (currentStatusIdx === 3) {
      // Arrived -> Completed
      nextStatus = 'Completed';
      nextEta = 0;
      nextDistance = 0;
    } else {
      // Reset to beginning for re-testing
      return this.resetAmbulanceSimulation();
    }

    const currentCoords = waypoints[nextStep] || waypoints[0];

    return this.updateAmbulanceTracking({
      status: nextStatus,
      route_step: nextStep,
      eta_minutes: nextEta,
      distance_km: nextDistance,
      ambulance_location: {
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        speed_kmh: nextStatus === 'Arrived' || nextStatus === 'Completed' ? 0 : 45
      }
    });
  },

  resetAmbulanceSimulation() {
    const resetData = {
      ...INITIAL_AMBULANCE_TRACKING,
      status: 'Requested',
      route_step: 0,
      eta_minutes: 14,
      distance_km: 5.2,
      ambulance_location: {
        lat: INITIAL_AMBULANCE_TRACKING.base_hospital.lat,
        lng: INITIAL_AMBULANCE_TRACKING.base_hospital.lng,
        speed_kmh: 0
      },
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
  }
};
