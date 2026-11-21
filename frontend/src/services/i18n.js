/**
 * Comprehensive Trilingual Internationalization (i18n) for ASHA Sakhi
 * Supports English (en), Hindi (hi), and Kannada (kn)
 * Covers every screen, button, card, clinical metric, form, and error state.
 */

export const TRANSLATIONS = {
  en: {
    // Navigation & Common
    common: {
      appName: "ASHA Sakhi",
      tagline: "Digital Companion for Community Health",
      department: "National Health Mission • Karnataka Health Dept",
      save: "Save Record",
      saved: "Saved",
      cancel: "Cancel",
      close: "Close",
      edit: "Edit",
      delete: "Delete",
      retry: "Retry",
      back: "Back",
      search: "Search...",
      loading: "Loading...",
      confirm: "Confirm",
      verified: "Verified",
      submit: "Submit",
      accept: "Accept",
      completed: "Completed",
      emergencyRequested: "Emergency Requested",
      ambulanceAssigned: "Ambulance Assigned",
      enRoute: "En Route",
      approaching: "Approaching",
      tripCompleted: "Trip Completed",
      liveGpsMode: "Live GPS Mode (Real Device)",
      demoSimulationMode: "Demo Simulation Mode (Road Waypoints)",
      driverPortal: "Ambulance Driver Portal",
      startTrip: "Start Trip",
      stopTrip: "Stop Trip",
      pending: "Pending",
      due: "Due",
      overdue: "Overdue",
      all: "All",
      actions: "Actions",
      status: "Status",
      date: "Date",
      time: "Time",
      village: "Village",
      phone: "Phone",
      beneficiary: "Beneficiary",
      age: "Age",
      weight: "Weight",
      risk: "Risk Level",
      lowRisk: "Low Risk",
      moderateRisk: "Moderate Risk",
      highRisk: "High Risk",
      emergency: "Emergency",
      live: "Live",
      simulated: "Simulated",
      demoMode: "Demo Mode",
      liveMode: "Live Backend",
      syncOnline: "Online Synced",
      syncOffline: "Offline Queue",
      syncNow: "Sync Records",
      lightMode: "Light Mode",
      darkMode: "Dark Mode"
    },

    nav: {
      dashboard: "Dashboard",
      voiceVisit: "AI Voice Assistant",
      maternalHealth: "Maternal Health",
      beneficiaries: "Beneficiary Directory",
      route: "Household Route Map",
      incentives: "Incentives & NHM Ledger",
      followups: "Follow-ups & Reports",
      emergency: "Emergency Alerts",
      ambulance: "108 Ambulance Map",
      publicPortal: "Public Portal & 3D Site",
      switchRole: "Switch Role",
      languages: "Languages (22)"
    },

    // Main Dashboard
    dashboard: {
      greeting: "Hello, Sharada Bai!",
      roleDesc: "ASHA Field Leader Register • Mandya PHC (Sector 4)",
      audioBriefingStart: "Listen Audio Briefing",
      audioBriefingStop: "Stop Audio Briefing",
      statBeneficiaries: "Total Beneficiaries",
      statVisitsToday: "Visits Scheduled Today",
      statFollowupsDue: "Follow-ups Due",
      statEmergencies: "Emergency Referrals",
      maternalOverview: "Maternal Healthcare Overview",
      maternalSubtext: "14 Enrolled Pregnant Mothers & Risk Cohorts",
      riskDistribution: "Gestational Risk Distribution",
      trimesterProgress: "Trimester Progress",
      trimester1: "1st Trimester (1-12w)",
      trimester2: "2nd Trimester (13-27w)",
      trimester3: "3rd Trimester (28-40w)",
      immunizationOverview: "Universal Child Immunization (0-1 yr)",
      immunizationSubtext: "22 Infants Enrolled in Shivalli Sub-centre",
      recentVisits: "Recent Completed Visits",
      recentVisitsSubtext: "Logged via multilingual AI speech recognition",
      startVisitBtn: "Start Visit",
      todaysTasks: "Today's Critical Tasks",
      portalRequests: "Community Visit Requests",
      portalRequestsSubtext: "Requests from public portal",
      noPendingRequests: "No pending visit requests",
      acceptRequest: "Accept & Schedule",
      ambulanceWidgetTitle: "108 Ambulance Telemetry",
      ambulanceWidgetSubtext: "Live GPS Vehicle Dispatch",
      openAmbulanceMap: "Open Interactive Map",
      helplinesTitle: "Emergency Helplines",
      ambulance108: "108 Ambulance Emergency",
      health104: "104 Health Advice Line",
      women181: "181 Women's Helpline",
      callNow: "Call Now"
    },

    // Maternal Health Module
    maternal: {
      title: "Maternal Health & ANC Tracking",
      subtitle: "Pregnancy monitor, vital signs, IFA compliance & danger signs",
      mothersDirectory: "Enrolled Pregnant Mothers",
      gestationalAge: "Gestational Age",
      weeks: "weeks",
      edd: "Expected Delivery Date (EDD)",
      vitalsTitle: "Clinical Vital Signs",
      bloodPressure: "Blood Pressure",
      hemoglobin: "Hemoglobin (Hb)",
      fetalHeartRate: "Fetal Heart Rate",
      nutritionTitle: "Nutrition & Supplements (Poshan Abhiyaan)",
      ifaTablets: "Iron Folic Acid (IFA) Tablets Given",
      calciumCompliance: "Calcium Compliance",
      ancVisits: "Antenatal Care (ANC) Visits",
      anc1: "ANC-1 (1st Trimester)",
      anc2: "ANC-2 (24-26 weeks)",
      anc3: "ANC-3 (32 weeks)",
      anc4: "ANC-4 (36 weeks)",
      dangerSignsTitle: "Maternal Danger Signs Checklist (MoHFW)",
      severeHeadache: "Severe headache / dizziness",
      blurredVision: "Blurred or spotty vision",
      vaginalBleeding: "Vaginal bleeding or fluid leaking",
      reducedMovement: "Reduced fetal movement",
      facialEdema: "Swelling in face / hands (Edema)",
      highFever: "High fever / chills",
      dangerSignDetected: "Danger Sign Detected! Immediate referral required.",
      triggerReferralBtn: "Refer to PHC / Hospital (108)"
    },

    // Child Immunization Module
    immunization: {
      title: "Universal Immunization Tracker",
      subtitle: "UIP immunization schedule from Birth to 9 Months",
      vaccineSchedule: "Vaccine Schedule",
      birthDoses: "Birth (BCG, OPV-0, Hep-B)",
      weeks6: "6 Weeks (OPV-1, Pentavalent-1, Rota-1, fIPV-1, PCV-1)",
      weeks10: "10 Weeks (OPV-2, Pentavalent-2, Rota-2)",
      weeks14: "14 Weeks (OPV-3, Pentavalent-3, Rota-3, fIPV-2, PCV-2)",
      months9: "9 Months (MR-1, JE-1, Vit-A 1st Dose)",
      markVaccinated: "Mark Vaccinated",
      dueToday: "Due Today",
      upcomingThisWeek: "Upcoming This Week"
    },

    // Ambulance & Emergency Assistance
    ambulance: {
      title: "108 Emergency Ambulance Live Tracking",
      subtitle: "Real-time vehicle telemetry, route navigation & driver communication",
      disclaimerTitle: "TRAINING & EVALUATION SIMULATION ONLY",
      disclaimerText: "This is a demonstration GPS simulation. No actual 108 ambulance has been dispatched to emergency services.",
      requestId: "Ambulance Request ID",
      currentStatus: "Current Dispatch Status",
      requested: "Requested",
      dispatched: "Dispatched",
      onTheWay: "On the Way",
      arrived: "Arrived",
      completed: "Completed",
      eta: "Estimated Arrival Time",
      distanceRemaining: "Distance Remaining",
      speed: "Current Speed",
      lastUpdate: "Last GPS Telemetry Update",
      patientLocation: "Patient Pickup Location",
      hospitalLocation: "Hospital / PHC Destination",
      driverName: "Driver Name",
      driverPhone: "Driver Contact",
      vehicleNumber: "Vehicle Number",
      emtStaff: "Emergency Medical Tech",
      recenterMap: "Recenter on Ambulance",
      recenterPatient: "Recenter on Patient",
      fitBounds: "View Entire Route",
      demoAdvanceStep: "Advance Simulation Step",
      demoReset: "Reset Simulation",
      autoSimulate: "Auto Step (3.5s)",
      callingDriver: "Calling Driver...",
      mapLoading: "Loading Google Maps...",
      mapPermissionDenied: "Location permission denied. Showing default Mandya Sector coordinates.",
      mapApiError: "Google Maps API unavailable or key unconfigured. Rendering high-fidelity vector terrain map."
    },

    // AI Voice Assistant Module
    voice: {
      title: "Multilingual AI Voice Assistant",
      subtitle: "AI4Bharat Indic-Transcribe ASR & Indic-Speak TTS",
      readyToRecord: "Ready to Record",
      recordingInProgress: "Listening... Speak naturally in your language",
      processingAudio: "Processing audio windows with AI4Bharat...",
      startRecordingBtn: "Start Voice Visit",
      stopRecordingBtn: "Stop Recording",
      retryBtn: "Restart Session",
      listenAudioBtn: "Play Recording",
      extractedCardTitle: "Structured Clinical Data Extracted",
      kannadaReadback: "Spoken Confirmation Readback",
      listenReadbackBtn: "Listen Readback",
      evaluationPresets: "Evaluation Presets for Judges",
      saveVisitBtn: "Commit Record to SQLite",
      dangerAlertTitle: "Clinical Danger Alert Triggered!"
    },

    // Beneficiary Directory
    beneficiaries: {
      title: "Beneficiary Community Directory",
      subtitle: "Residents under Shivalli & Keregodu sub-centre jurisdiction",
      searchPlaceholder: "Search by name, ID, phone, or village...",
      addNewBtn: "Register New Beneficiary",
      categoryAll: "All Beneficiaries",
      categoryANC: "Pregnant Mothers (ANC)",
      categoryPNC: "New Mothers (PNC)",
      categoryChild: "Infants (0-1 yr)",
      totalRegistered: "Total Registered",
      viewProfile: "View Clinical Profile"
    },

    // Household Route Screen
    route: {
      title: "Village Household Route Planner",
      subtitle: "Optimized daily GPS walking path for Mandya Sector 4",
      aiPriority: "AI Priority (High Risk First)",
      shortestDistance: "Shortest Distance",
      optimizedBadge: "Route Optimized",
      totalDistance: "Estimated Walking Distance: 3.8 km",
      stopsCount: "5 Household Visits Scheduled",
      offlineGpsBadge: "Offline GPS Caching Active",
      lakeLandmark: "Shivalli Lake",
      startVisitBtn: "Start Home Visit"
    },

    // Incentives Screen
    incentives: {
      title: "ASHA Incentives & NHM Ledger",
      subtitle: "JSY, Immunization, monthly earnings & supervisor approval ledger",
      submitToANM: "Submit Batch to ANM Supervisor",
      submittedSuccess: "Batch successfully submitted to ANM!",
      totalEarnedMonth: "Total Earned This Month",
      approvedANM: "Approved by ANM",
      underReviewMO: "Under MO Review",
      projectedTarget: "Target Potential",
      monthlyTrend: "Monthly Earnings Trend",
      claimsLedger: "Itemized Claims Ledger",
      claimId: "Claim ID",
      taskScheme: "Task / Health Scheme",
      amount: "Incentive (₹)",
      verifyCode: "Verification Code"
    }
  },

  hi: {
    // Navigation & Common
    common: {
      appName: "आशा सखी",
      tagline: "सामुदायिक स्वास्थ्य के लिए डिजिटल साथी",
      department: "राष्ट्रीय स्वास्थ्य मिशन • कर्नाटक स्वास्थ्य विभाग",
      save: "रिकॉर्ड सहेजें",
      saved: "सहेजा गया",
      cancel: "रद्द करें",
      close: "बंद करें",
      edit: "संपादित करें",
      delete: "हटाएं",
      retry: "पुनः प्रयास",
      back: "पीछे जाएं",
      search: "खोजें...",
      loading: "लोड हो रहा है...",
      confirm: "पुष्टि करें",
      verified: "सत्यापित",
      submit: "जमा करें",
      accept: "स्वीकार करें",
      completed: "पूर्ण हुआ",
      emergencyRequested: "आपातकालीन अनुरोध",
      ambulanceAssigned: "एम्बुलेंस आवंटित",
      enRoute: "मार्ग में",
      approaching: "निकट आ रहा है",
      tripCompleted: "यात्रा पूर्ण",
      liveGpsMode: "लाइव जीपीएस मोड (वास्तविक डिवाइस)",
      demoSimulationMode: "डेमो सिमुलेशन मोड (सड़क मार्ग)",
      driverPortal: "एम्बुलेंस चालक पोर्टल",
      startTrip: "यात्रा शुरू करें",
      stopTrip: "यात्रा समाप्त करें",
      pending: "लंबित",
      due: "बाकी",
      overdue: "अतिदेय",
      all: "सभी",
      actions: "कार्रवाई",
      status: "स्थिति",
      date: "दिनांक",
      time: "समय",
      village: "गाँव",
      phone: "फ़ोन",
      beneficiary: "लाभार्थी",
      age: "आयु",
      weight: "वजन",
      risk: "जोखिम स्तर",
      lowRisk: "कम जोखिम",
      moderateRisk: "मध्यम जोखिम",
      highRisk: "उच्च जोखिम",
      emergency: "आपातकाल",
      live: "लाइव",
      simulated: "सिम्युलेटेड",
      demoMode: "डेमो मोड",
      liveMode: "लाइव बैकएंड",
      syncOnline: "ऑनलाइन सिंक",
      syncOffline: "ऑफ़लाइन कतार",
      syncNow: "रिकॉर्ड सिंक करें",
      lightMode: "लाइट मोड",
      darkMode: "डार्क मोड"
    },

    nav: {
      dashboard: "डैशबोर्ड",
      voiceVisit: "एआई वॉयस सहायक",
      maternalHealth: "मातृ स्वास्थ्य",
      beneficiaries: "लाभार्थी निर्देशिका",
      route: "ग्राम गृह भ्रमण मार्ग",
      incentives: "प्रोत्साहन राशि खाता",
      followups: "फॉलो-अप और रिपोर्ट",
      emergency: "आपातकालीन अलर्ट",
      ambulance: "108 एम्बुलेंस मैप",
      publicPortal: "पब्लिक पोर्टल व 3D साइट",
      switchRole: "भूमिका बदलें",
      languages: "भाषाएं (22)"
    },

    // Main Dashboard
    dashboard: {
      greeting: "नमस्ते, शारदा बाई!",
      roleDesc: "आशा फील्ड रजिस्टर • मंड्या पीएचसी (सेक्टर 4)",
      audioBriefingStart: "दैनिक ऑडियो ब्रीफिंग सुनें",
      audioBriefingStop: "ऑडियो ब्रीफिंग रोकें",
      statBeneficiaries: "कुल लाभार्थी",
      statVisitsToday: "आज निर्धारित गृह भ्रमण",
      statFollowupsDue: "बाकी फॉलो-अप",
      statEmergencies: "आपातकालीन रेफरल",
      maternalOverview: "मातृ स्वास्थ्य अवलोकन",
      maternalSubtext: "14 पंजीकृत गर्भवती महिलाएं और जोखिम समूह",
      riskDistribution: "गर्भावस्था जोखिम वितरण",
      trimesterProgress: "त्रैमासिक प्रगति",
      trimester1: "पहला त्रैमासिक (1-12 सप्ताह)",
      trimester2: "दूसरा त्रैमासिक (13-27 सप्ताह)",
      trimester3: "तीसरा त्रैमासिक (28-40 सप्ताह)",
      immunizationOverview: "शिशु सार्वभौमिक टीकाकरण (0-1 वर्ष)",
      immunizationSubtext: "शिवल्ली उपकेंद्र में 22 शिशु पंजीकृत",
      recentVisits: "हाल के पूर्ण भ्रमण",
      recentVisitsSubtext: "एआई4भारत बहुभाषी वॉयस द्वारा दर्ज",
      startVisitBtn: "भ्रमण शुरू करें",
      todaysTasks: "आज के मुख्य कार्य",
      portalRequests: "समुदाय भ्रमण अनुरोध",
      portalRequestsSubtext: "पब्लिक पोर्टल से प्राप्त अनुरोध",
      noPendingRequests: "कोई लंबित अनुरोध नहीं है",
      acceptRequest: "स्वीकारें और तय करें",
      ambulanceWidgetTitle: "108 एम्बुलेंस टेलीमेट्री",
      ambulanceWidgetSubtext: "लाइव जीपीएस वाहन प्रेषण",
      openAmbulanceMap: "इंटरैक्टिव मैप खोलें",
      helplinesTitle: "आपातकालीन हेल्पलाइन नंबर",
      ambulance108: "108 एम्बुलेंस सेवा",
      health104: "104 स्वास्थ्य सलाह",
      women181: "181 महिला हेल्पलाइन",
      callNow: "कॉल करें"
    },

    // Maternal Health Module
    maternal: {
      title: "मातृ स्वास्थ्य व एएनसी ट्रैकिंग",
      subtitle: "गर्भावस्था निगरानी, महत्वपूर्ण लक्षण, आईएफए व खतरे के संकेत",
      mothersDirectory: "पंजीकृत गर्भवती महिलाएं",
      gestationalAge: "गर्भकालीन आयु",
      weeks: "सप्ताह",
      edd: "प्रसव की संभावित तिथि (EDD)",
      vitalsTitle: "नैदानिक महत्वपूर्ण लक्षण",
      bloodPressure: "रक्तचाप (BP)",
      hemoglobin: "हीमोग्लोबिन (Hb)",
      fetalHeartRate: "भ्रूण हृदय गति (FHR)",
      nutritionTitle: "पोषण व पूरक आहार (पोषण अभियान)",
      ifaTablets: "आयरन फोलिक एसिड (IFA) गोलियां",
      calciumCompliance: "कैल्शियम अनुपालन",
      ancVisits: "प्रसव पूर्व जांच (ANC) चरण",
      anc1: "ANC-1 (पहला त्रैमासिक)",
      anc2: "ANC-2 (24-26 सप्ताह)",
      anc3: "ANC-3 (32 सप्ताह)",
      anc4: "ANC-4 (36 सप्ताह)",
      dangerSignsTitle: "मातृ खतरे के संकेतों की चेकलिस्ट (MoHFW)",
      severeHeadache: "गंभीर सिरदर्द या चक्कर आना",
      blurredVision: "धुंधला दिखना या आंखों के आगे अंधेरा",
      vaginalBleeding: "योनि से रक्तस्राव या पानी बहना",
      reducedMovement: "भ्रूण की हलचल में कमी",
      facialEdema: "चेहरे व पैरों में अत्यधिक सूजन",
      highFever: "तेज बुखार या कंपकंपी",
      dangerSignDetected: "खतरे का संकेत पाया गया! तत्काल रेफरल आवश्यक है।",
      triggerReferralBtn: "पीएचसी रेफर करें / 108 बुलाएं"
    },

    // Child Immunization Module
    immunization: {
      title: "सार्वभौमिक टीकाकरण ट्रैकर",
      subtitle: "जन्म से 9 महीने तक का संपूर्ण यूआईपी टीकाकरण कार्यक्रम",
      vaccineSchedule: "टीकाकरण समय सारणी",
      birthDoses: "जन्म (बीसीजी, ओपीवी-0, हेप-बी)",
      weeks6: "6 सप्ताह (ओपीवी-1, पेंटावेलेंट-1, रोटा-1, एफआईपीवी-1, पीसीवी-1)",
      weeks10: "10 सप्ताह (ओपीवी-2, पेंटावेलेंट-2, रोटा-2)",
      weeks14: "14 सप्ताह (ओपीवी-3, पेंटावेलेंट-3, रोटा-3, एफआईपीवी-2, पीसीवी-2)",
      months9: "9 महीने (एमआर-1, जेई-1, विटामिन-ए पहली खुराक)",
      markVaccinated: "टीका लगा चिन्हित करें",
      dueToday: "आज बाकी टीके",
      upcomingThisWeek: "इस सप्ताह आगामी"
    },

    // Ambulance & Emergency Assistance
    ambulance: {
      title: "108 आपातकालीन एम्बुलेंस लाइव ट्रैकिंग",
      subtitle: "वास्तविक समय वाहन टेलीमेट्री, मार्ग नेविगेशन व चालक संचार",
      disclaimerTitle: "केवल प्रशिक्षण एवं मूल्यांकन सिमुलेशन",
      disclaimerText: "यह एक प्रदर्शन जीपीएस सिमुलेशन है। कोई वास्तविक 108 एम्बुलेंस आपातकालीन सेवा को प्रेषित नहीं की गई है।",
      requestId: "एम्बुलेंस अनुरोध आईडी",
      currentStatus: "वर्तमान प्रेषण स्थिति",
      requested: "अनुरोध प्राप्त",
      dispatched: "वाहन रवाना",
      onTheWay: "मार्ग में है",
      arrived: "स्थान पर पहुंच गया",
      completed: "पूर्ण हुआ",
      eta: "अनुमानित आगमन समय",
      distanceRemaining: "शेष दूरी",
      speed: "वर्तमान गति",
      lastUpdate: "अंतिम जीपीएस टेलीमेट्री अपडेट",
      patientLocation: "मरीज का स्थान (पिकअप)",
      hospitalLocation: "गंतव्य अस्पताल / पीएचसी",
      driverName: "चालक का नाम",
      driverPhone: "चालक संपर्क",
      vehicleNumber: "वाहन क्रमांक",
      emtStaff: "ईएमटी तकनीशियन",
      recenterMap: "एम्बुलेंस पर केंद्रित करें",
      recenterPatient: "मरीज पर केंद्रित करें",
      fitBounds: "पूरा मार्ग देखें",
      demoAdvanceStep: "सिमुलेशन चरण आगे बढ़ाएं",
      demoReset: "सिमुलेशन रीसेट करें",
      autoSimulate: "स्वचालित चरण (3.5 सेकंड)",
      callingDriver: "चालक को कॉल कर रहे हैं...",
      mapLoading: "गूगल मैप्स लोड हो रहा है...",
      mapPermissionDenied: "स्थान की अनुमति अस्वीकृत। मंड्या डिफ़ॉल्ट निर्देशांक दिखाए जा रहे हैं।",
      mapApiError: "गूगल मैप्स एपीआई अनुपलब्ध। उच्च-रिज़ॉल्यूशन वेक्टर इलाके का नक्शा दिखाया जा रहा है।"
    },

    // AI Voice Assistant Module
    voice: {
      title: "बहुभाषी एआई वॉयस सहायक",
      subtitle: "AI4Bharat इंडिक-ट्रांसक्राइब एएसआर व इंडिक-स्पीक टीटीएस",
      readyToRecord: "रिकॉर्ड करने के लिए तैयार",
      recordingInProgress: "सुन रहे हैं... अपनी भाषा में स्पष्ट बोलें",
      processingAudio: "एआई4भारत द्वारा ऑडियो संसाधित किया जा रहा है...",
      startRecordingBtn: "वॉयस भ्रमण शुरू करें",
      stopRecordingBtn: "रिकॉर्डिंग रोकें",
      retryBtn: "सत्र पुनः शुरू करें",
      listenAudioBtn: "रिकॉर्डिंग सुनें",
      extractedCardTitle: "पहचाने गए नैदानिक विवरण",
      kannadaReadback: "बोली गई पुष्टि और रीडबैक",
      listenReadbackBtn: "रीडबैक सुनें",
      evaluationPresets: "मूल्यांकन परीक्षण परिदृश्य",
      saveVisitBtn: "रिकॉर्ड सहेजें (SQLite)",
      dangerAlertTitle: "नैदानिक खतरे का अलर्ट सक्रिय!"
    },

    // Beneficiary Directory
    beneficiaries: {
      title: "लाभार्थी समुदाय निर्देशिका",
      subtitle: "शिवल्ली व केरेगोडू उपकेंद्र क्षेत्र के पंजीकृत निवासी",
      searchPlaceholder: "नाम, आईडी, फ़ोन या गाँव से खोजें...",
      addNewBtn: "नया लाभार्थी पंजीकृत करें",
      categoryAll: "सभी लाभार्थी",
      categoryANC: "गर्भवती महिलाएं (ANC)",
      categoryPNC: "प्रसवावस्था माताएं (PNC)",
      categoryChild: "शिशु (0-1 वर्ष)",
      totalRegistered: "कुल पंजीकृत",
      viewProfile: "नैदानिक प्रोफ़ाइल देखें"
    },

    // Household Route Screen
    route: {
      title: "ग्राम गृह भ्रमण मार्ग योजना",
      subtitle: "मंड्या सेक्टर 4 के लिए अनुकूलित दैनिक जीपीएस पैदल मार्ग",
      aiPriority: "एआई प्राथमिकता (उच्च जोखिम पहले)",
      shortestDistance: "न्यूनतम दूरी",
      optimizedBadge: "मार्ग अनुकूलित",
      totalDistance: "अनुमानित पैदल दूरी: 3.8 किमी",
      stopsCount: "5 गृह भ्रमण निर्धारित",
      offlineGpsBadge: "ऑफ़लाइन जीपीएस कैशिंग सक्रिय",
      lakeLandmark: "शिवल्ली झील",
      startVisitBtn: "गृह भ्रमण शुरू करें"
    },

    // Incentives Screen
    incentives: {
      title: "आशा प्रोत्साहन राशि व एनएचएम खाता",
      subtitle: "जेएसवाई, टीकाकरण, मासिक आय व पर्यवेक्षक अनुमोदन लेजर",
      submitToANM: "एएनएम पर्यवेक्षक को बैच जमा करें",
      submittedSuccess: "बैच एएनएम को सफलतापूर्वक जमा कर दिया गया!",
      totalEarnedMonth: "इस माह की कुल कमाई",
      approvedANM: "एएनएम अनुमोदित राशि",
      underReviewMO: "चिकित्सा अधिकारी जांच में",
      projectedTarget: "लक्ष्य संभावित राशि",
      monthlyTrend: "मासिक कमाई की प्रगति",
      claimsLedger: "मदवार दावा सूची",
      claimId: "दावा आईडी",
      taskScheme: "कार्य / स्वास्थ्य योजना",
      amount: "राशि (₹)",
      verifyCode: "सत्यापन कोड"
    }
  },

  kn: {
    // Navigation & Common
    common: {
      appName: "ಆಶಾ ಸಖಿ",
      tagline: "ಗ್ರಾಮೀಣ ಸಮುದಾಯ ಆರೋಗ್ಯದ ಡಿಜಿಟಲ್ ಒಡನಾಡಿ",
      department: "ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ • ಕರ್ನಾಟಕ ಆರೋಗ್ಯ ಇಲಾಖೆ",
      save: "ದಾಖಲೆಯನ್ನು ಉಳಿಸಿ",
      saved: "ಉಳಿಸಲಾಗಿದೆ",
      cancel: "ರದ್ದುಮಾಡಿ",
      close: "ಮುಚ್ಚಿ",
      edit: "ತಿದ್ದುಪಡಿ",
      delete: "ಅಳಿಸಿ",
      retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
      back: "ಹಿಂದೆ",
      search: "ಹುಡುಕಿ...",
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      confirm: "ದೃಢೀಕರಿಸಿ",
      verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
      submit: "ಸಲ್ಲಿಸಿ",
      accept: "ಸ್ವೀಕರಿಸಿ",
      completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      emergencyRequested: "ತುರ್ತು ವಿನಂತಿ",
      ambulanceAssigned: "ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿಯೋಜಿಸಲಾಗಿದೆ",
      enRoute: "ಮಾರ್ಗ ಮಧ್ಯದಲ್ಲಿದೆ",
      approaching: "ಸಮೀಪಿಸುತ್ತಿದೆ",
      tripCompleted: "ಪ್ರವಾಸ ಪೂರ್ಣಗೊಂಡಿದೆ",
      liveGpsMode: "ಲೈವ್ ಜಿಪಿಎಸ್ ಮೋಡ್ (ನಿಜವಾದ ಸಾಧನ)",
      demoSimulationMode: "ಡೆಮೊ ಸಿಮ್ಯುಲೇಶನ್ ಮೋಡ್ (ರಸ್ತೆ ಮಾರ್ಗ)",
      driverPortal: "ಆಂಬ್ಯುಲೆನ್ಸ್ ಚಾಲಕ ಪೋರ್ಟಲ್",
      startTrip: "ಪ್ರವಾಸ ಪ್ರಾರಂಭಿಸಿ",
      stopTrip: "ಪ್ರವಾಸ ಕೊನೆಗೊಳಿಸಿ",
      pending: "ಬಾಕಿ ಇದೆ",
      due: "ಇಂದು ಬಾಕಿ",
      overdue: "ಅವಧಿ ಮೀರಿದೆ",
      all: "ಎಲ್ಲಾ",
      actions: "ಕ್ರಮ",
      status: "ಸ್ಥಿತಿ",
      date: "ದಿನಾಂಕ",
      time: "ಸಮಯ",
      village: "ಗ್ರಾಮ",
      phone: "ದೂರವಾಣಿ",
      beneficiary: "ಫಲಾನುಭವಿ",
      age: "ವಯಸ್ಸು",
      weight: "ತೂಕ",
      risk: "ಅಪಾಯದ ಮಟ್ಟ",
      lowRisk: "ಕಡಿಮೆ ಅಪಾಯ",
      moderateRisk: "ಮಧ್ಯಮ ಅಪಾಯ",
      highRisk: "ಹೆಚ್ಚಿನ ಅಪಾಯ",
      emergency: "ತುರ್ತು",
      live: "ಲೈವ್",
      simulated: "ಸಿಮ್ಯುಲೇಶನ್",
      demoMode: "ಡೆಮೊ ಮೋಡ್",
      liveMode: "ಲೈವ್ ಬ್ಯಾಕೆಂಡ್",
      syncOnline: "ಆನ್‌ಲೈನ್ ಸಿಂಕ್",
      syncOffline: "ಆಫ್‌ಲೈನ್ ಕ್ಯೂ",
      syncNow: "ದಾಖಲೆ ಸಿಂಕ್ ಮಾಡಿ",
      lightMode: "ಲೈಟ್ ಮೋಡ್",
      darkMode: "ಡಾರ್ಕ್ ಮೋಡ್"
    },

    nav: {
      dashboard: "ಮುಖಪುಟ",
      voiceVisit: "ಧ್ವನಿ ಭೇಟಿ",
      maternalHealth: "ತಾಯಿ ಆರೋಗ್ಯ",
      beneficiaries: "ಫಲಾನುಭವಿಗಳ ರಿಜಿಸ್ಟರ್",
      route: "ಗ್ರಾಮ ಮಾರ್ಗ ನಕ್ಷೆ",
      incentives: "ಪ್ರೋತ್ಸಾಹಧನ ಲೆಕ್ಕ",
      followups: "ಫಾಲೋ-ಅಪ್ ಪಟ್ಟಿ",
      emergency: "ತುರ್ತು ಎಚ್ಚರಿಕೆ",
      ambulance: "108 ಆಂಬ್ಯುಲೆನ್ಸ್",
      publicPortal: "ಸಾರ್ವಜನಿಕ ಪೋರ್ಟಲ್ & 3D ಸೈಟ್",
      switchRole: "ಪಾತ್ರ ಬದಲಿಸಿ",
      languages: "ಭಾಷೆಗಳು (22)"
    },

    // Main Dashboard
    dashboard: {
      greeting: "ನಮಸ್ಕಾರ, ಶಾರದಾ ಬಾಯಿ!",
      roleDesc: "ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ದಿನಚರಿ • ಮಂಡ್ಯ PHC (ಸೆಕ್ಟರ್ 4)",
      audioBriefingStart: "ದಿನಚರಿ ಧ್ವನಿ ಬ್ರೀಫಿಂಗ್ ಕೇಳಿ",
      audioBriefingStop: "ಧ್ವನಿ ಬ್ರೀಫಿಂಗ್ ನಿಲ್ಲಿಸಿ",
      statBeneficiaries: "ಒಟ್ಟು ಫಲಾನುಭವಿಗಳು",
      statVisitsToday: "ಇಂದಿನ ನಿಗದಿತ ಭೇಟಿಗಳು",
      statFollowupsDue: "ಬಾಕಿ ಇರುವ ಫಾಲೋ-ಅಪ್",
      statEmergencies: "ತುರ್ತು ರೆಫರಲ್‌ಗಳು",
      maternalOverview: "ತಾಯಿ ಆರೋಗ್ಯ ಸಮೀಕ್ಷೆ",
      maternalSubtext: "14 ನೋಂದಾಯಿತ ಗರ್ಭಿಣಿಯರು ಮತ್ತು ಅಪಾಯದ ವರ್ಗೀಕರಣ",
      riskDistribution: "ಗರ್ಭಾವಸ್ಥೆ ಅಪಾಯದ ಹಂಚಿಕೆ",
      trimesterProgress: "ತ್ರೈಮಾಸಿಕ ಪ್ರಗತಿ",
      trimester1: "1ನೇ ತ್ರೈಮಾಸಿಕ (1-12 ವಾರ)",
      trimester2: "2ನೇ ತ್ರೈಮಾಸಿಕ (13-27 ವಾರ)",
      trimester3: "3ನೇ ತ್ರೈಮಾಸಿಕ (28-40 ವಾರ)",
      immunizationOverview: "ಮಕ್ಕಳ ಸಾರ್ವತ್ರಿಕ ಲಸಿಕಾ ಪ್ರಗತಿ (0-1 ವರ್ಷ)",
      immunizationSubtext: "ಶಿವಳ್ಳಿ ಉಪಕೇಂದ್ರದಲ್ಲಿ 22 ಶಿಶುಗಳು ನೋಂದಣಿ",
      recentVisits: "ಇತ್ತೀಚಿನ ಭೇಟಿ ದಾಖಲೆಗಳು",
      recentVisitsSubtext: "ಕನ್ನಡ ಧ್ವನಿ ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತ ದಾಖಲೀಕರಣ",
      startVisitBtn: "ಭೇಟಿ ಆರಂಭಿಸಿ",
      todaysTasks: "ಇಂದಿನ ಪ್ರಮುಖ ಕರ್ತವ್ಯಗಳು",
      portalRequests: "ಸಮುದಾಯ ಭೇಟಿ ವಿನಂತಿಗಳು",
      portalRequestsSubtext: "ಸಾರ್ವಜನಿಕ ಪೋರ್ಟಲ್‌ನಿಂದ ಬಂದಿರುವ ಕೋರಿಕೆಗಳು",
      noPendingRequests: "ಯಾವುದೇ ಹೊಸ ವಿನಂತಿಗಳು ಬಾಕಿ ಇಲ್ಲ",
      acceptRequest: "ದೃಢೀಕರಿಸಿ",
      ambulanceWidgetTitle: "108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಟೆಲಿಮೆಟ್ರಿ",
      ambulanceWidgetSubtext: "ನೈಜ ಸಮಯದ GPS ವಾಹನ ಪ್ರಗತಿ",
      openAmbulanceMap: "ಲೈವ್ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ",
      helplinesTitle: "ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು",
      ambulance108: "108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ",
      health104: "104 ಆರೋಗ್ಯ ಸಹಾಯವಾಣಿ",
      women181: "181 ಮಹಿಳಾ ಸಹಾಯವಾಣಿ",
      callNow: "ಕರೆ ಮಾಡಿ"
    },

    // Maternal Health Module
    maternal: {
      title: "ತಾಯಿ ಮತ್ತು ಗರ್ಭಿಣಿ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ",
      subtitle: "ಗರ್ಭಾವಸ್ಥೆ ಟ್ರ್ಯಾಕರ್, ತಪಾಸಣೆ, ಪೌಷ್ಟಿಕಾಂಶ & ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳ ಪರಿಶೀಲನೆ",
      mothersDirectory: "ನೋಂದಾಯಿತ ಗರ್ಭಿಣಿಯರ ಪಟ್ಟಿ",
      gestationalAge: "ಗರ್ಭಾವಸ್ಥೆಯ ಅವಧಿ",
      weeks: "ವಾರಗಳು",
      edd: "ಅಂದಾಜು ಹೆರಿಗೆ ದಿನಾಂಕ (EDD)",
      vitalsTitle: "ದೈಹಿಕ ಮತ್ತು ಕ್ಲಿನಿಕಲ್ ತಪಾಸಣೆ",
      bloodPressure: "ರಕ್ತದೊತ್ತಡ (BP)",
      hemoglobin: "ರಕ್ತಹೀನತೆ / ಹಿಮೋಗ್ಲೋಬಿನ್ (Hb)",
      fetalHeartRate: "ಭ್ರೂಣದ ಹೃದಯ ಬಡಿತ (FHR)",
      nutritionTitle: "ಪೌಷ್ಟಿಕಾಂಶ ಮತ್ತು ಔಷಧಿ ವಿತರಣೆ (ಪೋಷಣ್ ಅಭಿಯಾನ)",
      ifaTablets: "ಕಬ್ಬಿಣಾಂಶದ ಮಾತ್ರೆಗಳು (IFA)",
      calciumCompliance: "ಕ್ಯಾಲ್ಸಿಯಂ ಸೇವನೆ",
      ancVisits: "ಪ್ರಸವಪೂರ್ವ ತಪಾಸಣೆ (ANC) ಹಂತಗಳು",
      anc1: "ANC-1 (1ನೇ ತ್ರೈಮಾಸಿಕ)",
      anc2: "ANC-2 (24-26 ವಾರ)",
      anc3: "ANC-3 (32 ವಾರ)",
      anc4: "ANC-4 (36 ವಾರ)",
      dangerSignsTitle: "ಗರ್ಭಾವಸ್ಥೆಯ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳ ಪರಿಶೀಲನೆ (MoHFW)",
      severeHeadache: "ತೀವ್ರ ತಲೆನೋವು ಅಥವಾ ತಲೆತಿರುಗುವಿಕೆ",
      blurredVision: "ಕಣ್ಣು ಮಂಜಾಗುವುದು ಅಥವಾ ಕತ್ತಲೆ",
      vaginalBleeding: "ಯೋನಿ ರಕ್ತಸ್ರಾವ ಅಥವಾ ನೀರಿನ ಸೋರಿಕೆ",
      reducedMovement: "ಭ್ರೂಣದ ಚಲನೆ ಕಡಿಮೆಯಾಗುವುದು",
      facialEdema: "ಮುಖ ಮತ್ತು ಕಾಲುಗಳಲ್ಲಿ ತೀವ್ರ ಊತ",
      highFever: "ತೀವ್ರ ಜ್ವರ ಅಥವಾ ನಡುಕ",
      dangerSignDetected: "ಅಪಾಯಕಾರಿ ಲಕ್ಷಣ ಪತ್ತೆಯಾಗಿದೆ! ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ರೆಫರ್ ಮಾಡಿ.",
      triggerReferralBtn: "PHC ಗೆ ರೆಫರ್ ಮಾಡಿ / 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ"
    },

    // Child Immunization Module
    immunization: {
      title: "ಸಾರ್ವತ್ರಿಕ ಲಸಿಕಾ ಟ್ರ್ಯಾಕರ್",
      subtitle: "ಜನನದಿಂದ 9 ತಿಂಗಳವರೆಗಿನ ಸಮಗ್ರ ಲಸಿಕಾ ವೇಳಾಪಟ್ಟಿ",
      vaccineSchedule: "ಲಸಿಕಾ ವೇಳಾಪಟ್ಟಿ",
      birthDoses: "ಜನನ (BCG, OPV-0, Hep-B)",
      weeks6: "6 ವಾರ (OPV-1, Pentavalent-1, Rota-1, fIPV-1, PCV-1)",
      weeks10: "10 ವಾರ (OPV-2, Pentavalent-2, Rota-2)",
      weeks14: "14 ವಾರ (OPV-3, Pentavalent-3, Rota-3, fIPV-2, PCV-2)",
      months9: "9 ತಿಂಗಳು (MR-1, JE-1, Vit-A 1ನೇ ಡೋಸ್)",
      markVaccinated: "ಲಸಿಕೆ ನೀಡಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      dueToday: "ಇಂದು ನೀಡಬೇಕಾದ ಲಸಿಕೆಗಳು",
      upcomingThisWeek: "ಈ ವಾರ ಬಾಕಿ ಇರುವ ಲಸಿಕೆಗಳು"
    },

    // Ambulance & Emergency Assistance
    ambulance: {
      title: "108 ತುರ್ತು ವಾಹನ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್",
      subtitle: "ನೈಜ ಸಮಯದ ವಾಹನ ಪ್ರಗತಿ, ಜಿಪಿಎಸ್ ನಕ್ಷೆ ಮತ್ತು ಚಾಲಕರ ಸಂಪರ್ಕ",
      disclaimerTitle: "ತರಬೇತಿ ಮತ್ತು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಸಿಮ್ಯುಲೇಶನ್ ಮಾತ್ರ",
      disclaimerText: "ಇದು ಕೇವಲ ಡೆಮೊ ಸಿಮ್ಯುಲೇಶನ್ ಆಗಿದೆ. ಯಾವುದೇ ನಿಜವಾದ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಥವಾ ತುರ್ತು ವಿಭಾಗವನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಿಲ್ಲ.",
      requestId: "ಆಂಬ್ಯುಲೆನ್ಸ್ ಕೋರಿಕೆ ಐಡಿ",
      currentStatus: "ಪ್ರಸ್ತುತ ರವಾನೆ ಸ್ಥಿತಿ",
      requested: "ಕೋರಲಾಗಿದೆ",
      dispatched: "ಹೊರಟಿದೆ",
      onTheWay: "ಮಾರ್ಗದಲ್ಲಿದೆ",
      arrived: "ಸ್ಥಳ ತಲುಪಿದೆ",
      completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      eta: "ಅಂದಾಜು ತಲುಪುವ ಸಮಯ (ETA)",
      distanceRemaining: "ಬಾಕಿ ಇರುವ ದೂರ",
      speed: "ಪ್ರಸ್ತುತ ವೇಗ",
      lastUpdate: "ಕೊನೆಯ GPS ಮಾಹಿತಿ",
      patientLocation: "ರೋಗಿಯ ಸ್ಥಳ (ಪಿಕ್-ಅಪ್)",
      hospitalLocation: "ಗಮ್ಯಸ್ಥಾನ ಆಸ್ಪತ್ರೆ / PHC",
      driverName: "ಚಾಲಕರ ಹೆಸರು",
      driverPhone: "ಚಾಲಕರ ದೂರವಾಣಿ",
      vehicleNumber: "ವಾಹನ ಸಂಖ್ಯೆ",
      emtStaff: "ತುರ್ತು ವೈದ್ಯಕೀಯ ಸಿಬ್ಬಂದಿ",
      recenterMap: "ಆಂಬ್ಯುಲೆನ್ಸ್ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ",
      recenterPatient: "ರೋಗಿಯ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ",
      fitBounds: "ಸಂಪೂರ್ಣ ಮಾರ್ಗ ವೀಕ್ಷಿಸಿ",
      demoAdvanceStep: "ಸಿಮ್ಯುಲೇಶನ್ ಹಂತ ಮುನ್ನಡೆಸಿ",
      demoReset: "ಸಿಮ್ಯುಲೇಶನ್ ಮರುಹೊಂದಿಸಿ",
      autoSimulate: "ಸ್ವಯಂಚಾಲಿತ ಹಂತ (3.5 ಸೆಕೆಂಡ್)",
      callingDriver: "ಚಾಲಕರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      mapLoading: "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      mapPermissionDenied: "ಸ್ಥಳದ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಮಂಡ್ಯ ಡೀಫಾಲ್ಟ್ ನಕ್ಷೆಯನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.",
      mapApiError: "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ API ಲಭ್ಯವಿಲ್ಲ. ಹೈ-ರೆಸಲ್ಯೂಶನ್ ವೆಕ್ಟರ್ ನಕ್ಷೆಯನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ."
    },

    // AI Voice Assistant Module
    voice: {
      title: "ಬಹುಭಾಷಾ AI ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ",
      subtitle: "AI4Bharat Indic-Transcribe ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ & Indic-Speak TTS",
      readyToRecord: "ರೆಕಾರ್ಡ್ ಮಾಡಲು ಸಿದ್ಧವಾಗಿದೆ",
      recordingInProgress: "ಆಲಿಸುತ್ತಿದೆ... ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸರಳವಾಗಿ ಮಾತನಾಡಿ",
      processingAudio: "AI4Bharat ಮೂಲಕ ಆಡಿಯೋ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      startRecordingBtn: "ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ",
      stopRecordingBtn: "ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ",
      retryBtn: "ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ",
      listenAudioBtn: "ರೆಕಾರ್ಡಿಂಗ್ ಕೇಳಿ",
      extractedCardTitle: "ಗುರುತಿಸಲಾದ ಕ್ಲಿನಿಕಲ್ ಮಾಹಿತಿ",
      kannadaReadback: "ಕನ್ನಡ ಧ್ವನಿ ದೃಢೀಕರಣ ರೀಡ್‌ಬ್ಯಾಕ್",
      listenReadbackBtn: "ರೀಡ್‌ಬ್ಯಾಕ್ ಕೇಳಿ",
      evaluationPresets: "ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು (Presets)",
      saveVisitBtn: "ದಾಖಲೆಯನ್ನು ಸೇವ್ ಮಾಡಿ (SQLite)",
      dangerAlertTitle: "ತುರ್ತು ಅಪಾಯಕಾರಿ ಎಚ್ಚರಿಕೆ ಪತ್ತೆಯಾಗಿದೆ!"
    },

    // Beneficiary Directory
    beneficiaries: {
      title: "ಫಲಾನುಭವಿಗಳ ಸಮುದಾಯ ರಿಜಿಸ್ಟರ್",
      subtitle: "ಶಿವಳ್ಳಿ ಮತ್ತು ಕೆರೆಗೋಡು ಉಪಕೇಂದ್ರ ವ್ಯಾಪ್ತಿಯ ನಿವಾಸಿಗಳು",
      searchPlaceholder: "ಹೆಸರು, ಐಡಿ, ಫೋನ್ ಅಥವಾ ಗ್ರಾಮದಿಂದ ಹುಡುಕಿ...",
      addNewBtn: "ಹೊಸ ಫಲಾನುಭವಿ ನೋಂದಣಿ",
      categoryAll: "ಎಲ್ಲಾ ಫಲಾನುಭವಿಗಳು",
      categoryANC: "ಗರ್ಭಿಣಿಯರು (ANC)",
      categoryPNC: "ಬಾಣಂತಿಯರು (PNC)",
      categoryChild: "ಶಿಶುಗಳು (0-1 ವರ್ಷ)",
      totalRegistered: "ಒಟ್ಟು ನೋಂದಾಯಿತರು",
      viewProfile: "ಆರೋಗ್ಯ ವಿವರ ನೋಡಿ"
    },

    // Household Route Screen
    route: {
      title: "ಗ್ರಾಮ ಮನೆ ಭೇಟಿ ನಕ್ಷೆ ಯೋಜನೆ",
      subtitle: "ಮಂಡ್ಯ ಸೆಕ್ಟರ್ 4 ರ ದೈನಂದಿನ ಆಪ್ಟಿಮೈಸ್ಡ್ GPS ನಡಿಗೆ ಮಾರ್ಗ",
      aiPriority: "AI ಆದ್ಯತೆ (ಹೆಚ್ಚಿನ ಅಪಾಯ ಮೊದಲು)",
      shortestDistance: "ಕಡಿಮೆ ದೂರ",
      optimizedBadge: "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸ್ಡ್ ಆಗಿದೆ",
      totalDistance: "ಅಂದಾಜು ನಡಿಗೆ ದೂರ: 3.8 ಕಿ.ಮೀ",
      stopsCount: "5 ಮನೆ ಭೇಟಿಗಳು ನಿಗದಿಯಾಗಿವೆ",
      offlineGpsBadge: "ಆಫ್‌ಲೈನ್ GPS ಸಂಗ್ರಹ ಸಕ್ರಿಯ",
      lakeLandmark: "ಶಿವಳ್ಳಿ ಕೆರೆ",
      startVisitBtn: "ಮನೆ ಭೇಟಿ ಆರಂಭಿಸಿ"
    },

    // Incentives Screen
    incentives: {
      title: "ಆಶಾ ಪ್ರೋತ್ಸಾಹಧನ ಲೆಕ್ಕಪತ್ರ (NHM)",
      subtitle: "JSY, ಲಸಿಕಾ ಪ್ರೋತ್ಸಾಹಧನ, ಮಾಸಿಕ ಗಳಿಕೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಕರ ಅನುಮೋದನೆ",
      submitToANM: "ANM ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಸಲ್ಲಿಸಿ",
      submittedSuccess: "ದಾಖಲೆಗಳನ್ನು ANM ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!",
      totalEarnedMonth: "ಈ ತಿಂಗಳ ಒಟ್ಟು ಗಳಿಕೆ",
      approvedANM: "ANM ಅನುಮೋದಿತ ಮೊತ್ತ",
      underReviewMO: "MO ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ",
      projectedTarget: "ಗುರಿ ಸಂಭಾವನೆ (Target)",
      monthlyTrend: "ಮಾಸಿಕ ಗಳಿಕೆ ಪ್ರಗತಿ",
      claimsLedger: "ಮದವಾರು ಪ್ರೋತ್ಸಾಹಧನ ಪಟ್ಟಿ",
      claimId: "ಕ್ಲೈಮ್ ಐಡಿ",
      taskScheme: "ಕಾರ್ಯ / ಯೋಜನೆ",
      amount: "ಮೊತ್ತ (₹)",
      verifyCode: "ಪರಿಶೀಲನಾ ಕೋಡ್"
    }
  }
};

/**
 * Helper to fetch nested translation string by dot-notation key.
 * Falls back to English, and finally the key itself.
 */
export function t(key, lang = 'kn') {
  const currentLang = (lang === 'hi' || lang === 'en') ? lang : 'kn';
  const parts = key.split('.');
  
  let val = TRANSLATIONS[currentLang];
  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      val = null;
      break;
    }
  }

  if (val !== null && val !== undefined) return val;

  // Fallback to English
  let fallbackVal = TRANSLATIONS.en;
  for (const part of parts) {
    if (fallbackVal && typeof fallbackVal === 'object' && part in fallbackVal) {
      fallbackVal = fallbackVal[part];
    } else {
      fallbackVal = null;
      break;
    }
  }

  return (fallbackVal !== null && fallbackVal !== undefined) ? fallbackVal : key;
}

/**
 * Formats date into locale-appropriate string for en, hi, or kn.
 */
export function formatLocalizedDate(dateObj, lang = 'kn') {
  const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj || Date.now());
  const locale = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
}
