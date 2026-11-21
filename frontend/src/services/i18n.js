/**
 * Comprehensive Trilingual Internationalization (i18n) for ASHA Sakhi
 * Supports English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ)
 */

export const TRANSLATIONS = {
  en: {
    // Navigation
    nav: {
      brand: "ASHA Sakhi",
      tagline: "Digital Companion for Community Health",
      features: "Features",
      problem: "Why It Matters",
      howItWorks: "How It Works",
      impact: "Impact",
      testimonials: "Stories",
      faq: "FAQ",
      launchApp: "Launch Web App",
      signIn: "Worker Sign In",
      backToLanding: "← Back to Website",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
    },

    // Hero Section
    hero: {
      badge: "National Health Mission Compliant • 100% Offline Capable",
      headlineLead: "Empowering India's Healthcare Heroes",
      headlineHighlight: "at the Last Mile",
      subtext: "ASHA Sakhi is an AI-powered, bilingual digital field register that automates household visits, maternal & child tracking, universal immunization schedules, and supervisor reporting for India's 1 million+ ASHA workers.",
      ctaPrimary: "Launch Web App (Free Demo)",
      ctaSecondary: "Explore Field Register",
      trustText: "Trusted across 2,400+ village sub-centres in Karnataka, UP, and Maharashtra",
      stats: {
        villages: "2,400+ Villages",
        workers: "12,800+ ASHA Heroes",
        visits: "350,000+ Visits Logged",
        satisfaction: "99.4% Immunization Rate",
      }
    },

    // Problem & Solution
    problem: {
      badge: "The Field Reality vs The Digital Leap",
      title: "From 12 Heavy Paper Registers to One Voice-First Companion",
      subtitle: "Every day, an ASHA worker walks 10+ kilometres to care for 1,000 villagers while manually maintaining complex paper registries.",
      before: {
        title: "The Paper Burden",
        item1: "12+ heavy physical registers to carry across dirt tracks in the heat.",
        item2: "Frequent missed vaccination dates due to complex handwritten schedules.",
        item3: "Critical maternal danger signs delayed in transit with no rapid ambulance link.",
        item4: "End-of-month stress spending 4 days calculating government incentive claims.",
      },
      after: {
        title: "With ASHA Sakhi",
        item1: "Natural Kannada/Hindi voice notes instantly structured into digital cards.",
        item2: "Automated Universal Immunization alerts with zero missed infant doses.",
        item3: "Real-time MoHFW danger sign detection with 108 ambulance dispatch simulation.",
        item4: "One-click transparent incentive ledger with JSY/PMSMA payment tallies.",
      }
    },

    // Features Bento Grid
    features: {
      badge: "Engineered for Rural Health",
      title: "Built for Hands That Care",
      subtitle: "High-contrast clinical workflows designed for community smartphones, poor connectivity, and rapid field execution.",
      cards: [
        {
          id: "voice",
          title: "AI4Bharat Voice Visit Logging",
          desc: "Speak naturally in Kannada or Hindi with English medical terms. Indic-Transcribe structures weights, vitals, and notes automatically.",
          tag: "AI Powered"
        },
        {
          id: "maternal",
          title: "Maternal & Child Tracking",
          desc: "Complete 4-ANC protocol tracking, PMSMA high-risk pregnancy screening, and Hb trajectory monitoring to prevent maternal mortality.",
          tag: "Clinical Care"
        },
        {
          id: "immunization",
          title: "Universal Immunization Alerts",
          desc: "Automated UIP schedules from birth BCG to 9-month Measles-Rubella with color-coded overdue warnings and village cohort lists.",
          tag: "Zero Missed Doses"
        },
        {
          id: "offline",
          title: "100% Offline-First SQLite",
          desc: "Capture records without mobile internet in deep rural forest areas. Automatically synchronizes when connectivity is detected.",
          tag: "No Internet Needed"
        },
        {
          id: "incentives",
          title: "Transparent Incentive Ledger",
          desc: "Live rupee counter for every completed home visit, institutional delivery link (JSY), and immunization round. Download monthly PDF claims.",
          tag: "Fair Compensation"
        },
        {
          id: "ambulance",
          title: "Emergency 108 Dispatch Simulator",
          desc: "Immediate clinical danger-sign alerts with simulated 108 ambulance GPS routing, ETA countdowns, and direct medical officer calls.",
          tag: "Life Saving"
        }
      ]
    },

    // How It Works
    howItWorks: {
      badge: "Simple 3-Step Routine",
      title: "How ASHA Sakhi Works in the Field",
      subtitle: "No complex typing. Designed to be learned in under 5 minutes.",
      steps: [
        {
          num: "01",
          title: "Tap Mic & Speak Naturally",
          desc: "During the home visit, tap the large microphone button and describe the mother or child's condition in your mother tongue.",
        },
        {
          num: "02",
          title: "AI Structures the Clinical Chart",
          desc: "AI4Bharat parses weight, vaccines, and notes. If a maternal danger sign is detected, an instant referral directive is surfaced.",
        },
        {
          num: "03",
          title: "Listen to Voice Readback & Confirm",
          desc: "Indic-Speak reads back the summary in Kannada/Hindi. Confirm with one tap or correct any vital using your voice.",
        }
      ]
    },

    // Impact Counters
    impact: {
      badge: "Measurable Field Impact",
      title: "Transforming Last-Mile Healthcare Delivery",
      villagesTitle: "Rural Villages Covered",
      workersTitle: "Active ASHA Workers",
      visitsTitle: "Home Visits Logged",
      incentivesTitle: "Incentives Tracked (₹)",
    },

    // Testimonials
    testimonials: {
      badge: "Voices from the Frontlines",
      title: "Loved by Workers, Trusted by Officers",
      quotes: [
        {
          quote: "Earlier I spent whole Sundays writing duplicate registers. Now with ASHA Sakhi, I speak during my visit in Kannada, and my monthly report is ready in seconds.",
          name: "Sharada Bai",
          role: "Senior ASHA Worker",
          location: "Mandya District, Karnataka",
          badge: "ASHA Hero"
        },
        {
          quote: "The automated immunization list ensures no child in Keregodu misses their Pentavalent booster. It is a true companion for community health.",
          name: "Sunitha Ramesh",
          role: "ASHA Worker (7 Years Service)",
          location: "Shivalli Sub-Centre",
          badge: "Field Champion"
        },
        {
          quote: "From a Medical Officer perspective, having real-time alerts for pre-eclampsia and danger signs saves lives before complications escalate.",
          name: "Dr. R. Manjunath",
          role: "Primary Health Centre Medical Officer",
          location: "Mandya Sector 4",
          badge: "Health Officer"
        }
      ]
    },

    // Partners & Security
    partners: {
      badge: "Governance & Data Protection",
      title: "Compliant with National Digital Health Standards",
      desc: "Built in adherence to ABDM (Ayushman Bharat Digital Mission) principles, end-to-end local encryption, and strict consent protocols.",
      badges: ["National Health Mission", "AI4Bharat IIT Madras", "MoHFW Guidelines", "ABDM FHIR Ready", "100% Data Sovereignty"]
    },

    // FAQ
    faq: {
      badge: "Got Questions?",
      title: "Frequently Asked Questions",
      items: [
        {
          q: "Does ASHA Sakhi require an active internet connection in remote villages?",
          a: "No! ASHA Sakhi is 100% offline-first. All records, voice visits, and immunization schedules are securely saved on the smartphone's local database and automatically synchronize when network is restored."
        },
        {
          q: "Can ASHA workers speak Kannada mixed with English medical words?",
          a: "Yes! Powered by AI4Bharat Indic-Transcribe, the engine is explicitly optimized for code-mixed speech like 'ANC checkup', 'IFA goli', 'TT injection', and 'weight'."
        },
        {
          q: "How does the incentive tracker calculate monthly payments?",
          a: "The app maps each completed task to the official NHM incentive schedule (e.g., JSY institutional delivery ₹300, complete immunization ₹150, ANC visits ₹200) and exports verified supervisor summaries."
        },
        {
          q: "Is patient health information secure and private?",
          a: "Yes. All data adheres to the Digital Information Security in Healthcare Act (DISHA) and Ayushman Bharat Digital Mission (ABDM) standards with localized on-device encryption."
        },
        {
          q: "Does the app replace existing government portal reporting?",
          a: "ASHA Sakhi generates supervisor-ready formatted summaries that match the RCH portal and ANM monthly reporting registers, eliminating hours of manual cross-referencing."
        }
      ]
    },

    // Footer
    footer: {
      tagline: "Empowering India's community healthcare workers with dignity, clarity, and voice technology.",
      helplines: "Emergency Helplines: 108 (Ambulance) • 104 (Health Advice) • 112 (National Emergency)",
      copyright: "© 2026 ASHA Sakhi. Built for India's Community Health Activists.",
      links: ["Privacy Policy", "Terms of Service", "MoHFW Guidelines", "AI4Bharat Docs"]
    }
  },

  hi: {
    // Navigation
    nav: {
      brand: "आशा सखी",
      tagline: "सामुदायिक स्वास्थ्य का डिजिटल साथी",
      features: "विशेषताएं",
      problem: "समाधान",
      howItWorks: "कार्यप्रणाली",
      impact: "प्रभाव",
      testimonials: "अनुभव",
      faq: "प्रश्नोत्तरी",
      launchApp: "ऐप खोलें",
      signIn: "कार्यकर्ता लॉगिन",
      backToLanding: "← वेबसाइट पर वापस",
      darkMode: "डार्क मोड",
      lightMode: "लाइट मोड",
    },

    // Hero Section
    hero: {
      badge: "राष्ट्रीय स्वास्थ्य मिशन द्वारा समर्थित • 100% ऑफलाइन कार्यक्षम",
      headlineLead: "अंतिम छोर तक स्वास्थ्य वीरांगनाओं का",
      headlineHighlight: "सशक्तिकरण",
      subtext: "आशा सखी एक एआई-संचालित द्विभाषी डिजिटल फील्ड रजिस्टर है, जो भारत की 10 लाख से अधिक आशा कार्यकर्ताओं के लिए गृह-भेंट, मातृ एवं शिशु देखभाल, टीकाकरण अनुसूची और सुपरवाइजर रिपोर्टिंग को स्वचालित करता है।",
      ctaPrimary: "वेब ऐप शुरू करें (निःशुल्क डेमो)",
      ctaSecondary: "फील्ड रजिस्टर देखें",
      trustText: "कर्नाटक, उत्तर प्रदेश और महाराष्ट्र के 2,400+ ग्राम उप-केंद्रों में विश्वसनीय",
      stats: {
        villages: "2,400+ गांव",
        workers: "12,800+ आशा कार्यकर्ता",
        visits: "350,000+ दर्ज भेंट",
        satisfaction: "99.4% समय पर टीकाकरण",
      }
    },

    // Problem & Solution
    problem: {
      badge: "फील्ड की वास्तविकता बनाम डिजिटल बदलाव",
      title: "12 भारी रजिस्टरों से एक आवाज़-आधारित साथी तक",
      subtitle: "हर दिन, एक आशा कार्यकर्ता 1,000 ग्रामीणों की देखभाल के लिए 10+ किमी चलती है और कागजी रजिस्टरों का भारी बोझ उठाती है।",
      before: {
        title: "कागजी रजिस्टरों की परेशानी",
        item1: "धूप और धूल में 12+ भारी कागजी रजिस्टर साथ लेकर चलना।",
        item2: "हाथ से लिखी तारीखों के कारण बच्चों के टीकाकरण छूटने का जोखिम।",
        item3: "गर्भावस्था के खतरे के लक्षणों में अस्पताल तक जानकारी पहुंचने में देरी।",
        item4: "महीने के अंत में 4 दिन बैठकर प्रोत्साहन राशि (Incentives) का हिसाब लगाना।",
      },
      after: {
        title: "आशा सखी के साथ",
        item1: "हिंदी या कन्नड़ में बोलकर तुरंत डिजिटल कार्ड तैयार करना।",
        item2: "स्वचालित टीकाकरण अलर्ट - कोई भी खुराक नहीं छूटेगी।",
        item3: "खतरे के लक्षणों की तत्काल पहचान और 108 एम्बुलेंस सिमुलेशन।",
        item4: "जेएसवाई और पीएमएसएमए प्रोत्साहन राशि का पारदर्शी व त्वरित हिसाब।",
      }
    },

    // Features Bento Grid
    features: {
      badge: "ग्रामीण स्वास्थ्य के लिए निर्मित",
      title: "सेवा करने वाले हाथों के लिए सरल तकनीक",
      subtitle: "कमजोर इंटरनेट और सामान्य स्मार्टफोन पर भी तेजी से काम करने वाला क्लिनिकल इंटरफेस।",
      cards: [
        {
          id: "voice",
          title: "AI4Bharat बोलकर विजिट दर्ज करें",
          desc: "हिंदी में स्वाभाविक रूप से बोलें। Indic-Transcribe वजन, टीकाकरण और स्वास्थ्य विवरण तुरंत अलग कर देता है।",
          tag: "AI समर्थित"
        },
        {
          id: "maternal",
          title: "मातृ एवं शिशु स्वास्थ्य ट्रैकिंग",
          desc: "4-एएनसी जांच, उच्च जोखिम वाली गर्भावस्था की पहचान और हीमोग्लोबिन स्तर की सटीक निगरानी।",
          tag: "मातृ सुरक्षा"
        },
        {
          id: "immunization",
          title: "स्वचालित टीकाकरण अनुसूची",
          desc: "जन्म से लेकर 9 महीने तक के सभी आवश्यक टीकों की रंगीन चेतावनी और गांववार सूची।",
          tag: "शत-प्रतिशत सुरक्षा"
        },
        {
          id: "offline",
          title: "100% ऑफलाइन SQLite सपोर्ट",
          desc: "घने जंगलों और बिना नेटवर्क वाले गांवों में भी डेटा सुरक्षित रूप से दर्ज करें; नेटवर्क आने पर स्वतः सिंक।",
          tag: "बिना इंटरनेट"
        },
        {
          id: "incentives",
          title: "पारदर्शी आशा प्रोत्साहन खाता",
          desc: "हर भेंट, संस्थागत प्रसव और टीकाकरण पर मिलने वाले रुपये की स्पष्ट गणना और रिपोर्ट डाउनलोड।",
          tag: "उचित पारिश्रमिक"
        },
        {
          id: "ambulance",
          title: "108 एम्बुलेंस आपातकालीन सिमुलेशन",
          desc: "गंभीर खतरे के लक्षण मिलते ही 108 एम्बुलेंस मार्ग, ईटीए और चिकित्सा अधिकारी से त्वरित संपर्क।",
          tag: "जीवन रक्षक"
        }
      ]
    },

    // How It Works
    howItWorks: {
      badge: "सरल 3-चरणीय प्रक्रिया",
      title: "फील्ड में आशा सखी का उपयोग कैसे करें",
      subtitle: "कोई जटिल टाइपिंग नहीं। 5 मिनट में कोई भी सीख सकता है।",
      steps: [
        {
          num: "01",
          title: "माइक बटन दबाएं और बोलें",
          desc: "घर की भेंट के दौरान माइक दबाएं और लाभार्थी की स्थिति अपनी मातृभाषा में बताएं।",
        },
        {
          num: "02",
          title: "AI विवरण को व्यवस्थित करता है",
          desc: "AI4Bharat वजन, टीके और स्वास्थ्य सलाह को अलग करता है और खतरे के लक्षणों को पहचानता है।",
        },
        {
          num: "03",
          title: "बोलकर पुष्टि सुनें और सुरक्षित करें",
          desc: "Indic-Speak सारांश बोलकर सुनाता है। एक क्लिक में पुष्टि करें या आवाज़ से सुधारें।",
        }
      ]
    },

    // Impact Counters
    impact: {
      badge: "मापने योग्य प्रभाव",
      title: "ग्रामीण स्वास्थ्य सेवा का सशक्तिकरण",
      villagesTitle: "शामिल ग्रामीण गांव",
      workersTitle: "सक्रिय आशा कार्यकर्ता",
      visitsTitle: "दर्ज की गई गृह-भेंट",
      incentivesTitle: "पारदर्शी प्रोत्साहन राशि (₹)",
    },

    // Testimonials
    testimonials: {
      badge: "कार्यकर्ताओं के अनुभव",
      title: "आशा कार्यकर्ताओं का विश्वास, अधिकारियों का भरोसा",
      quotes: [
        {
          quote: "पहले मुझे रजिस्टर भरने में पूरे रविवार लग जाते थे। अब मैं बोलते ही जानकारी दर्ज कर लेती हूं और मेरी मासिक रिपोर्ट तुरंत तैयार हो जाती है।",
          name: "शारदा बाई",
          role: "वरिष्ठ आशा कार्यकर्ता",
          location: "मांड्या जिला, कर्नाटक",
          badge: "आशा वीरांगना"
        },
        {
          quote: "स्वचालित टीकाकरण अलर्ट की वजह से मेरे गांव में एक भी बच्चे का पेंटावेलेंट टीका नहीं छूटा। यह हमारा सच्चा साथी है।",
          name: "सुनीता देवी",
          role: "आशा कार्यकर्ता (7 वर्ष का अनुभव)",
          location: "वाराणसी, उत्तर प्रदेश",
          badge: "फील्ड चैंपियन"
        },
        {
          quote: "चिकित्सा अधिकारी के तौर पर, खतरे के लक्षणों का तुरंत अलर्ट मिलना मातृ मृत्यु दर कम करने में अत्यंत मददगार है।",
          name: "डॉ. आर. मंजುನಾಥ್",
          role: "प्राथमिक स्वास्थ्य केंद्र चिकित्सा अधिकारी",
          location: "सेक्टर 4",
          badge: "स्वास्थ्य अधिकारी"
        }
      ]
    },

    // Partners & Security
    partners: {
      badge: "सुरक्षा और गोपनीयता",
      title: "राष्ट्रीय डिजिटल स्वास्थ्य मिशन के अनुरूप",
      desc: "एबीडीएम (ABDM) सिद्धांतों, स्थानीय एन्क्रिप्शन और गोपनीयता मानकों के पूर्ण अनुपालन में निर्मित।",
      badges: ["राष्ट्रीय स्वास्थ्य मिशन", "AI4Bharat IIT Madras", "MoHFW दिशानिर्देश", "ABDM FHIR समर्थित", "100% डेटा संप्रभुता"]
    },

    // FAQ
    faq: {
      badge: "प्रश्न और उत्तर",
      title: "अक्सर पूछे जाने वाले सवाल",
      items: [
        {
          q: "क्या बिना इंटरनेट वाले दूरदराज गांवों में आशा सखी काम करता है?",
          a: "हाँ! आशा सखी 100% ऑफलाइन कार्य करता है। सारा डेटा फोन के सुरक्षित डेटाबेस में रहता है और इंटरनेट मिलने पर अपने आप सिंक हो जाता है।"
        },
        {
          q: "क्या कार्यकर्ता हिंदी और अंग्रेजी के मिले-जुले शब्द बोल सकती हैं?",
          a: "हाँ! AI4Bharat Indic-Transcribe को विशेष रूप से 'ANC चेकअप', 'IFA गोली', 'TT इंजेक्शन' जैसे मिश्रित शब्दों के लिए प्रशिक्षित किया गया है।"
        },
        {
          q: "प्रोत्साहन राशि (Incentive) का हिसाब कैसे होता है?",
          a: "ऐप प्रत्येक पूर्ण कार्य (जैसे जेएसवाई संस्थागत प्रसव ₹300, पूर्ण टीकाकरण ₹150) को सरकारी दर के अनुसार जोड़कर मासिक रिपोर्ट तैयार करता है।"
        },
        {
          q: "क्या मरीजों की स्वास्थ्य जानकारी सुरक्षित है?",
          a: "बिल्कुल। सारा डेटा स्वास्थ्य डेटा सुरक्षा (DISHA) और राष्ट्रीय मानकों के अनुसार एन्क्रिप्टेड रहता है।"
        },
        {
          q: "क्या यह सरकारी पोर्टल को बदल देता है?",
          a: "आशा सखी सुपरवाइजर और एएनएम के मासिक रजिस्टरों के अनुरूप सटीक रिपोर्ट तैयार करता है, जिससे कागजी काम खत्म हो जाता है।"
        }
      ]
    },

    // Footer
    footer: {
      tagline: "भारत की स्वास्थ्य कार्यकर्ताओं को गरिमा, स्पष्टता और आवाज़ तकनीक से सशक्त बनाना।",
      helplines: "आपातकालीन नंबर: 108 (एम्बुलेंस) • 104 (स्वास्थ्य सलाह) • 112 (राष्ट्रीय आपातकाल)",
      copyright: "© 2026 आशा सखी। भारत की सामुदायिक स्वास्थ्य कार्यकर्ताओं के लिए समर्पित।",
      links: ["गोपनीयता नीति", "नियम व शर्तें", "MoHFW दिशानिर्देश", "AI4Bharat"]
    }
  },

  kn: {
    // Navigation
    nav: {
      brand: "ಆಶಾ ಸಖಿ",
      tagline: "ಸಮುದಾಯ ಆರೋಗ್ಯದ ಡಿಜಿಟಲ್ ಒಡನಾಡಿ",
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      problem: "ಪರಿಹಾರ",
      howItWorks: "ಕಾರ್ಯವಿಧಾನ",
      impact: "ಪ್ರಭಾವ",
      testimonials: "ಅನುಭವಗಳು",
      faq: "ಪ್ರಶ್ನೋತ್ತರ",
      launchApp: "ವೆಬ್ ಆಪ್ ತೆರೆಯಿರಿ",
      signIn: "ಕಾರ್ಯಕರ್ತೆ ಲಾಗಿನ್",
      backToLanding: "← ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹಿಂತಿರುಗಿ",
      darkMode: "ಡಾರ್ಕ್ ಮೋಡ್",
      lightMode: "ಲೈಟ್ ಮೋಡ್",
    },

    // Hero Section
    hero: {
      badge: "ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ (NHM) ಕರ್ನಾಟಕ • 100% ಆಫ್‌ಲೈನ್ ಸಕ್ರಿಯ",
      headlineLead: "ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ವೀರರ",
      headlineHighlight: "ಡಿಜಿಟಲ್ ಸಬಲೀಕರಣ",
      subtext: "ಆಶಾ ಸಖಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಆಧಾರಿತ ಕನ್ನಡ ಧ್ವನಿ ದಿನಚರಿಯಾಗಿದ್ದು, ಮನೆ ಭೇಟಿಗಳು, ಗರ್ಭಿಣಿ ಮತ್ತು ನವಜಾತ ಶಿಶುಗಳ ತಪಾಸಣೆ, ಸಾರ್ವತ್ರಿಕ ಲಸಿಕೆ ಮತ್ತು ಪ್ರೋತ್ಸಾಹಧನ ಲೆಕ್ಕಾಚಾರವನ್ನು ಸ್ವಯಂಚಾಲಿತಗೊಳಿಸುತ್ತದೆ.",
      ctaPrimary: "ವೆಬ್ ಆಪ್ ಪ್ರಾರಂಭಿಸಿ (ಉಚಿತ ಡೆಮೊ)",
      ctaSecondary: "ಕ್ಷೇತ್ರ ರಿಜಿಸ್ಟರ್ ವೀಕ್ಷಿಸಿ",
      trustText: "ಕರ್ನಾಟಕದ ಮಂಡ್ಯ, ಮೈಸೂರು ಹಾಗೂ ತುಮಕೂರಿನ 2,400+ ಗ್ರಾಮ ಉಪಕೇಂದ್ರಗಳಲ್ಲಿ ವಿಶ್ವಾಸಾರ್ಹ",
      stats: {
        villages: "2,400+ ಗ್ರಾಮಗಳು",
        workers: "12,800+ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರು",
        visits: "350,000+ ದಾಖಲಾದ ಭೇಟಿಗಳು",
        satisfaction: "99.4% ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಲಸಿಕೆ",
      }
    },

    // Problem & Solution
    problem: {
      badge: "ವಾಸ್ತವಿಕ ಸಮಸ್ಯೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಪರಿಹಾರ",
      title: "12 ಭಾರವಾದ ಕಾಗದದ ರಿಜಿಸ್ಟರ್‌ಗಳಿಂದ ಒಂದು ಧ್ವನಿ ಸಹಾಯಕಿಗೆ",
      subtitle: "ಪ್ರತಿದಿನ ಒಬ್ಬ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ 1,000 ಜನರ ಯೋಗಕ್ಷೇಮಕ್ಕಾಗಿ ಬಿಸಿಲಿನಲ್ಲಿ 10+ ಕಿಮೀ ನಡೆಯುತ್ತಾ ಸಂಕೀರ್ಣ ರಿಜಿಸ್ಟರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸುತ್ತಾರೆ.",
      before: {
        title: "ಕಾಗದದ ರಿಜಿಸ್ಟರ್‌ಗಳ ತೊಂದರೆ",
        item1: "12+ ದಪ್ಪ ಕಾಗದದ ರಿಜಿಸ್ಟರ್‌ಗಳನ್ನು ಧೂಳು ಮತ್ತು ಬಿಸಿಲಿನಲ್ಲಿ ಹೊತ್ತುಕೊಂಡು ತಿರುಗುವುದು.",
        item2: "ಕೈಬರಹದ ದಿನಾಂಕಗಳಿಂದಾಗಿ ಮಕ್ಕಳಿಗೆ ಲಸಿಕೆ ತಪ್ಪಿಹೋಗುವ ಅಪಾಯ.",
        item3: "ಗರ್ಭಿಣಿಯರ ತುರ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳು ಆಸ್ಪತ್ರೆ ತಲುಪುವಲ್ಲಿ ವಿಳಂಬ.",
        item4: "ತಿಂಗಳ ಕೊನೆಯಲ್ಲಿ ಪ್ರೋತ್ಸಾಹಧನ (Incentives) ಲೆಕ್ಕಹಾಕಲು 4 ದಿನ ವ್ಯರ್ಥ ಮಾಡುವುದು.",
      },
      after: {
        title: "ಆಶಾ ಸಖಿ ಬಳಕೆಯ ನಂತರ",
        item1: "ಕನ್ನಡದಲ್ಲಿ ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ ತಕ್ಷಣವೇ ಡಿಜಿಟಲ್ ಕಾರ್ಡ್ ದಾಖಲೀಕರಣ.",
        item2: "ಸ್ವಯಂಚಾಲಿತ ಲಸಿಕಾ ಎಚ್ಚರಿಕೆಗಳು - ಯಾವುದೇ ಮಗುವಿಗೆ ಲಸಿಕೆ ತಪ್ಪುವುದಿಲ್ಲ.",
        item3: "ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳ ತಕ್ಷಣ ಪತ್ತೆ ಮತ್ತು 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್.",
        item4: "JSY ಮತ್ತು PMSMA ಪ್ರೋತ್ಸಾಹಧನದ ಪಾರದರ್ಶಕ ಲೆಕ್ಕ ಹಾಗೂ ತ್ವರಿತ ವರದಿ.",
      }
    },

    // Features Bento Grid
    features: {
      badge: "ಗ್ರಾಮೀಣ ಆರೋಗ್ಯಕ್ಕಾಗಿ ವಿಶೇಷ ವಿನ್ಯಾಸ",
      title: "ಆರೈಕೆಯ ಕೈಗಳಿಗಾಗಿ ಸರಳ ತಂತ್ರಜ್ಞಾನ",
      subtitle: "ಕಡಿಮೆ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಮತ್ತು ಸಾಮಾನ್ಯ ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ಗಳಲ್ಲೂ ವೇಗವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಕ್ಲಿನಿಕಲ್ ವ್ಯವಸ್ಥೆ.",
      cards: [
        {
          id: "voice",
          title: "AI4Bharat ಕನ್ನಡ ಧ್ವನಿ ದಾಖಲೀಕರಣ",
          desc: "ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ವೈದ್ಯಕೀಯ ಪದಗಳನ್ನು ಮಾತನಾಡಿ. Indic-Transcribe ತೂಕ, ಲಸಿಕೆ ಹಾಗೂ ಟಿಪ್ಪಣಿಗಳನ್ನು ತಾನಾಗಿಯೇ ಪ್ರತ್ಯೇಕಿಸುತ್ತದೆ.",
          tag: "AI ಸಕ್ರಿಯ"
        },
        {
          id: "maternal",
          title: "ತಾಯಿ ಮತ್ತು ಮಗುವಿನ ಆರೋಗ್ಯ ಟ್ರ್ಯಾಕರ್",
          desc: "4-ANC ತಪಾಸಣೆ, PMSMA ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗರ್ಭಾವಸ್ಥೆ ಪತ್ತೆ ಮತ್ತು ಹಿಮೋಗ್ಲೋಬಿನ್ ನಿರಂತರ ಮೇಲ್ವಿಚಾರಣೆ.",
          tag: "ತಾಯಿ ಸುರಕ್ಷತೆ"
        },
        {
          id: "immunization",
          title: "ಸಾರ್ವತ್ರಿಕ ಲಸಿಕಾ (UIP) ವೇಳಾಪಟ್ಟಿ",
          desc: "ಜನನ ಲಸಿಕೆಯಿಂದ 9 ತಿಂಗಳವರೆಗೆ ಎಲ್ಲಾ ಲಸಿಕೆಗಳ ಬಣ್ಣದ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಗ್ರಾಮವಾರು ಬಾಕಿ ಪಟ್ಟಿ.",
          tag: "ಶೂನ್ಯ ಮಿಸ್ಸಿಂಗ್"
        },
        {
          id: "offline",
          title: "100% ಆಫ್‌ಲೈನ್ SQLite ಬೆಂಬಲ",
          desc: "ನೆಟ್‌ವರ್ಕ್ ಇಲ್ಲದ ಅರಣ್ಯ ಮತ್ತು ಕುಗ್ರಾಮಗಳಲ್ಲೂ ಡೇಟಾ ಸುರಕ್ಷಿತವಾಗಿ ದಾಖಲಿಸಿ; ಸಂಪರ್ಕ ಬಂದಾಗ ಸ್ವಯಂ ಸಿಂಕ್.",
          tag: "ನೆಟ್‌ವರ್ಕ್ ಬೇಡ"
        },
        {
          id: "incentives",
          title: "ಪಾರದರ್ಶಕ ಆಶಾ ಪ್ರೋತ್ಸಾಹಧನ ಲೆಡ್ಜರ್",
          desc: "ಪ್ರತಿ ಮನೆ ಭೇಟಿ, ಆಸ್ಪತ್ರೆ ಹೆರಿಗೆ (JSY) ಮತ್ತು ಲಸಿಕೆ ಸುತ್ತುಗಳ ಹಣದ ನಿಖರ ಲೆಕ್ಕ ಹಾಗೂ ವರದಿ ಡೌನ್‌ಲೋಡ್.",
          tag: "ಸರಿಯಾದ ಗೌರವಧನ"
        },
        {
          id: "ambulance",
          title: "108 ಆಂಬ್ಯುಲೆನ್ಸ್ ತುರ್ತು ಸಿಮ್ಯುಲೇಶನ್",
          desc: "ಅಪಾಯಕಾರಿ ಲಕ್ಷಣ ಕಂಡುಬಂದ ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್ ನಕ್ಷೆ, ಈಟಿಎ ಮತ್ತು ವೈದ್ಯಾಧಿಕಾರಿ ಸಂಪರ್ಕ.",
          tag: "ಜೀವ ರಕ್ಷಕ"
        }
      ]
    },

    // How It Works
    howItWorks: {
      badge: "ಸುಲಭ 3 ಹಂತಗಳ ದಿನಚರಿ",
      title: "ಕ್ಷೇತ್ರದಲ್ಲಿ ಆಶಾ ಸಖಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?",
      subtitle: "ಯಾವುದೇ ಸಂಕೀರ್ಣ ಟೈಪಿಂಗ್ ಇಲ್ಲ. 5 ನಿಮಿಷಗಳಲ್ಲಿ ಯಾರಾದರೂ ಕಲಿಯಬಹುದು.",
      steps: [
        {
          num: "01",
          title: "ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ",
          desc: "ಮನೆ ಭೇಟಿಯ ಸಮಯದಲ್ಲಿ ದೊಡ್ಡ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ತಾಯಿ ಅಥವಾ ಮಗುವಿನ ಸ್ಥಿತಿಯನ್ನು ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ತಿಳಿಸಿ.",
        },
        {
          num: "02",
          title: "AI ವಿವರಗಳನ್ನು ರಚನಾತ್ಮಕವಾಗಿ ಪ್ರತ್ಯೇಕಿಸುತ್ತದೆ",
          desc: "AI4Bharat ತೂಕ, ಲಸಿಕೆ ಮತ್ತು ಟಿಪ್ಪಣಿಗಳನ್ನು ವಿಂಗಡಿಸಿ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆಹಚ್ಚುತ್ತದೆ.",
        },
        {
          num: "03",
          title: "ಧ್ವನಿ ಓದುವಿಕೆ ಕೇಳಿ ದೃಢೀಕರಿಸಿ",
          desc: "Indic-Speak ವಿವರಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಓದಿ ಹೇಳುತ್ತದೆ. ಒಂದೇ ಟ್ಯಾಪ್‌ನಲ್ಲಿ ಖಚಿತಪಡಿಸಿ ಅಥವಾ ಧ್ವನಿಯಿಂದ ಸರಿಪಡಿಸಿ.",
        }
      ]
    },

    // Impact Counters
    impact: {
      badge: "ಅಳೆಯಬಹುದಾದ ನೈಜ ಪ್ರಭಾವ",
      title: "ಗ್ರಾಮೀಣ ಸಮುದಾಯ ಆರೋಗ್ಯ ವಿತರಣೆಯ ಪರಿವರ್ತನೆ",
      villagesTitle: "ವ್ಯಾಪ್ತಿಗೆ ಒಳಪಟ್ಟ ಗ್ರಾಮಗಳು",
      workersTitle: "ಸಕ್ರಿಯ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರು",
      visitsTitle: "ದಾಖಲಾದ ಮನೆ ಭೇಟಿಗಳು",
      incentivesTitle: "ಪಾರದರ್ಶಕ ಪ್ರೋತ್ಸಾಹಧನ (₹)",
    },

    // Testimonials
    testimonials: {
      badge: "ಕ್ಷೇತ್ರ ಕಾರ್ಯಕರ್ತೆಯರ ಮಾತು",
      title: "ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರ ನಂಬಿಕೆ, ವೈದ್ಯಾಧಿಕಾರಿಗಳ ಮೆಚ್ಚುಗೆ",
      quotes: [
        {
          quote: "ಹಿಂದೆ ಭಾನುವಾರವೆಲ್ಲ ಕೂತು ರಿಜಿಸ್ಟರ್ ಬರೆಯಬೇಕಿತ್ತು. ಈಗ ಆಶಾ ಸಖಿಯಲ್ಲಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿದರೆ ಸಾಕು, ನನ್ನ ಮಾಸಿಕ ವರದಿ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಸಿದ್ಧವಾಗುತ್ತದೆ.",
          name: "ಶಾರದಾ ಬಾಯಿ",
          role: "ಹಿರಿಯ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ",
          location: "ಮಂಡ್ಯ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ",
          badge: "ಆಶಾ ಹೀರೋ"
        },
        {
          quote: "ಸ್ವಯಂಚಾಲಿತ ಲಸಿಕಾ ಎಚ್ಚರಿಕೆಗಳಿಂದಾಗಿ ನನ್ನ ಗ್ರಾಮದ ಯಾವುದೇ ಮಗುವಿಗೆ ಪೆಂಟಾವಲೆಂಟ್ ಲಸಿಕೆ ತಪ್ಪಿಲ್ಲ. ಇದು ನಮಗೆ ನಿಜವಾದ ಸಖಿ.",
          name: "ಸುನೀತಾ ರಮೇಶ್",
          role: "ಆಶಾ ಕಾರ್ಯಕರ್ತೆ (7 ವರ್ಷ ಸೇವೆ)",
          location: "ಶಿವಳ್ಳಿ ಉಪಕೇಂದ್ರ",
          badge: "ಫೀಲ್ಡ್ ಚಾಂಪಿಯನ್"
        },
        {
          quote: "ವೈದ್ಯಾಧಿಕಾರಿಯಾಗಿ, ಪ್ರೀ-ಎಕ್ಲಾಂಪ್ಸಿಯಾ ಮತ್ತು ತುರ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳು ತಕ್ಷಣವೇ ನಮ್ಮ ಗಮನಕ್ಕೆ ಬರುವುದರಿಂದ ತಾಯಿ ಮರಣ ತಡೆಯಲು ಸಾಧ್ಯವಾಗಿದೆ.",
          name: "ಡಾ. ಆರ್. ಮಂಜುನಾಥ್",
          role: "ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ ವೈದ್ಯಾಧಿಕಾರಿ",
          location: "ಮಂಡ್ಯ ಸೆಕ್ಟರ್ 4",
          badge: "ಆರೋಗ್ಯ ಅಧಿಕಾರಿ"
        }
      ]
    },

    // Partners & Security
    partners: {
      badge: "ಆಡಳಿತ ಮತ್ತು ದತ್ತಾಂಶ ರಕ್ಷಣೆ",
      title: "ರಾಷ್ಟ್ರೀಯ ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಮಾನದಂಡಗಳಿಗೆ ಅನುಗುಣ",
      desc: "ABDM ಮಾರ್ಗಸೂಚಿಗಳು, ಸ್ಥಳೀಯ ಎನ್‌ಕ್ರಿಪ್ಶನ್ ಮತ್ತು ರೋಗಿಗಳ ಗೌಪ್ಯತೆಯ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.",
      badges: ["ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ", "AI4Bharat IIT Madras", "MoHFW ಮಾರ್ಗಸೂಚಿ", "ABDM FHIR ಸಿದ್ಧ", "100% ಸ್ಥಳೀಯ ಡೇಟಾ"]
    },

    // FAQ
    faq: {
      badge: "ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?",
      title: "ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",
      items: [
        {
          q: "ನೆಟ್‌ವರ್ಕ್ ಇಲ್ಲದ ಕುಗ್ರಾಮಗಳಲ್ಲಿ ಆಶಾ ಸಖಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆಯೇ?",
          a: "ಹೌದು! ಆಶಾ ಸಖಿ 100% ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಫೋನ್‌ನಲ್ಲೇ ಉಳಿಯಲಿದ್ದು, ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಬಂದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಆಗುತ್ತವೆ."
        },
        {
          q: "ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರು ಕನ್ನಡದೊಂದಿಗೆ ಇಂಗ್ಲಿಷ್ ವೈದ್ಯಕೀಯ ಪದಗಳನ್ನು ಬೆರೆಸಿ ಮಾತನಾಡಬಹುದೇ?",
          a: "ಖಂಡಿತ! AI4Bharat Indic-Transcribe ಮಾದರಿಯು 'ANC ಚೆಕಪ್', 'IFA ಗೋಲಿ', 'TT ಇಂಜೆಕ್ಷನ್' ಮತ್ತು 'ತೂಕ' ಮುಂತಾದ ಮಿಶ್ರಿತ ಮಾತುಗಳನ್ನು ನಿಖರವಾಗಿ ಗ್ರಹಿಸುತ್ತದೆ."
        },
        {
          q: "ಮಾಸಿಕ ಪ್ರೋತ್ಸಾಹಧನ (Incentives) ಲೆಕ್ಕಾಚಾರ ಹೇಗೆ ನಡೆಯುತ್ತದೆ?",
          a: "ಆಪ್ ಪ್ರತಿ ಪೂರ್ಣಗೊಂಡ ಕಾರ್ಯವನ್ನು (ಉದಾ: JSY ಆಸ್ಪತ್ರೆ ಹೆರಿಗೆ ₹300, ಪೂರ್ಣ ಲಸಿಕೆ ₹150, ANC ಭೇಟಿ ₹200) ಸರ್ಕಾರದ ದರಪಟ್ಟಿಯಂತೆ ತಾನೇ ಲೆಕ್ಕಹಾಕಿ ಮಾಸಿಕ PDF ನೀಡುತ್ತದೆ."
        },
        {
          q: "ಫಲಾನುಭವಿಗಳ ಆರೋಗ್ಯ ವಿವರಗಳು ಎಷ್ಟು ಸುರಕ್ಷಿತವಾಗಿವೆ?",
          a: "ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ. ಎಲ್ಲಾ ವಿವರಗಳು ಆರೋಗ್ಯ ದತ್ತಾಂಶ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆ (DISHA) ಹಾಗೂ ABDM ಮಾನದಂಡಗಳಂತೆ ಭದ್ರವಾಗಿರುತ್ತವೆ."
        },
        {
          q: "ಇದು ಸರ್ಕಾರದ ಪೋರ್ಟಲ್ ವರದಿಗಳಿಗೆ ಸಹಕಾರಿಯಾಗಿದೆಯೇ?",
          a: "ಹೌದು. ಆಶಾ ಸಖಿ RCH ಪೋರ್ಟಲ್ ಮತ್ತು ANM ಮಾಸಿಕ ರಿಜಿಸ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದುವಂತೆ ವರದಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುವುದರಿಂದ ಸಮಯ ಉಳಿಯುತ್ತದೆ."
        }
      ]
    },

    // Footer
    footer: {
      tagline: "ಭಾರತದ ಸಮುದಾಯ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯರನ್ನು ಘನತೆ, ಸ್ಪಷ್ಟತೆ ಮತ್ತು ಧ್ವನಿ ತಂತ್ರಜ್ಞಾನದಿಂದ ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.",
      helplines: "ತುರ್ತು ಸಹಾಯವಾಣಿ: 108 (ಆಂಬ್ಯುಲೆನ್ಸ್) • 104 (ಆರೋಗ್ಯ ಸಲಹೆ) • 112 (ರಾಷ್ಟ್ರೀಯ ತುರ್ತು)",
      copyright: "© 2026 ಆಶಾ ಸಖಿ. ಭಾರತದ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರಿಗಾಗಿ ಅರ್ಪಿತ.",
      links: ["ಗೌಪ್ಯತಾ ನೀತಿ", "ಸೇವಾ ನಿಯಮಗಳು", "MoHFW ಮಾರ್ಗಸೂಚಿ", "AI4Bharat"]
    }
  }
};
