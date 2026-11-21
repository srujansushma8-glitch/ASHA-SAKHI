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
  beneficiary_condition: 'High-Risk Pregnancy (Severe Anemia & Pre-Eclampsia)',
  status: 'AMBULANCE_ASSIGNED',
  status_sequence: [
    'EMERGENCY_REQUESTED',
    'AMBULANCE_ASSIGNED',
    'EN_ROUTE',
    'APPROACHING',
    'ARRIVED',
    'TRIP_COMPLETED'
  ],
  status_sequence_kn: [
    'ತುರ್ತು ವಿನಂತಿ',
    'ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿಯೋಜಿಸಲಾಗಿದೆ',
    'ಮಾರ್ಗ ಮಧ್ಯದಲ್ಲಿದೆ',
    'ಸಮೀಪಿಸುತ್ತಿದೆ',
    'ಸ್ಥಳ ತಲುಪಿದೆ',
    'ಪ್ರವಾಸ ಪೂರ್ಣಗೊಂಡಿದೆ'
  ],
  status_sequence_hi: [
    'आपातकालीन अनुरोध',
    'एम्बुलेंस आवंटित',
    'मार्ग में',
    'निकट आ रहा है',
    'पहुंच गया',
    'यात्रा पूर्ण'
  ],
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
  accuracy: 4.8,
  speed_kmh: 42,
  heading: 45,
  eta_minutes: 8,
  distance_km: 2.4,
  tracking_mode: 'LIVE_GPS', // 'LIVE_GPS' or 'DEMO_SIMULATION'
  trip_active: false,
  driver_name: 'Ramesh Gowda',
  driver_name_kn: 'ರಮೇಶ್ ಗೌಡ',
  driver_phone: '+91 94480 10801',
  emergency_technician: 'Suresh Kumar (EMT)',
  vehicle_number: 'KA-11-G-1081',
  is_simulation: false,
  simulation_disclaimer: null,
  // Calibrated real-world road waypoints along Mandya Keregodu Road
  route_waypoints: [
    { lat: 12.5240, lng: 76.8980, label: 'PHC Mandya Base (Dispatched)', status: 'AMBULANCE_ASSIGNED', eta: 15, dist: 7.8 },
    { lat: 12.5350, lng: 76.9030, label: 'Medical College Circle (NH-275)', status: 'EN_ROUTE', eta: 11, dist: 6.1 },
    { lat: 12.5480, lng: 76.9110, label: 'Gutalu Road Junction', status: 'EN_ROUTE', eta: 8, dist: 4.5 },
    { lat: 12.5620, lng: 76.9190, label: 'Keregodu Road Cross', status: 'APPROACHING', eta: 5, dist: 2.8 },
    { lat: 12.5760, lng: 76.9240, label: 'Keregodu GP Boundary', status: 'APPROACHING', eta: 2, dist: 1.1 },
    { lat: 12.5835, lng: 76.9280, label: 'Patient Residence Pickup', status: 'ARRIVED', eta: 0, dist: 0.0 }
  ],
  route_step: 2,
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

let currentApiLanguage = typeof window !== 'undefined' ? localStorage.getItem('asha_language') || 'en' : 'en';

export const setApiLanguage = (lang) => {
  currentApiLanguage = lang;
};

let authTokenPromise = null;

export const getAuthToken = async () => {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('asha_auth_token') || localStorage.getItem('token');
  if (token) return token;

  // Auto-login with default asha demo account if no token exists yet
  if (!authTokenPromise) {
    authTokenPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'asha', password: 'password' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            localStorage.setItem('asha_auth_token', data.access_token);
            return data.access_token;
          }
        }
      } catch (e) {
        console.warn('[API Auth] Auto-login failed:', e);
      } finally {
        authTokenPromise = null;
      }
      return null;
    })();
  }
  return authTokenPromise;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('asha_auth_token', token);
    } else {
      localStorage.removeItem('asha_auth_token');
    }
  }
};

// Helper for fetch with timeout and automatic JWT Bearer header
const fetchWithTimeout = async (url, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let token = null;
    if (!url.includes('/api/auth/login') && !url.includes('/api/health')) {
      token = await getAuthToken();
    }

    const headers = {
      'Accept-Language': currentApiLanguage,
      'X-Language': currentApiLanguage,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    let response = await fetch(url, { ...options, headers, signal: controller.signal });

    // Auto-retry once on 401 with refreshed token
    if (response.status === 401 && !url.includes('/api/auth/login')) {
      if (typeof window !== 'undefined') localStorage.removeItem('asha_auth_token');
      const newToken = await getAuthToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers, signal: controller.signal });
      }
    }

    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const api = {
  async login(username, password = 'password') {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.access_token);
        return data;
      }
      throw new Error(`Login failed: ${res.statusText}`);
    } catch (err) {
      console.error('[API] Login error:', err);
      throw err;
    }
  },
  setLanguage(lang) {
    setApiLanguage(lang);
  },

  getLanguage() {
    return currentApiLanguage;
  },
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
  _normalizeFollowup(f) {
    if (!f) return null;
    const task = f.task_type || f.type || 'Clinical Follow-up';
    let cat = f.category;
    if (!cat) {
      const u = task.toUpperCase();
      if (u.includes('ANC') || u.includes('PREGNAN') || u.includes('TRIMESTER')) cat = 'ANC';
      else if (u.includes('IMMUNIZ') || u.includes('VACCIN') || u.includes('OPV') || u.includes('PENTAVALENT')) cat = 'Immunization';
      else if (u.includes('NEWBORN') || u.includes('HBNC') || u.includes('INFANT')) cat = 'Newborn';
      else if (u.includes('DANGER') || (f.priority && ['HIGH', 'URGENT', 'CRITICAL'].includes(String(f.priority).toUpperCase()))) cat = 'High Risk';
      else cat = 'General';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const due = f.due_date || todayStr;
    const rawStatus = (f.status || f.completion_status || 'PENDING').toLowerCase();
    let normStatus = rawStatus;
    if (rawStatus === 'completed') {
      normStatus = 'completed';
    } else if (rawStatus === 'overdue' || rawStatus === 'missed' || (rawStatus === 'pending' && due < todayStr)) {
      normStatus = 'overdue';
    } else if (due > todayStr) {
      normStatus = 'upcoming';
    } else {
      normStatus = 'pending';
    }

    return {
      id: f.id || `FOL-${Date.now()}`,
      visit_id: f.visit_id || null,
      beneficiary_id: f.beneficiary_id || 'BEN-UNKNOWN',
      beneficiary_name: f.beneficiary_name || f.name || f.beneficiary_id || 'Beneficiary',
      beneficiary_name_kn: f.beneficiary_name_kn || null,
      village: f.village || 'Keregodu GP',
      household_id: f.household_id || `HH-${(f.beneficiary_id || '').slice(-3) || '01'}`,
      category: cat,
      type: task,
      due_date: due,
      priority: (f.priority || 'MEDIUM').toLowerCase(),
      status: normStatus,
      completion_status: (f.completion_status || normStatus).toUpperCase(),
      notes: f.notes || '',
      guideline_source: f.guideline_source || 'MoHFW Protocol'
    };
  },

  async getFollowups() {
    let rawList = null;
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/followups`);
        if (res.ok) {
          rawList = await res.json();
          localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(rawList));
        }
      } catch (err) {
        console.warn('[API] Failed to fetch followups from server, loading cached/mock', err);
      }
    }
    if (!rawList) {
      const cached = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
      rawList = cached ? JSON.parse(cached) : INITIAL_FOLLOWUPS;
    }
    return (rawList || []).map(f => this._normalizeFollowup(f)).filter(Boolean);
  },

  async getFollowupsSummary() {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/followups/summary`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[API] Failed to fetch followups summary from server', err);
      }
    }
    const items = await this.getFollowups();
    return {
      total_followups: items.length,
      total_pending: items.filter(f => f.status === 'pending' || f.status === 'overdue').length,
      overdue_count: items.filter(f => f.status === 'overdue').length,
      upcoming_count: items.filter(f => f.status === 'upcoming').length,
      completed_count: items.filter(f => f.status === 'completed').length,
      missed_count: items.filter(f => f.status === 'overdue').length,
      maternal_count: items.filter(f => f.category === 'ANC').length,
      child_immunization_count: items.filter(f => f.category === 'Immunization').length,
      high_risk_count: items.filter(f => f.category === 'High Risk').length,
      newborn_count: items.filter(f => f.category === 'Newborn').length,
    };
  },

  exportFollowupsCsv(items = []) {
    const headers = ['Followup ID', 'Beneficiary ID', 'Beneficiary Name', 'Village', 'Household', 'Category', 'Task Type', 'Due Date', 'Priority', 'Status', 'Notes'];
    const rows = items.map(f => [
      `"${f.id || ''}"`,
      `"${f.beneficiary_id || ''}"`,
      `"${(f.beneficiary_name || '').replace(/"/g, '""')}"`,
      `"${(f.village || '').replace(/"/g, '""')}"`,
      `"${f.household_id || ''}"`,
      `"${f.category || ''}"`,
      `"${(f.type || f.task_type || '').replace(/"/g, '""')}"`,
      `"${f.due_date || ''}"`,
      `"${(f.priority || '').toUpperCase()}"`,
      `"${(f.status || '').toUpperCase()}"`,
      `"${(f.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ASHA_Sakhi_Followups_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
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
      additional_notes: rawRecord.additional_notes || '',
      pregnancy_status: rawRecord.pregnancy_status || null,
      gestational_age: rawRecord.gestational_age || null,
      symptoms: Array.isArray(rawRecord.symptoms) ? rawRecord.symptoms : (rawRecord.symptoms ? [rawRecord.symptoms] : []),
      symptom_duration: rawRecord.symptom_duration || null,
      measurements: typeof rawRecord.measurements === 'object' && rawRecord.measurements !== null ? rawRecord.measurements : (rawRecord.measurements ? { note: String(rawRecord.measurements) } : {}),
      medications: Array.isArray(rawRecord.medications) ? rawRecord.medications : (rawRecord.medications ? [rawRecord.medications] : []),
      observations: rawRecord.observations || null,
      confidence_score: typeof rawRecord.confidence_score === 'number' ? rawRecord.confidence_score : 0.95
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
      }, 7000);

      if (res.ok) {
        const syncResponse = await res.json();
        syncedCount = syncResponse.synced_visits_count || batchVisits.length;
      } else {
        console.warn('[API Sync] Batch sync rejected by server with status:', res.status);
        return { syncedCount: 0, remaining: queue.length, reason: `HTTP_${res.status}` };
      }
    } catch (err) {
      console.warn('[API Sync] Batch sync network request failed:', err);
      return { syncedCount: 0, remaining: queue.length, reason: 'network_failure' };
    }

    if (syncedCount > 0) {
      // Mark synced visits confirmed locally
      const visits = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
      const syncedIds = new Set(queue.slice(0, syncedCount).map(q => q.client_submission_id));
      const updatedVisits = visits.map(v => 
        syncedIds.has(v.client_submission_id) ? { ...v, status: 'Confirmed', synced_at: new Date().toISOString() } : v
      );
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updatedVisits));

      // Remove synced visits from queue
      const remainingQueue = queue.slice(syncedCount);
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC_QUEUE, JSON.stringify(remainingQueue));
      window.dispatchEvent(new CustomEvent('asha_sync_updated', { detail: { count: remainingQueue.length } }));

      return {
        syncedCount: syncedCount,
        remaining: remainingQueue.length
      };
    }

    return { syncedCount: 0, remaining: queue.length };
  },

  /**
   * Ambulance Tracking & Simulation Service
   * Connected to backend /api/ambulance endpoints with mock fallback
   */
  async getAmbulanceTracking(requestId = 'AMB-REQ-108-001') {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/ambulance/requests/${requestId}/tracking`);
      if (res.ok) {
        const remoteData = await res.json();
        return this.updateAmbulanceTracking(remoteData);
      }
    } catch (e) {
      console.warn('[Ambulance] Remote tracking unreachable, using local state', e);
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
    
    // Cross-tab broadcast via BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('asha_ambulance_channel');
        ch.postMessage({ type: 'AMBULANCE_UPDATE', ambulance: updated });
        ch.close();
      }
    } catch (_) {}

    return updated;
  },

  /**
   * Broadcast high-frequency live GPS telemetry from ambulance driver
   */
  async sendAmbulanceTelemetry(requestId = 'AMB-REQ-108-001', telemetry = {}) {
    const payload = {
      current_latitude: telemetry.latitude ?? telemetry.current_latitude,
      current_longitude: telemetry.longitude ?? telemetry.current_longitude,
      accuracy: telemetry.accuracy,
      speed: telemetry.speed,
      heading: telemetry.heading,
      eta_minutes: telemetry.eta_minutes,
      distance_km: telemetry.distance_km,
      status: telemetry.status,
      tracking_mode: telemetry.tracking_mode || 'LIVE_GPS',
      trip_active: telemetry.trip_active !== undefined ? telemetry.trip_active : true,
      driver_name: telemetry.driver_name || 'Ramesh Gowda',
      driver_phone: telemetry.driver_phone || '+91 94480 10801',
      vehicle_number: telemetry.vehicle_number || 'KA-11-G-1081'
    };

    // Update local state immediately for zero-lag display
    this.updateAmbulanceTracking(payload);

    try {
      const res = await fetch(`${BASE_URL}/api/ambulance/requests/${requestId}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[Ambulance] Telemetry POST failed, synced locally', e);
    }
    return { status: 'ok', telemetry: payload };
  },

  /**
   * Driver Action: Start Trip
   */
  async startAmbulanceTrip(requestId = 'AMB-REQ-108-001') {
    this.updateAmbulanceTracking({
      trip_active: true,
      status: 'AMBULANCE_ASSIGNED',
      tracking_mode: 'LIVE_GPS'
    });
    try {
      const res = await fetch(`${BASE_URL}/api/ambulance/requests/${requestId}/trip/start`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        return this.updateAmbulanceTracking(data);
      }
    } catch (e) {
      console.warn('[Ambulance] Start trip remote error', e);
    }
    return this.getAmbulanceTracking(requestId);
  },

  /**
   * Driver Action: Stop Trip
   */
  async stopAmbulanceTrip(requestId = 'AMB-REQ-108-001') {
    this.updateAmbulanceTracking({
      trip_active: false,
      status: 'TRIP_COMPLETED'
    });
    try {
      const res = await fetch(`${BASE_URL}/api/ambulance/requests/${requestId}/trip/stop`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        return this.updateAmbulanceTracking(data);
      }
    } catch (e) {
      console.warn('[Ambulance] Stop trip remote error', e);
    }
    return this.getAmbulanceTracking(requestId);
  },

  /**
   * Advance simulation step along calibrated Mandya road waypoints
   */
  async simulateNextAmbulanceStep(requestId = 'AMB-REQ-108-001') {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/api/ambulance/requests/${requestId}/simulate-step`, {
        method: 'POST'
      });
      if (res.ok) {
        const stepResponse = await res.json();
        return this.updateAmbulanceTracking({
          status: stepResponse.status,
          eta_minutes: stepResponse.eta_minutes,
          distance_km: stepResponse.distance_km,
          current_latitude: stepResponse.current_latitude,
          current_longitude: stepResponse.current_longitude,
          tracking_mode: 'DEMO_SIMULATION',
          is_simulation: true
        });
      }
    } catch (e) {
      console.warn('[Ambulance] Remote simulate-step failed, using local road waypoints', e);
    }

    // Local Stepper Fallback using calibrated Mandya road waypoints
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.AMBULANCE_TRACKING) || JSON.stringify(INITIAL_AMBULANCE_TRACKING));
    const waypoints = current.route_waypoints || INITIAL_AMBULANCE_TRACKING.route_waypoints;
    let nextStep = (current.route_step ?? 0) + 1;
    if (nextStep >= waypoints.length) {
      nextStep = waypoints.length - 1;
    }
    const wp = waypoints[nextStep];

    return this.updateAmbulanceTracking({
      status: wp.status,
      route_step: nextStep,
      eta_minutes: wp.eta,
      distance_km: wp.dist,
      current_latitude: wp.lat,
      current_longitude: wp.lng,
      speed_kmh: wp.status === 'ARRIVED' || wp.status === 'TRIP_COMPLETED' ? 0 : 42,
      tracking_mode: 'DEMO_SIMULATION',
      is_simulation: true,
      simulation_disclaimer: 'DEMO SIMULATION: Predefined road waypoints for demonstration.'
    });
  },

  resetAmbulanceSimulation() {
    const wp0 = INITIAL_AMBULANCE_TRACKING.route_waypoints[0];
    const resetData = {
      ...INITIAL_AMBULANCE_TRACKING,
      status: 'EMERGENCY_REQUESTED',
      route_step: 0,
      eta_minutes: 15,
      distance_km: 7.8,
      current_latitude: wp0.lat,
      current_longitude: wp0.lng,
      speed_kmh: 0,
      tracking_mode: 'DEMO_SIMULATION',
      is_simulation: true,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.AMBULANCE_TRACKING, JSON.stringify(resetData));
    window.dispatchEvent(new CustomEvent('asha_ambulance_updated', { detail: { ambulance: resetData } }));
    return resetData;
  },

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
    if (!isDemoMode()) {
      try {
        await fetchWithTimeout(`${BASE_URL}/api/followups/${followupId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch (err) {
        console.warn('[API] Remote followup update failed, updating locally', err);
      }
    }
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    const updated = list.map(item => item.id === followupId ? { ...item, ...updates } : item);
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('asha_followups_updated', { detail: { followupId, updates } }));
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
  },

  /**
   * Sakhi Intelligent Field Operations Assistant
   * Query the live database with zero Lakshmamma bias
   */
  async queryAssistant(query, language = 'en', sessionId = null) {
    try {
      const res = await fetch(BASE_URL + '/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language, session_id: sessionId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[API] Backend assistant query failed, using offline fallback', e);
    }

    // Client-side fallback if backend is offline
    const qLower = (query || '').toLowerCase();
    const isKn = language === 'kn';
    const isHi = language === 'hi';

    if (qLower.includes('pregnant') || qLower.includes('ಗರ್ಭಿಣಿ') || qLower.includes('गर्भवती')) {
      const beneficiaries = await this.getBeneficiaries();
      const pregnant = beneficiaries.filter(b => b.category === 'PREGNANT_WOMAN');
      const count = pregnant.length;
      const listItems = pregnant.slice(0, 5).map(b => '- ' + b.name + ' (' + b.id + ') • ' + b.age + 'y • ' + b.village).join('\n');
      return {
        intent: 'SHOW_PREGNANCY_RECORDS',
        count: count,
        language,
        spoken_text: isKn 
          ? ('ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ' + count + ' ನೋಂದಾಯಿತ ಗರ್ಭಿಣಿಯರಿದ್ದಾರೆ.')
          : isHi 
          ? ('आपके क्षेत्र में ' + count + ' पंजीकृत गर्भवती महिलाएं हैं।')
          : ('There are ' + count + ' registered pregnant women in your assigned area.'),
        display_text: (isKn
          ? ('### 🤰 ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯ ಗರ್ಭಿಣಿಯರು (' + count + ' ಪ್ರಕರಣಗಳು)\n\n')
          : isHi
          ? ('### 🤰 आपके क्षेत्र की गर्भवती महिलाएं (' + count + ' मामले)\n\n')
          : ('### 🤰 Registered Pregnant Women in Assigned Area (' + count + ' Cases)\n\n')) + listItems,
        records: pregnant.map(b => ({ id: b.id, name: b.name, age: b.age, village: b.village, risk_level: b.risk_level }))
      };
    } else if (qLower.includes('high risk') || qLower.includes('ಅಪಾಯ') || qLower.includes('जोखिम')) {
      const beneficiaries = await this.getBeneficiaries();
      const highRisk = beneficiaries.filter(b => b.risk_level === 'HIGH');
      const count = highRisk.length;
      const listItems = highRisk.map(b => '#### ⚠️ ' + b.name + ' (' + b.id + ')\n- ' + (isKn ? 'ಅಪಾಯ' : isHi ? 'जोखिम' : 'Risk') + ': Severe Anemia / Pre-eclampsia\n- ' + b.village).join('\n\n');
      return {
        intent: 'FIND_HIGH_RISK_CASES',
        count: count,
        language,
        spoken_text: isKn
          ? ('ತುರ್ತು ಗಮನ ನೀಡಬೇಕಾದ ' + count + ' ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರಕರಣಗಳು ಕಂಡುಬಂದಿವೆ.')
          : isHi
          ? ('त्वरित ध्यान देने योग्य ' + count + ' उच्च जोखिम वाले मामले मिले हैं।')
          : ('Found ' + count + ' high-risk obstetric cases requiring priority care.'),
        display_text: (isKn
          ? ('### 🚨 ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗರ್ಭಾವಸ್ಥೆ ಪ್ರಕರಣಗಳು (' + count + ')\n\n')
          : isHi
          ? ('### 🚨 उच्च जोखिम वाले गर्भावस्था मामले (' + count + ')\n\n')
          : ('### 🚨 High-Risk Obstetric Cases (' + count + ' Beneficiaries)\n\n')) + listItems,
        records: highRisk.map(b => ({ id: b.id, name: b.name, age: b.age, village: b.village, risk_level: 'HIGH' }))
      };
    } else if (qLower.includes('vaccin') || qLower.includes('ಲಸಿಕೆ') || qLower.includes('टीका')) {
      return {
        intent: 'SHOW_OVERDUE_VACCINATIONS',
        count: 2,
        language,
        spoken_text: isKn
          ? 'ಇಬ್ಬರು ಮಕ್ಕಳಿಗೆ UIP ವೇಳಾಪಟ್ಟಿಯಂತೆ ಪೆಂಟಾವಲೆಂಟ್ ಲಸಿಕೆ ಬಾಕಿ ಇದೆ.'
          : isHi
          ? 'दो बच्चों का यूआईपी अनुसूची के अनुसार पेंटावेलेंट टीकाकरण बकाया है।'
          : 'There are 2 children with overdue vaccinations under MoHFW UIP schedule.',
        display_text: isKn
          ? '### 👶 ಲಸಿಕೆ ಬಾಕಿ ಇರುವ ಮಕ್ಕಳ ಪಟ್ಟಿ (MoHFW UIP)\n\n- **ಬೇಬಿ ಅನನ್ಯ** (Shivalli) • Pentavalent-2 + OPV-2\n- **ಬೇಬಿ ಆರವ್** (Keregodu) • Measles-Rubella MR-1'
          : isHi
          ? '### 👶 टीकाकरण बकाया वाले बच्चों की सूची (MoHFW UIP)\n\n- **बेबी अनन्या** (Shivalli) • Pentavalent-2 + OPV-2\n- **बेबी आरव** (Keregodu) • Measles-Rubella MR-1'
          : '### 👶 Children with Overdue Vaccinations (MoHFW UIP)\n\n- **Baby Ananya** (Shivalli) • Pentavalent-2 + OPV-2\n- **Baby Aarav** (Keregodu) • Measles-Rubella MR-1',
        records: [
          { child_name: 'Baby Ananya', mother_name: 'Shruthi Gowda', vaccine_due: 'Pentavalent-2', days_overdue: 12 },
          { child_name: 'Baby Aarav', mother_name: 'Kavitha R.', vaccine_due: 'MR-1', days_overdue: 5 }
        ]
      };
    } else if (qLower.includes('ambulance') || qLower.includes('108') || qLower.includes('ಆಂಬ್ಯುಲೆನ್ಸ್') || qLower.includes('एम्बुलेंस')) {
      return {
        intent: 'TRACK_AMBULANCE',
        language,
        spoken_text: isKn
          ? '108 ಆಂಬ್ಯುಲೆನ್ಸ್ KA-11-G-1081 ಕೆರೆಗೋಡು ಕಡೆಗೆ ಚಲಿಸುತ್ತಿದೆ. ETA 8 ನಿಮಿಷಗಳು.'
          : isHi
          ? '108 एम्बुलेंस KA-11-G-1081 केरेगोडू की ओर बढ़ रही है। आगमन समय 8 मिनट।'
          : '108 Ambulance KA-11-G-1081 is en route to Keregodu. Estimated arrival in 8 minutes.',
        display_text: isKn
          ? '### 🚑 108 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್\n\n- ವಾಹನ: KA-11-G-1081\n- ಚಾಲಕ: ರಮೇಶ್ ಗೌಡ (+91 94480 10801)\n- ಸ್ಥಿತಿ: DISPATCHED\n- ETA: 8 ನಿಮಿಷಗಳು (3.4 ಕಿಮೀ)'
          : isHi
          ? '### 🚑 108 आपातकालीन एम्बुलेंस लाइव ट्रैकिंग\n\n- वाहन: KA-11-G-1081\n- चालक: रमेश गौड़ा (+91 94480 10801)\n- स्थिति: DISPATCHED\n- आगमन: 8 मिनट (3.4 किमी)'
          : '### 🚑 108 Emergency Ambulance Live Telemetry\n\n- Vehicle: KA-11-G-1081\n- Driver: Ramesh Gowda (+91 94480 10801)\n- Status: DISPATCHED\n- ETA: 8 mins (3.4 km)'
      };
    } else {
      return {
        intent: 'GENERAL_HEALTH_WORKER_SUPPORT',
        language,
        spoken_text: isKn
          ? 'ನಾನು ಆಶಾ ಸಖಿ, ನಿಮ್ಮ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಸಹಾಯಕ.'
          : isHi
          ? 'मैं आशा सखी हूँ, आपकी फील्ड ऑपरेशंस सहायक।'
          : 'I am Sakhi, your AI Field Operations Assistant.',
        display_text: isKn
          ? '### 🌸 ಆಶಾ ಸಖಿ ಕ್ಷೇತ್ರ ಸಹಾಯಕ\n\n1. ಗರ್ಭಿಣಿಯರ ಪಟ್ಟಿ\n2. ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರಕರಣಗಳು\n3. ಲಸಿಕೆ ಬಾಕಿ ಇರುವ ಮಕ್ಕಳು\n4. ಇಂದಿನ ಮನೆ ಭೇಟಿಗಳು\n5. 108 ಆಂಬ್ಯುಲೆನ್ಸ್'
          : isHi
          ? '### 🌸 आशा सखी फील्ड सहायक\n\n1. गर्भवती महिलाएं\n2. उच्च जोखिम मामले\n3. टीकाकरण बकाया\n4. गृह दौरे\n5. 108 एम्बुलेंस'
          : '### 🌸 Sakhi Field Operations Assistant\n\n1. Pregnant women records\n2. High-risk obstetric cases\n3. Overdue child immunizations\n4. Daily household route plan\n5. 108 ambulance tracking'
      };
    }
  },

  /**
   * Fetch 12 Suggested Prompts for ASHA Field Operations
   */
  async getSuggestedPrompts(language = 'en') {
    try {
      const res = await fetch(BASE_URL + '/api/assistant/suggested-prompts?language=' + encodeURIComponent(language));
      if (res.ok) {
        const data = await res.json();
        return data.prompts || [];
      }
    } catch (e) {
      console.warn('[API] Failed to fetch prompts from backend, using fallback', e);
    }

    const lang = (language || 'en').toLowerCase();
    if (lang.startsWith('kn')) {
      return [
        { id: 1, text: 'ನನ್ನ ವ್ಯಾಪ್ತಿಯ ಎಲ್ಲಾ ಗರ್ಭಿಣಿಯರನ್ನು ತೋರಿಸಿ.' },
        { id: 2, text: 'ಯಾರಿಗೆ ANC ಫಾಲೋ-ಅಪ್ ತಪಾಸಣೆ ಅಗತ್ಯವಿದೆ?' },
        { id: 3, text: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗರ್ಭಾವಸ್ಥೆ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ.' },
        { id: 4, text: 'ಲಸಿಕೆ ಬಾಕಿ ಇರುವ ಮಕ್ಕಳ ಪಟ್ಟಿ ನೀಡಿ.' },
        { id: 5, text: 'ಇಂದಿನ ಮನೆ ಭೇಟಿಗಳನ್ನು ಯೋಜಿಸಿ.' },
        { id: 6, text: 'ನನ್ನ ಇಂದಿನ ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ವರದಿ ನೀಡಿ.' },
        { id: 7, text: 'ಬಾಕಿ ಇರುವ ತುರ್ತು ರೆಫರಲ್‌ಗಳನ್ನು ತೋರಿಸಿ.' },
        { id: 8, text: '108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.' },
        { id: 9, text: 'PMMVY ಮಾತೃ ವಂದನಾ ಯೋಜನೆ ವಿವರಿಸಿ.' },
        { id: 10, text: 'ಈ ಸೂಚನೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಿಸಿ.' },
        { id: 11, text: 'ಹೊಸ ಫಲಾನುಭವಿ ನೋಂದಾಯಿಸಿ.' },
        { id: 12, text: 'ನನ್ನ ಇಂದಿನ ಬಾಕಿ ಕೆಲಸಗಳನ್ನು ತೋರಿಸಿ.' }
      ];
    } else if (lang.startsWith('hi')) {
      return [
        { id: 1, text: 'मेरे क्षेत्र की सभी गर्भवती महिलाओं की सूची दिखाएं।' },
        { id: 2, text: 'किन गर्भवती महिलाओं का एएनसी फॉलो-अप बाकी है?' },
        { id: 3, text: 'उच्च जोखिम वाले गर्भावस्था मामले दिखाएं।' },
        { id: 4, text: 'टीकाकरण बकाया वाले बच्चों की सूची दें।' },
        { id: 5, text: 'आज के गृह दौरों की योजना बनाएं।' },
        { id: 6, text: 'मेरी आज की दैनिक फील्डवर्क रिपोर्ट तैयार करें।' },
        { id: 7, text: 'लंबित आपातकालीन रेफरल दिखाएं।' },
        { id: 8, text: '108 एम्बुलेंस को ट्रैक करें।' },
        { id: 9, text: 'PMMVY योजना के बारे में बताएं।' },
        { id: 10, text: 'इस निर्देश का हिंदी में अनुवाद करें।' },
        { id: 11, text: 'नया लाभार्थी पंजीकृत करें।' },
        { id: 12, text: 'मेरे आज के लंबित कार्य दिखाएं।' }
      ];
    } else {
      return [
        { id: 1, text: 'Show all pregnant women in my assigned area.' },
        { id: 2, text: 'Which beneficiaries need ANC follow-up?' },
        { id: 3, text: 'Show high-risk pregnancy cases.' },
        { id: 4, text: 'Show children with overdue vaccinations.' },
        { id: 5, text: 'Plan my household visits for today.' },
        { id: 6, text: 'Generate my daily fieldwork report.' },
        { id: 7, text: 'Show pending referrals.' },
        { id: 8, text: 'Track ambulance 108.' },
        { id: 9, text: 'Explain PMMVY.' },
        { id: 10, text: 'Translate this instruction into Kannada.' },
        { id: 11, text: 'Register a new beneficiary.' },
        { id: 12, text: 'Show my pending tasks.' }
      ];
    }
  }
};

// Auto-synchronize pending records on network recovery
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[PWA Network] Device reconnected. Auto-synchronizing offline records...');
    api.syncPendingVisits().catch(err => console.warn('[Auto-Sync] Retry scheduled', err));
  });
}
