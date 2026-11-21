/**
 * Synthetic Healthcare Dataset for ASHA Voice Field Register
 * All records, names, contact numbers, and identifiers are purely synthetic.
 * Conforms to National Health Mission (NHM) Karnataka guidelines.
 */

export const INITIAL_BENEFICIARIES = [
  {
    id: "ASHA-KA-2024-0101",
    name_en: "Lakshmamma K.",
    name_kn: "ಲಕ್ಷ್ಮಮ್ಮ ಕೆ.",
    age: 24,
    phone: "+91 98450 XXXXX",
    village: "Shivalli, Mandya PHC",
    ward: "Ward 3",
    category: "ANC", // Antenatal Care
    subCategory: "2nd Trimester (24 weeks)",
    highRisk: false,
    riskFactors: [],
    weight: 56.5,
    bloodGroup: "B+",
    lastVisitDate: "2026-10-28",
    nextVisitDate: "2026-11-25",
    vaccinationsDue: ["TT-2 / TD-2 Booster"],
    vaccinationsCompleted: ["TT-1 / TD-1 (08/2026)", "Albendazole (Deworming)"],
    supplements: "IFA (Iron Folic Acid) 100 tablets given",
    visitHistory: [
      {
        id: "VIS-101-1",
        date: "2026-08-15",
        type: "ANC (1st Trimester)",
        weight: 52.0,
        notes: "Pregnancy confirmed. Registration in RCH portal completed. MCP card issued.",
        vaccinesGiven: ["TT-1 / TD-1"],
        dangerSigns: "None"
      },
      {
        id: "VIS-101-2",
        date: "2026-10-28",
        type: "ANC (2nd Trimester)",
        weight: 56.5,
        notes: "Fetal heart sounds normal. IFA compliance checked. Advised nutrition.",
        vaccinesGiven: ["Albendazole"],
        dangerSigns: "None"
      }
    ]
  },
  {
    id: "ASHA-KA-2024-0102",
    name_en: "Geetha M.",
    name_kn: "ಗೀತಾ ಎಂ.",
    age: 28,
    phone: "+91 98451 XXXXX",
    village: "Keregodu, Mandya PHC",
    ward: "Ward 1",
    category: "ANC",
    subCategory: "3rd Trimester (34 weeks)",
    highRisk: true,
    riskFactors: ["History of gestational hypertension", "Rapid weight gain"],
    weight: 64.0,
    bloodGroup: "O+",
    lastVisitDate: "2026-11-10",
    nextVisitDate: "2026-11-22",
    vaccinationsDue: ["None (Schedule complete)"],
    vaccinationsCompleted: ["TT-1", "TT-2", "Calcium + IFA"],
    supplements: "Calcium and IFA tablets",
    visitHistory: [
      {
        id: "VIS-102-1",
        date: "2026-11-10",
        type: "ANC (3rd Trimester)",
        weight: 64.0,
        notes: "Mild pedal edema noticed. Advised left lateral resting position and low salt.",
        vaccinesGiven: ["Calcium 500mg"],
        dangerSigns: "Mild headache (monitored)"
      }
    ]
  },
  {
    id: "ASHA-KA-2024-0103",
    name_en: "Shruthi Patel",
    name_kn: "ಶೃತಿ ಪಟೇಲ್",
    age: 22,
    phone: "+91 98452 XXXXX",
    village: "Dudda, Mandya PHC",
    ward: "Ward 4",
    category: "PNC", // Postnatal Care
    subCategory: "Infant 6 months (Baby Aarav)",
    highRisk: false,
    riskFactors: [],
    weight: 51.0,
    bloodGroup: "A+",
    lastVisitDate: "2026-10-15",
    nextVisitDate: "2026-11-20",
    vaccinationsDue: ["OPV-3", "Pentavalent-3", "Rotavirus-3", "fIPV-2"],
    vaccinationsCompleted: ["BCG", "Hep B-0", "OPV-1,2", "Pentavalent-1,2"],
    supplements: "Vitamin A 1st dose pending at 9m",
    visitHistory: [
      {
        id: "VIS-103-1",
        date: "2026-06-12",
        type: "PNC Day 42",
        weight: 50.5,
        notes: "Exclusive breastfeeding counseling given. Baby thriving and smiling.",
        vaccinesGiven: ["OPV-2", "Pentavalent-2"],
        dangerSigns: "None"
      }
    ]
  },
  {
    id: "ASHA-KA-2024-0104",
    name_en: "Basavaraj Shivappa",
    name_kn: "ಬಸವರಾಜ್ ಶಿವಪ್ಪ",
    age: 58,
    phone: "+91 98453 XXXXX",
    village: "Shivalli, Mandya PHC",
    ward: "Ward 2",
    category: "NCD", // Non-Communicable Disease
    subCategory: "Hypertension & Diabetes Followup",
    highRisk: false,
    riskFactors: ["Elevated BP trend"],
    weight: 68.0,
    bloodGroup: "AB+",
    lastVisitDate: "2026-10-20",
    nextVisitDate: "2026-11-24",
    vaccinationsDue: ["Seasonal Flu (Optional)"],
    vaccinationsCompleted: ["COVID-19 Booster"],
    supplements: "Amlodipine 5mg regular compliance",
    visitHistory: [
      {
        id: "VIS-104-1",
        date: "2026-10-20",
        type: "NCD Home Visit",
        weight: 68.0,
        notes: "BP measured 138/88 mmHg. Advised walking and medication adherence.",
        vaccinesGiven: [],
        dangerSigns: "None"
      }
    ]
  },
  {
    id: "ASHA-KA-2024-0105",
    name_en: "Sunitha Ramesh",
    name_kn: "ಸುನೀತಾ ರಮೇಶ್",
    age: 26,
    phone: "+91 98454 XXXXX",
    village: "Basaralu, Mandya PHC",
    ward: "Ward 2",
    category: "ANC",
    subCategory: "1st Trimester (10 weeks)",
    highRisk: false,
    riskFactors: [],
    weight: 48.0,
    bloodGroup: "O-",
    lastVisitDate: "2026-11-02",
    nextVisitDate: "2026-12-01",
    vaccinationsDue: ["TT-1 / TD-1 First Dose"],
    vaccinationsCompleted: ["Folic Acid 5mg Daily"],
    supplements: "Folic Acid started",
    visitHistory: []
  },
  {
    id: "ASHA-KA-2024-0106",
    name_en: "Baby Ananya (Mother: Kavitha)",
    name_kn: "ಬೇಬಿ ಅನನ್ಯಾ (ತಾಯಿ: ಕವಿತಾ)",
    age: 1, // 1.5 months
    phone: "+91 98455 XXXXX",
    village: "Keregodu, Mandya PHC",
    ward: "Ward 3",
    category: "Immunization",
    subCategory: "Infant 6 weeks",
    highRisk: false,
    riskFactors: [],
    weight: 4.2,
    bloodGroup: "Unknown",
    lastVisitDate: "2026-10-10",
    nextVisitDate: "2026-11-21", // Today!
    vaccinationsDue: ["OPV-1", "Pentavalent-1", "Rotavirus-1", "PCV-1"],
    vaccinationsCompleted: ["BCG at birth", "Hep B-0 at birth", "OPV-0 at birth"],
    supplements: "Exclusive breastfeeding support",
    visitHistory: []
  }
];

export const INITIAL_VISITS = [
  {
    id: "VIS-2026-001",
    beneficiary_id: "ASHA-KA-2024-0101",
    beneficiary_name: "Lakshmamma K.",
    visit_type: "ANC (Antenatal Care)",
    weight: 58.5,
    vaccinations_due: "TT-2 / TD-2",
    vaccinations_completed: "TT-1, Albendazole",
    next_visit_date: "2026-12-05",
    additional_notes: "Bilingual visit record. Normal fetal movement felt. IFA tablets refilled for 30 days. BP 118/76 mmHg.",
    danger_sign_detected: false,
    danger_signs: [],
    created_at: "2026-11-21T09:30:00Z",
    status: "Confirmed"
  },
  {
    id: "VIS-2026-002",
    beneficiary_id: "ASHA-KA-2024-0103",
    beneficiary_name: "Shruthi Patel",
    visit_type: "PNC / Child Immunization",
    weight: 7.2,
    vaccinations_due: "None for this month",
    vaccinations_completed: "OPV-3, Pentavalent-3, Rotavirus-3",
    next_visit_date: "2026-12-20",
    additional_notes: "Baby active and feeding well. Advised initiation of soft complementary foods after 6 months.",
    danger_sign_detected: false,
    danger_signs: [],
    created_at: "2026-11-21T10:45:00Z",
    status: "Confirmed"
  }
];

export const INITIAL_FOLLOWUPS = [
  {
    id: "FOL-001",
    beneficiary_id: "ASHA-KA-2024-0106",
    beneficiary_name: "Baby Ananya (Mother: Kavitha)",
    beneficiary_name_kn: "ಬೇಬಿ ಅನನ್ಯಾ (ತಾಯಿ: ಕವಿತಾ)",
    category: "Immunization",
    type: "6-Week Primary Immunization Due",
    due_date: "2026-11-21", // Today
    status: "pending",
    village: "Keregodu",
    priority: "high",
    notes: "Pentavalent-1 and OPV-1 due today at Anganwadi center."
  },
  {
    id: "FOL-002",
    beneficiary_id: "ASHA-KA-2024-0102",
    beneficiary_name: "Geetha M.",
    beneficiary_name_kn: "ಗೀತಾ ಎಂ.",
    category: "ANC",
    type: "34-Week High Risk Checkup",
    due_date: "2026-11-22", // Upcoming tomorrow
    status: "upcoming",
    village: "Keregodu",
    priority: "urgent",
    notes: "Check BP and screen for pre-eclampsia danger signs (headache/edema)."
  },
  {
    id: "FOL-003",
    beneficiary_id: "ASHA-KA-2024-0105",
    beneficiary_name: "Sunitha Ramesh",
    beneficiary_name_kn: "ಸುನೀತಾ ರಮೇಶ್",
    category: "ANC",
    type: "1st Trimester Blood Tests & USG",
    due_date: "2026-11-18", // Missed 3 days ago
    status: "missed",
    village: "Basaralu",
    priority: "medium",
    notes: "Missed scheduled ANC clinic at PHC. Needs home visit reminder."
  },
  {
    id: "FOL-004",
    beneficiary_id: "ASHA-KA-2024-0104",
    beneficiary_name: "Basavaraj Shivappa",
    beneficiary_name_kn: "ಬಸವರಾಜ್ ಶಿವಪ್ಪ",
    category: "NCD",
    type: "Hypertension Medicine Refill",
    due_date: "2026-11-24",
    status: "upcoming",
    village: "Shivalli",
    priority: "low",
    notes: "Monthly BP monitoring and ensure Amlodipine strip is not finished."
  }
];

export const INITIAL_EMERGENCY_ALERTS = [
  {
    id: "EMG-2026-001",
    beneficiary_id: "ASHA-KA-2024-0102",
    beneficiary_name: "Geetha M.",
    beneficiary_name_kn: "ಗೀತಾ ಎಂ.",
    village: "Keregodu, Mandya PHC",
    phone: "+91 98451 XXXXX",
    danger_signs: [
      {
        en: "Severe persistent headache and blurred vision in 3rd trimester",
        kn: "ಮೂರನೇ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಬ್ಬಾಗುವಿಕೆ",
        category: "Obstetric Danger Sign"
      },
      {
        en: "Severe swelling of hands, face, and feet (Pre-eclampsia symptom)",
        kn: "ಮುಖ, ಕೈ ಮತ್ತು ಕಾಲುಗಳಲ್ಲಿ ತೀವ್ರ ಊತ",
        category: "Vital Danger Sign"
      }
    ],
    referral_instruction: "Refer to PHC now",
    referral_instruction_kn: "ತಕ್ಷಣ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕರೆದೊಯ್ಯಿರಿ",
    referral_status: "108 Ambulance Alerted",
    ambulance_called: true,
    created_at: "2026-11-21T11:15:00Z",
    dispatched_to: "Mandya Taluk Hospital / PHC",
    notes: "ASHA worker Geetha initiated rapid transport via 108 Emergency Service."
  }
];

/**
 * Realistic Demo Scenarios for Mock Mode
 * Demonstrates AI4Bharat Indic-Transcribe chunking and extraction.
 * Mixed Kannada + English medical terms as requested in user prompt.
 */
export const DEMO_SCENARIOS = [
  {
    id: "anc_routine",
    title: "1. ಗರ್ಭಿಣಿ ತಪಾಸಣೆ (ANC Routine Visit - Lakshmamma)",
    badge: "Routine ANC",
    beneficiary_id: "ASHA-KA-2024-0101",
    beneficiary_name: "Lakshmamma K.",
    audio_transcript_kn: "ಲಕ್ಷ್ಮಮ್ಮ ಅವರ ಮನೆಗೆ ಭೇಟಿ ನೀಡಲಾಗಿದೆ. ಗರ್ಭಿಣಿ ತಪಾಸಣೆ. ತೂಕ 58.5 kg ಇದೆ. ಬಿಪಿ 120/80 normal ಆಗಿದೆ. ಟಿಟಿ-2 ಇಂಜೆಕ್ಷನ್ ನೀಡಲಾಗಿದೆ. ಹೊಟ್ಟೆಯಲ್ಲಿ ಮಗುವಿನ ಚಲನೆ ಚೆನ್ನಾಗಿದೆ. ಮುಂದಿನ ಭೇಟಿ 2026-12-05 ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ಐರನ್ ಫೋಲಿಕ್ ಆಸಿಡ್ ಮಾತ್ರೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ತಿಳಿಸಲಾಗಿದೆ.",
    audio_transcript_en_translation: "Visited Lakshmamma's home. ANC checkup. Weight is 58.5 kg. BP 120/80 normal. TT-2 injection given. Baby movement good. Next visit scheduled on 2026-12-05. Advised to take IFA tablets.",
    extracted_record: {
      beneficiary_id: "ASHA-KA-2024-0101",
      beneficiary_name: "Lakshmamma K.",
      visit_type: "ANC (Antenatal Care)",
      weight: "58.5",
      vaccinations_due: "None",
      vaccinations_completed: "TT-2 / TD-2 Booster",
      next_visit_date: "2026-12-05",
      additional_notes: "BP 120/80 normal. Good fetal movements. 30 IFA tablets distributed. Advised green leafy vegetables.",
      danger_sign_detected: false,
      danger_signs: []
    },
    spoken_confirmation_kn: "ಲಕ್ಷ್ಮಮ್ಮ ಅವರ ಗರ್ಭಿಣಿ ತಪಾಸಣೆ ದಾಖಲಾಗಿದೆ. ತೂಕ ಐವತ್ತೆಂಟು ಪಾಯಿಂಟ್ ಐದು ಕೆಜಿ. ಟಿಟಿ-2 ಲಸಿಕೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಮುಂದಿನ ಭೇಟಿ ಡಿಸೆಂಬರ್ ಐದಕ್ಕೆ ನಿಗದಿಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಖಚಿತಪಡಿಸಿ."
  },
  {
    id: "danger_sign_emergency",
    title: "2. ⚠️ ತುರ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣ (Danger Sign Detected - Geetha)",
    badge: "Emergency Danger Sign",
    isEmergency: true,
    beneficiary_id: "ASHA-KA-2024-0102",
    beneficiary_name: "Geetha M.",
    audio_transcript_kn: "ಗೀತಾ ಅವರ ಮನೆಗೆ ಭೇಟಿ ನೀಡಿದೆ. ಅವರಿಗೆ ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಬ್ಬು (severe headache and blurred vision) ಇದೆ. ಮುಖ ಮತ್ತು ಕಾಲುಗಳಲ್ಲಿ ತೀವ್ರ ಊತ ಕಾಣಿಸಿಕೊಂಡಿದೆ. ತೂಕ 65 kg ಇದೆ. ಬಿಪಿ ತುಂಬಾ ಹೆಚ್ಚಾಗಿದೆ. ಹೊಟ್ಟೆಯಲ್ಲಿ ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗಿದೆ ಎಂದು ಹೇಳುತ್ತಿದ್ದಾರೆ.",
    audio_transcript_en_translation: "Visited Geetha's home. She has severe headache and blurred vision. Severe facial and pedal edema observed. Weight is 65 kg. BP very high. Complains of reduced fetal movements.",
    extracted_record: {
      beneficiary_id: "ASHA-KA-2024-0102",
      beneficiary_name: "Geetha M.",
      visit_type: "ANC Emergency Evaluation",
      weight: "65.0",
      vaccinations_due: "Schedule paused pending evaluation",
      vaccinations_completed: "TT-1, TT-2 (Prior)",
      next_visit_date: "2026-11-22",
      additional_notes: "EMERGENCY: Severe headache, blurred vision, sudden edema and reduced fetal movement reported.",
      danger_sign_detected: true,
      danger_signs: [
        "Severe persistent headache & blurred vision (ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಬ್ಬಾಗುವಿಕೆ)",
        "Severe swelling of face and limbs (ಮುಖ ಮತ್ತು ಕಾಲುಗಳಲ್ಲಿ ತೀವ್ರ ಊತ)",
        "Decreased fetal movements (ಮಗುವಿನ ಚಲನೆ ಕ್ಷೀಣತೆ)"
      ]
    },
    danger_alert: {
      beneficiary_id: "ASHA-KA-2024-0102",
      beneficiary_name: "Geetha M.",
      beneficiary_name_kn: "ಗೀತಾ ಎಂ.",
      village: "Keregodu, Mandya PHC",
      danger_signs: [
        {
          en: "Severe persistent headache and blurred vision in 3rd trimester",
          kn: "ಮೂರನೇ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಬ್ಬಾಗುವಿಕೆ",
          category: "Obstetric Danger Sign"
        },
        {
          en: "Decreased fetal movement reported",
          kn: "ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗಿರುವುದು",
          category: "Fetal Danger Sign"
        }
      ],
      referral_instruction: "Refer to PHC now",
      referral_instruction_kn: "ತಕ್ಷಣ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕರೆದೊಯ್ಯಿರಿ",
      referral_status: "Pending Action"
    },
    spoken_confirmation_kn: "ಎಚ್ಚರಿಕೆ! ಗೀತಾ ಅವರಿಗೆ ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಬ್ಬಾಗುವ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ. ತಕ್ಷಣ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ ರೆಫರ್ ಮಾಡಿ."
  },
  {
    id: "child_immunization",
    title: "3. ಮಗುವಿನ ಲಸಿಕೆ ಭೇಟಿ (PNC / Immunization - Baby Aarav)",
    badge: "Child Health",
    beneficiary_id: "ASHA-KA-2024-0103",
    beneficiary_name: "Shruthi Patel",
    audio_transcript_kn: "ಶೃತಿ ಅವರ ಮಗುವಿಗೆ 6 ತಿಂಗಳ ಭೇಟಿ. ಮಗುವಿನ ತೂಕ 7.2 kg ಇದೆ. ಇಂದು OPV-3 ಮತ್ತು ಪೆಂಟಾವಲೆಂಟ್-3 ಲಸಿಕೆ ನೀಡಲಾಗಿದೆ. ಯಾವುದೇ ಜ್ವರ ಅಥವಾ ಅಲರ್ಜಿ ಇಲ್ಲ. ತಾಯಿ ಎದೆಹಾಲು ಮಾತ್ರ ಕುಡಿಸುತ್ತಿದ್ದಾರೆ. ಮುಂದಿನ ಭೇಟಿ 9 ತಿಂಗಳಿಗೆ Vitamin A ಮತ್ತು Measles-Rubella ಲಸಿಕೆಗಾಗಿ 2026-12-20.",
    audio_transcript_en_translation: "6-month checkup for Shruthi's child. Baby weight is 7.2 kg. OPV-3 and Pentavalent-3 vaccines administered today. No fever. Next visit at 9 months for MR and Vit A on 2026-12-20.",
    extracted_record: {
      beneficiary_id: "ASHA-KA-2024-0103",
      beneficiary_name: "Shruthi Patel",
      visit_type: "PNC / Child Immunization (6 Months)",
      weight: "7.2",
      vaccinations_due: "MR-1, Vitamin A (at 9 months)",
      vaccinations_completed: "OPV-3, Pentavalent-3, Rotavirus-3",
      next_visit_date: "2026-12-20",
      additional_notes: "Baby active. Weight gain satisfactory. Counseling on semi-solid complementary feeding given.",
      danger_sign_detected: false,
      danger_signs: []
    },
    spoken_confirmation_kn: "ಶೃತಿ ಅವರ ಮಗುವಿನ ಆರು ತಿಂಗಳ ಲಸಿಕೆ ದಾಖಲಾಗಿದೆ. ತೂಕ ಏಳು ಪಾಯಿಂಟ್ ಎರಡು ಕೆಜಿ. ಪೆಂಟಾ ಮೂರು ಮತ್ತು ಓಪಿವಿ ಮೂರು ಲಸಿಕೆ ಪೂರ್ಣಗೊಂಡಿದೆ."
  }
];
