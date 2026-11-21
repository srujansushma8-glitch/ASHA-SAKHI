import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DesktopHeader from './components/DesktopHeader';
import BottomNav from './components/BottomNav';
import HomeDashboard from './screens/HomeDashboard';
import VoiceRecordingScreen from './screens/VoiceRecordingScreen';
import StructuredVisitRecordScreen from './screens/StructuredVisitRecordScreen';
import EmergencyAlertScreen from './screens/EmergencyAlertScreen';
import AmbulanceTrackingScreen from './screens/AmbulanceTrackingScreen';
import FollowUpDashboard from './screens/FollowUpDashboard';
import BeneficiaryManagementScreen from './screens/BeneficiaryManagementScreen';
import MaternalHealthScreen from './screens/MaternalHealthScreen';
import { api } from './services/api';
import { voiceWs } from './services/websocket';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home'); // 'home', 'record', 'maternal', 'structured_record', 'emergency', 'ambulance', 'followups', 'beneficiaries'
  const [currentLanguage, setCurrentLanguage] = useState('kn'); // 'kn', 'kn-en', 'en'
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentDangerAlert, setCurrentDangerAlert] = useState(null);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null);
  const [initialScenarioId, setInitialScenarioId] = useState('anc_routine');
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    loadEmergencyAlerts();

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

  const handleStartVoiceRecording = (beneficiaryIdOrScenario = null) => {
    if (typeof beneficiaryIdOrScenario === 'string') {
      if (beneficiaryIdOrScenario.startsWith('ASHA-KA-2024-0102') || beneficiaryIdOrScenario.includes('002') || beneficiaryIdOrScenario === 'danger_sign_emergency') {
        setInitialScenarioId('danger_sign_emergency');
      } else if (beneficiaryIdOrScenario.startsWith('ASHA-KA-2024-0103') || beneficiaryIdOrScenario.includes('003') || beneficiaryIdOrScenario === 'child_immunization') {
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
    setActiveScreen('home');
  };

  return (
    <div className="min-h-screen bg-appbg text-navy-900 flex flex-col lg:flex-row font-sans selection:bg-cyan-100 selection:text-navy-900">
      {/* 1. Desktop Persistent Left Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        emergencyCount={emergencyAlerts.length}
        isRecording={activeScreen === 'record'}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* 2. Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Top Navbar (Hidden on Desktop) */}
        <div className="lg:hidden">
          <Navbar
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            emergencyCount={emergencyAlerts.length}
          />
        </div>

        {/* Desktop Sticky Header Bar (Hidden on Mobile) */}
        <DesktopHeader
          activeScreen={activeScreen}
          emergencyCount={emergencyAlerts.length}
          onEmergencyClick={() => setActiveScreen('emergency')}
          searchValue={globalSearch}
          onSearchChange={(val) => {
            setGlobalSearch(val);
            if (val && activeScreen !== 'beneficiaries') {
              setActiveScreen('beneficiaries');
            }
          }}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />

        {/* Dynamic Screen Content */}
        <main className="flex-1 w-full overflow-y-auto">
          {activeScreen === 'home' && (
            <HomeDashboard
              onStartRecording={handleStartVoiceRecording}
              onNavigate={(screen) => setActiveScreen(screen)}
              onSelectBeneficiary={(id) => {
                setSelectedBeneficiaryId(id);
                setActiveScreen('beneficiaries');
              }}
              emergencyCount={emergencyAlerts.length}
            />
          )}

          {activeScreen === 'maternal' && (
            <MaternalHealthScreen
              selectedBeneficiaryId={selectedBeneficiaryId}
              onStartVoiceVisit={(bId) => handleStartVoiceRecording(bId)}
              onBack={() => setActiveScreen('home')}
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
              initialSearchQuery={globalSearch}
              onStartVoiceVisit={(bId) => handleStartVoiceRecording(bId)}
              onBack={() => setActiveScreen('home')}
            />
          )}
        </main>
      </div>

      {/* 3. Mobile Fixed Bottom Navigation (Hidden on Desktop) */}
      <div className="lg:hidden">
        <BottomNav
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          emergencyCount={emergencyAlerts.length}
          isRecording={activeScreen === 'record'}
        />
      </div>
    </div>
  );
}
