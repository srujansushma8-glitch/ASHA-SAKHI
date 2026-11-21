/**
 * ASHA SAKHI - API Service Layer
 * Coordinates with backend REST endpoints:
 * - GET  /api/health
 * - GET  /api/beneficiaries
 * - GET  /api/visits
 * - GET  /api/followups
 * - POST /api/visits/confirm
 * - POST /api/visits/correct
 * - POST /api/ambulance/requests
 * - GET  /api/ambulance/requests
 * - POST /api/ambulance/requests/{id}/simulate-step
 * - GET  /api/ambulance/requests/{id}/tracking
 *
 * Supports offline storage and instant fallback to verified synthetic mock data
 * when backend is unreachable or running in Demo Mode.
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
  AMBULANCE_REQUESTS: 'asha_ambulance_requests_v1',
  DEMO_MODE: 'asha_demo_mode_active'
};

// Initial simulated ambulance request for demonstration
const INITIAL_AMBULANCE_REQUESTS = [
  {
    request_id: 'AMB-REQ-001',
    emergency_id: 'EMG-001',
    beneficiary_id: 'BEN-KA-002',
    pickup_location: 'Shivalli Village, Sector 4, Mandya',
    destination_facility: 'Mandya Taluk Hospital / PHC',
    status: 'DISPATCHED',
    is_simulation: true,
    simulation_disclaimer: 'SIMULATION ONLY: This is a simulated 108 ambulance dispatch for testing purposes.',
    eta_minutes: 8,
    progress_percentage: 35.0,
    driver_name: 'ರಮೇಶ್ ಕುಮಾರ್ (Ramesh Kumar)',
    driver_phone: '+91 94480 12108',
    vehicle_number: 'KA-11-G-1080',
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  }
];

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
  if (!localStorage.getItem(STORAGE_KEYS.AMBULANCE_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.AMBULANCE_REQUESTS, JSON.stringify(INITIAL_AMBULANCE_REQUESTS));
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
   */
  async confirmVisit(visitData) {
    let result = null;
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/visits/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitData)
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch (err) {
        console.warn('[API] POST /api/visits/confirm failed on network, saving offline', err);
      }
    }

    if (!result) {
      result = {
        success: true,
        visit_id: `VIS-LOCAL-${Date.now().toString().slice(-5)}`,
        message: 'Visit confirmed and recorded successfully',
        timestamp: new Date().toISOString(),
        visit: visitData.visit_record || visitData
      };
    }

    // Persist to local visits register
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
      const newEntry = {
        ...result.visit,
        id: result.visit_id || `VIS-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'Confirmed'
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
    } catch (e) {
      console.error('[API] Error persisting visit to storage', e);
    }

    return result;
  },

  /**
   * Correct Field in Extracted Record
   * POST /api/visits/correct
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
   * Update followup status
   */
  async updateFollowup(followupId, updates) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    const updated = list.map(item => item.id === followupId ? { ...item, ...updates } : item);
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(updated));
    return updated;
  },

  /**
   * ==========================================
   * AMBULANCE SIMULATION API CLIENT
   * ==========================================
   */

  /**
   * Create Simulated Ambulance Request
   * POST /api/ambulance/requests
   */
  async createAmbulanceRequest(requestData) {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/ambulance/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[API] POST /api/ambulance/requests failed, using local simulation', err);
      }
    }

    // Local / Offline Simulation
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.AMBULANCE_REQUESTS) || '[]');
    const newReq = {
      request_id: `AMB-SIM-${Date.now().toString().slice(-4)}`,
      beneficiary_id: requestData.beneficiary_id || 'BEN-KA-001',
      emergency_id: requestData.emergency_id || 'EMG-SIM-1',
      visit_id: requestData.visit_id || null,
      pickup_location: requestData.pickup_location || 'Shivalli Village, Mandya Sector 4',
      destination_facility: requestData.destination_facility || 'Mandya Taluk Hospital / PHC',
      status: 'REQUESTED',
      is_simulation: true,
      simulation_disclaimer: 'SIMULATION ONLY: This is a simulated 108 ambulance dispatch for testing purposes.',
      eta_minutes: 12,
      progress_percentage: 10.0,
      driver_name: 'ರಮೇಶ್ ಕುಮಾರ್ (Ramesh Kumar)',
      driver_phone: '+91 94480 12108',
      vehicle_number: 'KA-11-G-1080',
      created_at: new Date().toISOString()
    };
    existing.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.AMBULANCE_REQUESTS, JSON.stringify(existing));
    return newReq;
  },

  /**
   * Get Ambulance Requests
   * GET /api/ambulance/requests
   */
  async getAmbulanceRequests(beneficiaryId = null) {
    if (!isDemoMode()) {
      try {
        const url = beneficiaryId 
          ? `${BASE_URL}/api/ambulance/requests?beneficiary_id=${encodeURIComponent(beneficiaryId)}`
          : `${BASE_URL}/api/ambulance/requests`;
        const res = await fetchWithTimeout(url);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[API] GET /api/ambulance/requests failed, reading local', err);
      }
    }
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.AMBULANCE_REQUESTS) || '[]');
    if (beneficiaryId) {
      return cached.filter(r => r.beneficiary_id === beneficiaryId);
    }
    return cached.length ? cached : INITIAL_AMBULANCE_REQUESTS;
  },

  /**
   * Advance Simulated Ambulance Step
   * POST /api/ambulance/requests/{id}/simulate-step
   * Status progression: REQUESTED -> DISPATCHED -> ON_THE_WAY -> ARRIVED -> COMPLETED
   */
  async stepAmbulanceSimulation(requestId) {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/ambulance/requests/${requestId}/simulate-step`, {
          method: 'POST'
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[API] Step ambulance simulation failed on server, advancing locally', err);
      }
    }

    // Local Stepper
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.AMBULANCE_REQUESTS) || '[]');
    const idx = cached.findIndex(r => r.request_id === requestId);
    if (idx !== -1) {
      const current = cached[idx];
      let nextStatus = 'DISPATCHED';
      let nextEta = 8;
      let nextProgress = 35.0;

      if (current.status === 'REQUESTED') {
        nextStatus = 'DISPATCHED';
        nextEta = 8;
        nextProgress = 35.0;
      } else if (current.status === 'DISPATCHED') {
        nextStatus = 'ON_THE_WAY';
        nextEta = 4;
        nextProgress = 70.0;
      } else if (current.status === 'ON_THE_WAY') {
        nextStatus = 'ARRIVED';
        nextEta = 0;
        nextProgress = 95.0;
      } else if (current.status === 'ARRIVED') {
        nextStatus = 'COMPLETED';
        nextEta = 0;
        nextProgress = 100.0;
      }

      const updated = {
        ...current,
        status: nextStatus,
        eta_minutes: nextEta,
        progress_percentage: nextProgress
      };
      cached[idx] = updated;
      localStorage.setItem(STORAGE_KEYS.AMBULANCE_REQUESTS, JSON.stringify(cached));
      return updated;
    }
    return null;
  },

  /**
   * Get Ambulance Tracking Telemetry
   * GET /api/ambulance/requests/{id}/tracking
   */
  async getAmbulanceTracking(requestId) {
    if (!isDemoMode()) {
      try {
        const res = await fetchWithTimeout(`${BASE_URL}/api/ambulance/requests/${requestId}/tracking`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[API] GET tracking failed, using local telemetry', err);
      }
    }

    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.AMBULANCE_REQUESTS) || '[]');
    const found = cached.find(r => r.request_id === requestId) || cached[0] || INITIAL_AMBULANCE_REQUESTS[0];
    return {
      request_id: found.request_id,
      status: found.status,
      eta_minutes: found.eta_minutes ?? 6,
      progress_percentage: found.progress_percentage ?? 50.0,
      driver_name: found.driver_name || 'ರಮೇಶ್ ಕುಮಾರ್ (Ramesh Kumar)',
      driver_phone: found.driver_phone || '+91 94480 12108',
      vehicle_number: found.vehicle_number || 'KA-11-G-1080',
      is_simulation: true,
      simulation_disclaimer: 'SIMULATION ONLY: This is a simulated 108 ambulance dispatch for testing purposes.'
    };
  }
};
