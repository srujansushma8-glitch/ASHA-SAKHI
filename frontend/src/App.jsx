import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HomeDashboard from './screens/HomeDashboard';
import VoiceRecordingScreen from './screens/VoiceRecordingScreen';
import StructuredVisitRecordScreen from './screens/StructuredVisitRecordScreen';
import EmergencyAlertScreen from './screens/EmergencyAlertScreen';
import AmbulanceTrackingScreen from './screens/AmbulanceTrackingScreen';
import FollowUpDashboard from './screens/FollowUpDashboard';
import BeneficiaryManagementScreen from './screens/BeneficiaryManagementScreen';
import { api } from './services/api';
import { voiceWs } from './services/websocket';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home'); // 'home', 'record', 'structured_record', 'emergency', 'ambulance', 'followups', 'beneficiaries'
  const [currentLanguage, setCurrentLanguage] = useState('kn'); // 'kn', 'kn-en', 'en'
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentDangerAlert, setCurrentDangerAlert] = useState(null);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null);
  const [initialScenarioId, setInitialScenarioId] = useState('anc_routine');

  useEffect(() => {
    loadEmergencyAlerts();

    // Listen for danger alerts triggered across websocket
    const unsubDanger = voiceWs.on('danger_alert', (payload) => {
      if (payload.alert) {
        setEmergencyAlerts(prev => [payload.alert, ...prev]);
        setCurrentDangerAlert(payload.alert);
      }
    });

    return () => {
      unsubDanger();
    };
  }, []);

  const loadEmergencyAlerts = async () => {
    try {
      const alerts = await api.getEmergencyAlerts();
      setEmergencyAlerts(alerts);
    } catch (e) {
      console.warn('Could not load emergency alerts', e);
    }
  };

  // Flow handlers
  const handleStartVoiceRecording = (beneficiaryIdOrScenario = null) => {
    if (typeof beneficiaryIdOrScenario === 'string') {
      if (beneficiaryIdOrScenario.startsWith('ASHA-KA-2024-0102')) {
        setInitialScenarioId('danger_sign_emergency');
      } else if (beneficiaryIdOrScenario.startsWith('ASHA-KA-2024-0103')) {
        setInitialScenarioId('child_immunization');
      } else {
        setInitialScenarioId('anc_routine');
      }
    }
    setActiveScreen('record');
  };

  const handleRecordExtracted = (extractedRecord, dangerAlert = null) => {
    setCurrentRecord(extractedRecord);
    if (dangerAlert) {
      setCurrentDangerAlert(dangerAlert);
      // If severe danger sign detected, direct to emergency alert screen or allow viewing record
      setActiveScreen('emergency');
    } else {
      setActiveScreen('structured_record');
    }
  };

  const handleDangerAlertReceived = (dangerAlert) => {
    setCurrentDangerAlert(dangerAlert);
    loadEmergencyAlerts();
  };

  const handleRecordSaved = (result) => {
    // Show success and navigate back to Home Dashboard or Follow-ups
    setActiveScreen('home');
  };

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        emergencyCount={emergencyAlerts.length}
      />

      {/* Main Screen Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto">
        {activeScreen === 'home' && (
          <HomeDashboard
            onStartRecording={() => handleStartVoiceRecording('anc_routine')}
            onNavigate={(screen) => setActiveScreen(screen)}
            onSelectBeneficiary={(id) => {
              setSelectedBeneficiaryId(id);
              setActiveScreen('beneficiaries');
            }}
            emergencyCount={emergencyAlerts.length}
          />
        )}

        {activeScreen === 'record' && (
          <VoiceRecordingScreen
            initialScenarioId={initialScenarioId}
            onRecordExtracted={handleRecordExtracted}
            onDangerAlert={handleDangerAlertReceived}
            onBack={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'structured_record' && (
          <StructuredVisitRecordScreen
            record={currentRecord}
            onSaved={handleRecordSaved}
            onBack={() => setActiveScreen('record')}
            onTriggerEmergency={(alert) => {
              setCurrentDangerAlert(alert);
              setActiveScreen('emergency');
            }}
          />
        )}

        {activeScreen === 'emergency' && (
          <EmergencyAlertScreen
            alertData={currentDangerAlert}
            onBack={() => setActiveScreen('home')}
            onTrackAmbulance={() => setActiveScreen('ambulance')}
          />
        )}

        {activeScreen === 'ambulance' && (
          <AmbulanceTrackingScreen
            onBack={() => setActiveScreen('emergency')}
          />
        )}

        {activeScreen === 'followups' && (
          <FollowUpDashboard
            onStartVoiceVisit={(bId) => handleStartVoiceRecording(bId)}
            onSelectBeneficiary={(id) => {
              setSelectedBeneficiaryId(id);
              setActiveScreen('beneficiaries');
            }}
          />
        )}

        {activeScreen === 'beneficiaries' && (
          <BeneficiaryManagementScreen
            selectedBeneficiaryId={selectedBeneficiaryId}
            onStartVoiceVisit={(bId) => handleStartVoiceRecording(bId)}
            onBack={() => setActiveScreen('home')}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        emergencyCount={emergencyAlerts.length}
        isRecording={activeScreen === 'record'}
      />
    </div>
  );
}
