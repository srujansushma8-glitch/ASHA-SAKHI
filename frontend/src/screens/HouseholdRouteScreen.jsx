import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Mic, 
  TrendingUp, 
  Users, 
  Baby, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Compass,
  Footprints
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HouseholdRouteScreen({ onStartVoiceVisit, onBack }) {
  const { t, currentLanguage } = useLanguage();
  const [selectedWaypoint, setSelectedWaypoint] = useState(1);
  const [routeMode, setRouteMode] = useState('optimized'); // 'optimized' or 'shortest'
  const [visitedStops, setVisitedStops] = useState([0]); // PHC depot is visited
  const [filterType, setFilterType] = useState('all');

  const waypoints = [
    {
      id: 0,
      name_en: 'Mandya Primary Health Centre (PHC)',
      name_kn: 'ಮಂಡ್ಯ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC)',
      name_hi: 'मांड्या प्राथमिक स्वास्थ्य केंद्र (PHC)',
      role_en: 'Starting Depot',
      role_kn: 'ಆರಂಭಿಕ ಕೇಂದ್ರ',
      role_hi: 'प्रारंभिक केंद्र',
      lat: 12.5240,
      lng: 76.8980,
      distanceFromPrev: '0 km',
      walkTime: '0 min',
      address_en: 'Main Road, Shivalli',
      address_kn: 'ಮುಖ್ಯ ರಸ್ತೆ, ಶಿವಳ್ಳಿ',
      address_hi: 'मुख्य मार्ग, शिवल्ली',
      description_en: 'Medicine kit, BP monitor, and weighing scale collected.',
      description_kn: 'ಔಷಧಿ ಕಿಟ್, ಬಿಪಿ ಮಾನಿಟರ್, ತೂಕ ಯಂತ್ರ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.',
      description_hi: 'दवा किट, बीपी मॉनिटर और वजन मशीन एकत्र की गई।',
      type: 'depot',
      isCompleted: true
    },
    {
      id: 1,
      name_en: 'Meenakshi',
      name_kn: 'ಮೀನಾಕ್ಷಿ',
      name_hi: 'मीनाक्षी',
      beneficiaryId: 'ASHA-KA-2024-0102',
      priority_en: 'Critical High Risk',
      priority_kn: 'ಅತ್ಯಂತ ತುರ್ತು',
      priority_hi: 'अति गंभीर जोखिम',
      lat: 12.5360,
      lng: 76.9030,
      distanceFromPrev: '1.2 km',
      walkTime: '15 min',
      address_en: 'House #28, Lake View Street, Shivalli',
      address_kn: 'ಮನೆ ನಂ 28, ಕೆರೆ ಅಂಚು ಬೀದಿ, ಶಿವಳ್ಳಿ',
      address_hi: 'मकान नं 28, झील किनारा मार्ग, शिवल्ली',
      clinicalNote_en: 'Severe anemia (Hb 7.8 g/dL), high headache and edema. Gestation 32 weeks.',
      clinicalNote_kn: 'ರಕ್ತಹೀನತೆ (Hb 7.8 g/dL), ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಮುಖದಲ್ಲಿ ಊತ. ಗರ್ಭಾವಸ್ಥೆ 32 ವಾರ.',
      clinicalNote_hi: 'गंभीर एनीमिया (Hb 7.8), सिरदर्द और सूजन। 32 सप्ताह की गर्भावस्था।',
      type: 'high_risk',
      phone: '+91 98450 11202',
      isCompleted: visitedStops.includes(1)
    },
    {
      id: 2,
      name_en: 'Lakshmi Devi',
      name_kn: 'ಲಕ್ಷ್ಮಿ ದೇವಿ',
      name_hi: 'लक्ष्मी देवी',
      beneficiaryId: 'ASHA-KA-2024-0101',
      priority_en: 'Routine ANC',
      priority_kn: 'ನಿಯಮಿತ ಭೇಟಿ',
      priority_hi: 'नियमित एएनसी',
      lat: 12.5480,
      lng: 76.9110,
      distanceFromPrev: '0.8 km',
      walkTime: '10 min',
      address_en: 'House #14, Temple Road, Shivalli',
      address_kn: 'ಮನೆ ನಂ 14, ಮಾರಮ್ಮ ದೇವಸ್ಥಾನ ರಸ್ತೆ',
      address_hi: 'मकान नं 14, मंदिर मार्ग, शिवल्ली',
      clinicalNote_en: '36 weeks pregnant. Weight check, fetal movement and IFA tablets distribution.',
      clinicalNote_kn: '36 ವಾರಗಳ ಗರ್ಭಿಣಿ. ತೂಕ ಪರೀಕ್ಷೆ, ಭ್ರೂಣದ ಚಲನೆ ಮತ್ತು IFA ಮಾತ್ರೆಗಳ ವಿತರಣೆ.',
      clinicalNote_hi: '36 सप्ताह की गर्भावस्था। वजन जांच और आईएफए वितरण।',
      type: 'anc',
      phone: '+91 94480 33401',
      isCompleted: visitedStops.includes(2)
    },
    {
      id: 3,
      name_en: 'Pooja Suresh & Infant',
      name_kn: 'ಪೂಜಾ ಸುರೇಶ್ ಮತ್ತು ಮಗು',
      name_hi: 'पूजा सुरेश एवं शिशु',
      beneficiaryId: 'ASHA-KA-2024-0103',
      priority_en: 'Vaccination Due',
      priority_kn: 'ಲಸಿಕೆ ಬಾಕಿ',
      priority_hi: 'टीकाकरण देय',
      lat: 12.5620,
      lng: 76.9190,
      distanceFromPrev: '0.9 km',
      walkTime: '12 min',
      address_en: 'House #42, Basaveshwara Layout',
      address_kn: 'ಮನೆ ನಂ 42, ಬಸವೇಶ್ವರ ಬಡಾವಣೆ',
      address_hi: 'मकान नं 42, बसवेश्वर लेआउट',
      clinicalNote_en: 'Infant age 6 weeks. OPV-1, Pentavalent-1 and Rota-1 pending.',
      clinicalNote_kn: 'ಮಗು ವಯಸ್ಸು 6 ವಾರ. OPV-1, Pentavalent-1 ಮತ್ತು Rota-1 ಲಸಿಕೆ ಬಾಕಿ ಇದೆ.',
      clinicalNote_hi: 'शिशु आयु 6 सप्ताह। पेंटावेलेंट-1 और रोटा-1 लंबित।',
      type: 'vaccine',
      phone: '+91 99000 55603',
      isCompleted: visitedStops.includes(3)
    },
    {
      id: 4,
      name_en: 'Soundarya Kumar',
      name_kn: 'ಸೌಂದರ್ಯ ಕುಮಾರ್',
      name_hi: 'सौंदर्या कुमार',
      beneficiaryId: 'ASHA-KA-2024-0104',
      priority_en: 'Postnatal (HBNC)',
      priority_kn: 'ನವಜಾತ ಶಿಶು ಆರೈಕೆ',
      priority_hi: 'प्रसवोत्तर देखभाल',
      lat: 12.5760,
      lng: 76.9240,
      distanceFromPrev: '0.5 km',
      walkTime: '7 min',
      address_en: 'House #53, School Road, Keregodu',
      address_kn: 'ಮನೆ ನಂ 53, ಶಾಲೆ ರಸ್ತೆ, ಕೆರೆಗೋಡು',
      address_hi: 'मकान नं 53, स्कूल रोड, केरेगोडु',
      clinicalNote_en: 'Day 14 postpartum. Breastfeeding and infant cord hygiene verification.',
      clinicalNote_kn: 'ಪ್ರಸವದ 14ನೇ ದಿನ. ತಾಯಿಯ ಎದೆಹಾಲುಣಿಸುವಿಕೆ ಮತ್ತು ಶಿಶುವಿನ ಹೊಕ್ಕಳು ಶುಚಿತ್ವ ಪರೀಕ್ಷೆ.',
      clinicalNote_hi: 'प्रसव के 14 दिन। स्तनपान और शिशु की नाभि स्वच्छता जांच।',
      type: 'pnc',
      phone: '+91 97410 77804',
      isCompleted: visitedStops.includes(4)
    }
  ];

  const getLocalizedName = (w) => {
    if (currentLanguage === 'kn') return w.name_kn || w.name_en;
    if (currentLanguage === 'hi') return w.name_hi || w.name_en;
    return w.name_en;
  };

  const getLocalizedAddress = (w) => {
    if (currentLanguage === 'kn') return w.address_kn || w.address_en;
    if (currentLanguage === 'hi') return w.address_hi || w.address_en;
    return w.address_en;
  };

  const getLocalizedNote = (w) => {
    if (currentLanguage === 'kn') return w.clinicalNote_kn || w.clinicalNote_en;
    if (currentLanguage === 'hi') return w.clinicalNote_hi || w.clinicalNote_en;
    return w.clinicalNote_en;
  };

  const currentStop = waypoints.find(w => w.id === selectedWaypoint) || waypoints[1];

  const toggleVisitStatus = (id) => {
    setVisitedStops(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Top Header */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#F9ECEC] active:scale-[0.98] transition-decelerate"
            title={t("common.back")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight">
                {t("route.title")}
              </h1>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t("route.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-full bg-[#E8F7F1] text-[#477A60] font-bold text-xs border border-[#C8EEDD] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("route.optimizedBadge")}</span>
          </span>
        </div>
      </div>

      {/* 2. Map and Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Stops List (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
          <h3 className="font-bold text-base text-[#3B2A33]">
            {t("route.waypointsTitle")}
          </h3>

          <div className="space-y-3">
            {waypoints.map((w, idx) => {
              const isSelected = selectedWaypoint === w.id;
              const isDone = visitedStops.includes(w.id);
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWaypoint(w.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FDF6F5] border-[#A25B74] shadow-xs'
                      : isDone
                      ? 'bg-[#E8F7F1]/30 border-[#C8EEDD]'
                      : 'bg-white border-[#F0DDE2] hover:bg-[#FDF6F5]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                        isDone
                          ? 'bg-[#477A60] text-white'
                          : isSelected
                          ? 'bg-[#A25B74] text-white'
                          : 'bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]'
                      }`}>
                        {isDone ? '✓' : idx}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#3B2A33] block">
                          {getLocalizedName(w)}
                        </span>
                        <span className="text-xs text-[#7A6670] font-medium block mt-0.5">
                          {getLocalizedAddress(w)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisitStatus(w.id);
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-[#477A60] text-white border-[#477A60]'
                          : 'bg-white text-[#7A6670] border-[#F0DDE2] hover:bg-[#FDF6F5]'
                      }`}
                    >
                      {isDone ? t("common.completed") : t("route.markVisited")}
                    </button>
                  </div>

                  {w.clinicalNote_en && (
                    <div className="mt-2.5 pt-2 border-t border-[#F0DDE2]/60 text-xs text-[#7A6670] font-medium flex items-center justify-between">
                      <span className="line-clamp-1">{getLocalizedNote(w)}</span>
                      <span className="font-mono text-[10px] text-[#A25B74] font-bold ml-2 shrink-0">
                        {w.walkTime}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stop Details (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-5">
          <div className="border-b border-[#F0DDE2] pb-3">
            <span className="text-xs font-bold text-[#A25B74] block uppercase tracking-wider font-mono">
              {t("route.nextStop")}
            </span>
            <h3 className="text-xl font-bold text-[#3B2A33] mt-0.5">
              {getLocalizedName(currentStop)}
            </h3>
            <p className="text-xs text-[#7A6670] mt-1">
              {getLocalizedAddress(currentStop)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
              <span className="text-[11px] text-[#7A6670] block">{t("ambulance.distance")}</span>
              <span className="text-lg font-bold font-mono text-[#3B2A33] mt-0.5 block">{currentStop.distanceFromPrev}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
              <span className="text-[11px] text-[#7A6670] block">{t("ambulance.eta")}</span>
              <span className="text-lg font-bold font-mono text-[#477A60] mt-0.5 block">{currentStop.walkTime}</span>
            </div>
          </div>

          {currentStop.clinicalNote_en && (
            <div className="p-4 rounded-2xl bg-[#FFF9F7] border border-[#F0DDE2] space-y-1.5">
              <span className="text-xs font-bold text-[#A25B74] block">
                {t("structuredRecord.clinicalObservations")}:
              </span>
              <p className="text-xs text-[#3B2A33] leading-relaxed">
                {getLocalizedNote(currentStop)}
              </p>
            </div>
          )}

          {currentStop.beneficiaryId && (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onStartVoiceVisit && onStartVoiceVisit(currentStop.beneficiaryId)}
                className="w-full bg-[#A25B74] hover:bg-[#84455C] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-[#A25B74]/20 flex items-center justify-center space-x-2 text-sm active:scale-95 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>{t("common.startVisit")}</span>
              </button>

              {currentStop.phone && (
                <button
                  onClick={() => window.open(`tel:${currentStop.phone}`, '_self')}
                  className="w-full bg-[#FDF6F5] hover:bg-[#F9ECEC] text-[#3B2A33] font-bold py-2.5 px-4 rounded-xl border border-[#F0DDE2] flex items-center justify-center space-x-2 text-xs transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-[#A25B74]" />
                  <span>{currentStop.phone}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
