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
import AmbulanceDriverScreen from './screens/AmbulanceDriverScreen';
import FollowUpDashboard from './screens/FollowUpDashboard';
import BeneficiaryManagementScreen from './screens/BeneficiaryManagementScreen';
import MaternalHealthScreen from './screens/MaternalHealthScreen';
import HouseholdRouteScreen from './screens/HouseholdRouteScreen';
import IncentivesReportScreen from './screens/IncentivesReportScreen';
import LandingPage from './components/landing/LandingPage';
import AuthModal from './components/auth/AuthModal';
import CommandPalette from './components/CommandPalette';
import LanguageSelectorModal from './components/LanguageSelectorModal';
import { isRtlLanguage } from './services/languages';
import { useLanguage } from './context/LanguageContext';
import { api } from './services/api';
import { voiceWs } from './services/websocket';

export default function App() {
  const { language: currentLanguage, setLanguage: setCurrentLanguage, isRtl, dir } = useLanguage();
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') || params.get('mode');
      if (v === 'app' || v === 'driver') return 'app';
      return localStorage.getItem('asha_view_mode') || 'landing';
    }
    return 'landing';
  }); // 'landing' or 'app'
  const [activeScreen, setActiveScreen] = useState('home'); // 'home', 'record', 'maternal', 'route', 'incentives', 'structured_record', 'emergency', 'ambulance', 'followups', 'beneficiaries'
  const [userRole, setUserRole] = useState('asha'); // 'asha', 'anm', 'mo'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('asha_theme') === 'dark';
    }
    return false;
  });

  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentDangerAlert, setCurrentDangerAlert] = useState(null);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null);
  const [initialScenarioId, setInitialScenarioId] = useState('anc_routine');
  const [globalSearch, setGlobalSearch] = useState('');

  // Handle direct URL params (?view=app, ?view=driver, ?screen=ambulance, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'driver' || params.get('mode') === 'driver') {
        setViewMode('app');
        setActiveScreen('ambulance_driver');
      } else if (params.get('view') === 'app' || params.get('mode') === 'app') {
        setViewMode('app');
        const screenParam = params.get('screen');
        if (screenParam) setActiveScreen(screenParam);
      }
    }
  }, []);

  // Synchronize RTL and Language with html element
  useEffect(() => {
    const isRtl = isRtlLanguage(currentLanguage);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Synchronize Dark Mode with html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('asha_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('asha_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('asha_view_mode', mode);
  };

  useEffect(() => {
    loadEmergencyAlerts();

    const unsubDanger = voiceWs.on('danger_alert', (payload) => {
      if (payload.alert) {
        setEmergencyAlerts(prev => [payload.alert, ...prev]);
        setCurrentDangerAlert(payload.alert);
      }
    });

    const handleOpenCmdPalette = () => setIsCommandPaletteOpen(true);
    window.addEventListener('asha_open_command_palette', handleOpenCmdPalette);

    return () => {
      unsubDanger();
      window.removeEventListener('asha_open_command_palette', handleOpenCmdPalette);
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
    handleSetViewMode('app');
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

  const handleAuthSuccess = (userData) => {
    if (userData && userData.role) {
      setUserRole(userData.role);
    }
    setIsAuthModalOpen(false);
    handleSetViewMode('app');
  };

  return (
    <div className="min-h-screen bg-[#F9ECEC] text-[#3B2A33] font-poppins selection:bg-[#A25B74]/20 selection:text-[#3B2A33] transition-colors duration-200">
      
      {/* View Mode 1: 3D Landing Page */}
      {viewMode === 'landing' ? (
        <LandingPage
          onLaunchApp={() => handleSetViewMode('app')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onOpenLanguageSelector={() => setIsLangModalOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      ) : (
        /* View Mode 2: Full Field Web App */
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* 1. Desktop Persistent Left Sidebar */}
          <Sidebar
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            emergencyCount={emergencyAlerts.length}
            isRecording={activeScreen === 'record'}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onOpenLanguageSelector={() => setIsLangModalOpen(true)}
            onViewLanding={() => handleSetViewMode('landing')}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            userRole={userRole}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          {/* 2. Main Application Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            {/* Mobile Top Navbar (Hidden on Desktop) */}
            <div className="lg:hidden">
              <Navbar
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                onOpenLanguageSelector={() => setIsLangModalOpen(true)}
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
              onOpenLanguageSelector={() => setIsLangModalOpen(true)}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onViewLanding={() => handleSetViewMode('landing')}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              userRole={userRole}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            {/* Dynamic Screen Content */}
            <main className="flex-1 w-full overflow-y-auto">
              {activeScreen === 'home' && (
                <HomeDashboard
                  currentLanguage={currentLanguage}
                  onStartRecording={handleStartVoiceRecording}
                  onNavigate={(screen) => setActiveScreen(screen)}
                  onSelectBeneficiary={(id) => {
                    setSelectedBeneficiaryId(id);
                    setActiveScreen('beneficiaries');
                  }}
                  emergencyCount={emergencyAlerts.length}
                />
              )}

              {activeScreen === 'route' && (
                <HouseholdRouteScreen
                  currentLanguage={currentLanguage}
                  onStartVoiceVisit={(bId) => handleStartVoiceRecording(bId)}
                  onBack={() => setActiveScreen('home')}
                />
              )}

              {activeScreen === 'incentives' && (
                <IncentivesReportScreen
                  currentLanguage={currentLanguage}
                  onBack={() => setActiveScreen('home')}
                />
              )}

              {activeScreen === 'maternal' && (
                <MaternalHealthScreen
                  currentLanguage={currentLanguage}
                  selectedBeneficiaryId={selectedBeneficiaryId}
                  onStartVoiceVisit={(bId) => handleStartVoiceRecording(bId)}
                  onBack={() => setActiveScreen('home')}
                />
              )}

              {activeScreen === 'record' && (
                <VoiceRecordingScreen
                  initialScenarioId={initialScenarioId}
                  currentLanguage={currentLanguage}
                  onOpenLanguageSelector={() => setIsLangModalOpen(true)}
                  onRecordExtracted={handleRecordExtracted}
                  onDangerAlert={handleDangerAlertReceived}
                  onBack={() => setActiveScreen('home')}
                />
              )}

              {activeScreen === 'structured_record' && (
                <StructuredVisitRecordScreen
                  currentLanguage={currentLanguage}
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
                  currentLanguage={currentLanguage}
                  alertData={currentDangerAlert}
                  onBack={() => setActiveScreen('home')}
                  onTrackAmbulance={() => setActiveScreen('ambulance')}
                />
              )}

              {activeScreen === 'ambulance' && (
                <AmbulanceTrackingScreen
                  currentLanguage={currentLanguage}
                  onBack={() => setActiveScreen('home')}
                  onOpenDriverPortal={() => setActiveScreen('ambulance_driver')}
                />
              )}

              {activeScreen === 'ambulance_driver' && (
                <AmbulanceDriverScreen
                  currentLanguage={currentLanguage}
                  onBack={() => setActiveScreen('ambulance')}
                />
              )}

              {activeScreen === 'followups' && (
                <FollowUpDashboard
                  currentLanguage={currentLanguage}
                  onStartVoiceVisit={(bId) => handleStartVoiceRecording(bId)}
                  onSelectBeneficiary={(id) => {
                    setSelectedBeneficiaryId(id);
                    setActiveScreen('beneficiaries');
                  }}
                />
              )}

              {activeScreen === 'beneficiaries' && (
                <BeneficiaryManagementScreen
                  currentLanguage={currentLanguage}
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
              currentLanguage={currentLanguage}
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              emergencyCount={emergencyAlerts.length}
              isRecording={activeScreen === 'record'}
            />
          </div>
        </div>
      )}

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(screen) => setActiveScreen(screen)}
        onStartRecording={handleStartVoiceRecording}
        onToggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        onLanguageChange={setCurrentLanguage}
        currentLanguage={currentLanguage}
        onOpenLanguageSelector={() => setIsLangModalOpen(true)}
        onViewLanding={() => handleSetViewMode('landing')}
      />

      {/* 22 Indic Languages Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
      />

      {/* OTP Authentication & Role Selection Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
