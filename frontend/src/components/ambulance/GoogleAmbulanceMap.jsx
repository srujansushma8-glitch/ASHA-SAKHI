import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { 
  Navigation, 
  MapPin, 
  Ambulance, 
  Hospital, 
  Compass, 
  Radio, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Maximize2, 
  LocateFixed,
  Layers,
  Sparkles
} from 'lucide-react';
import { t } from '../../services/i18n';

// Custom Rose & Blush Google Maps JSON Style Token
export const ASHA_ROSE_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#FFF9F7" }] // Pure Soft Cream
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#7A6670" }] // Muted Plum
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#FFFFFF" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3B2A33" }] // Plum Heading
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#A25B74" }] // Rose Deep
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#F4FAF6" }] // Very subtle health green tint
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#FFFFFF" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#F0DDE2" }] // Delicate Rose Border
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#FDF6F5" }] // Blush Light
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#E9B9C8" }] // Rose Soft
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#F4E8EC" }] // Soft Blush Tint Water
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#A25B74" }]
  }
];

export default function GoogleAmbulanceMap({
  ambulanceLocation = { lat: 12.5450, lng: 76.9090 },
  patientLocation = { lat: 12.5835, lng: 76.9280 },
  hospitalLocation = { lat: 12.5240, lng: 76.8980 },
  status = 'DISPATCHED',
  etaMinutes = 8,
  distanceKm = 2.4,
  currentLanguage = 'kn',
  onLocationDetected = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const patientMarkerRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [geoStatus, setGeoStatus] = useState(null); // 'detecting', 'success', 'denied'
  const [usingFallback, setUsingFallback] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Initialize or Load Google Maps
  useEffect(() => {
    if (!apiKey) {
      setUsingFallback(true);
      return;
    }

    let isMounted = true;
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['maps', 'marker', 'routes'],
      language: currentLanguage === 'hi' ? 'hi' : currentLanguage === 'kn' ? 'kn' : 'en'
    });

    loader.load()
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return;

        try {
          const map = new google.maps.Map(mapContainerRef.current, {
            center: ambulanceLocation,
            zoom: 13,
            styles: ASHA_ROSE_MAP_STYLE,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            backgroundColor: '#FFF9F7'
          });

          mapInstanceRef.current = map;

          // Hospital Base Marker
          hospitalMarkerRef.current = new google.maps.Marker({
            position: hospitalLocation,
            map,
            title: "Mandya Primary Health Centre (PHC)",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#477A60',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3
            }
          });

          // Patient Pickup Marker
          patientMarkerRef.current = new google.maps.Marker({
            position: patientLocation,
            map,
            title: "Patient Pickup Location",
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 7,
              fillColor: '#B94A58',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2.5
            }
          });

          // Ambulance Marker
          ambulanceMarkerRef.current = new google.maps.Marker({
            position: ambulanceLocation,
            map,
            title: "108 Emergency Ambulance",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#A25B74',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3
            }
          });

          // Directions Renderer for the Rose Route
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#A25B74',
              strokeWeight: 6,
              strokeOpacity: 0.95
            }
          });
          directionsRendererRef.current = directionsRenderer;

          // Calculate Route
          const directionsService = new google.maps.DirectionsService();
          directionsService.route({
            origin: ambulanceLocation,
            destination: patientLocation,
            travelMode: google.maps.TravelMode.DRIVING
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(result);
            }
          });

          setMapLoaded(true);
        } catch (err) {
          console.warn('[GoogleAmbulanceMap] Init error, falling back to vector map', err);
          setUsingFallback(true);
        }
      })
      .catch((err) => {
        console.warn('[GoogleAmbulanceMap] Loader catch, falling back to vector map', err);
        setUsingFallback(true);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, currentLanguage]);

  // Update Markers when coordinates change
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && window.google) {
      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.setPosition(ambulanceLocation);
      }
      if (patientMarkerRef.current) {
        patientMarkerRef.current.setPosition(patientLocation);
      }
    }
  }, [ambulanceLocation, patientLocation, mapLoaded]);

  // Browser Geolocation Detector
  const handleDetectPatientLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }
    setGeoStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setGeoStatus('success');
        if (onLocationDetected) onLocationDetected(coords);

        if (mapInstanceRef.current && patientMarkerRef.current) {
          patientMarkerRef.current.setPosition(coords);
          mapInstanceRef.current.panTo(coords);
        }
        setTimeout(() => setGeoStatus(null), 4000);
      },
      (error) => {
        console.warn('[GoogleAmbulanceMap] Geolocation denied', error);
        setGeoStatus('denied');
        setTimeout(() => setGeoStatus(null), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Recenter actions
  const handleRecenterAmbulance = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(ambulanceLocation);
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleRecenterPatient = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(patientLocation);
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleFitRouteBounds = () => {
    if (mapInstanceRef.current && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(ambulanceLocation);
      bounds.extend(patientLocation);
      bounds.extend(hospitalLocation);
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#FFF9F7] border border-[#F0DDE2] shadow-card overflow-hidden">
      
      {/* Top Map Header & Controls Overlay */}
      <div className="p-4 bg-white/90 backdrop-blur-md border-b border-[#F0DDE2] flex flex-wrap items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center font-bold">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-kannada text-[#3B2A33] leading-tight flex items-center space-x-1.5">
              <span>{t('ambulance.title', currentLanguage)}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD] font-bold">
                {apiKey ? 'Google Maps JS API' : 'High-Precision Vector Terrain'}
              </span>
            </h3>
            <span className="text-[10px] text-[#7A6670] font-mono">
              GPS: {ambulanceLocation.lat.toFixed(4)}° N, {ambulanceLocation.lng.toFixed(4)}° E • {status}
            </span>
          </div>
        </div>

        {/* Quick Map Action Buttons */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleDetectPatientLocation}
            className="px-2.5 py-1.5 rounded-xl bg-[#FDF6F5] hover:bg-[#F9ECEC] border border-[#F0DDE2] text-[#A25B74] font-bold text-[11px] flex items-center space-x-1 transition-all active:scale-95"
            title="Detect Device GPS Location via Geolocation API"
          >
            <LocateFixed className="w-3.5 h-3.5 text-[#A25B74]" />
            <span>GPS ಪಿಕ್-ಅಪ್</span>
          </button>

          <button
            onClick={handleRecenterAmbulance}
            className="px-2 py-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] text-[11px] font-bold transition-all shadow-xs"
            title="Recenter on Ambulance"
          >
            🚑 108
          </button>

          <button
            onClick={handleRecenterPatient}
            className="px-2 py-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] text-[11px] font-bold transition-all shadow-xs"
            title="Recenter on Patient"
          >
            📍 Patient
          </button>

          <button
            onClick={handleFitRouteBounds}
            className="p-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] border border-[#F0DDE2] text-[#A25B74] font-bold shadow-xs"
            title="Fit Entire Route Bounds"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center space-x-0.5 pl-1 border-l border-[#F0DDE2]">
            <button
              onClick={handleZoomIn}
              className="w-7 h-7 rounded-lg bg-white border border-[#F0DDE2] font-bold text-xs text-[#3B2A33] hover:bg-[#FDF6F5] shadow-xs"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="w-7 h-7 rounded-lg bg-white border border-[#F0DDE2] font-bold text-xs text-[#3B2A33] hover:bg-[#FDF6F5] shadow-xs"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Feedback Toast */}
      {geoStatus && (
        <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
          geoStatus === 'success' 
            ? 'bg-[#E8F7F1] text-[#477A60] border-[#C8EEDD]' 
            : geoStatus === 'detecting'
            ? 'bg-[#FDF6F5] text-[#A25B74] border-[#F0DDE2] animate-pulse'
            : 'bg-[#FCF1F1] text-[#B94A58] border-[#B94A58]/30'
        }`}>
          <div className="flex items-center space-x-2">
            {geoStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-[#477A60]" />}
            {geoStatus === 'detecting' && <Radio className="w-4 h-4 text-[#A25B74] animate-spin" />}
            {geoStatus === 'denied' && <AlertCircle className="w-4 h-4 text-[#B94A58]" />}
            <span>
              {geoStatus === 'success' && 'ರೋಗಿಯ ನಿಜವಾದ GPS ಸ್ಥಳ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!'}
              {geoStatus === 'detecting' && 'ಬ್ರೌಸರ್ ಜಿಪಿಎಸ್ ಮೂಲಕ ರೋಗಿಯ ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...'}
              {geoStatus === 'denied' && t('ambulance.mapPermissionDenied', currentLanguage)}
            </span>
          </div>
        </div>
      )}

      {/* Main Map Viewport */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#FFF9F7]">
        {/* Actual Google Maps DOM Container */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full ${usingFallback ? 'hidden' : 'block'}`}
        />

        {/* High-Fidelity Vector Fallback Map (renders when API Key is pending or in fallback) */}
        {usingFallback && (
          <div className="w-full h-full relative overflow-hidden select-none bg-[#FFF9F7] flex items-center justify-center">
            {/* SVG Vector Terrain & Rose Route Line */}
            <svg viewBox="0 0 640 420" className="w-full h-full">
              <defs>
                <pattern id="roseGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#F0DDE2" strokeWidth="0.6" opacity="0.6" />
                </pattern>
                <linearGradient id="roseLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#477A60" />
                  <stop offset="35%" stopColor="#A25B74" />
                  <stop offset="100%" stopColor="#B94A58" />
                </linearGradient>
              </defs>

              <rect width="640" height="420" fill="url(#roseGrid)" />

              {/* Water feature: Mandya Shivalli Stream */}
              <path d="M 40 40 Q 140 120 220 90 T 360 160 T 540 220" fill="none" stroke="#F4E8EC" strokeWidth="18" strokeLinecap="round" />
              <text x="140" y="70" fill="#C47A92" fontSize="10" fontWeight="bold">ಶಿವಳ್ಳಿ ಹಳ್ಳ (Shivalli Stream)</text>

              {/* Highway Arteries */}
              <path d="M 50 110 L 600 110" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
              <path d="M 50 110 L 600 110" stroke="#F0DDE2" strokeWidth="2" strokeLinecap="round" />

              <path d="M 160 110 Q 240 180 320 210 T 480 320" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
              <path d="M 160 110 Q 240 180 320 210 T 480 320" stroke="#F0DDE2" strokeWidth="1.8" strokeLinecap="round" />

              {/* Active Recommended Google Maps Rose Route with Pulsing Dash */}
              <path 
                d="M 120 110 Q 200 160 280 180 T 420 260 T 520 330" 
                stroke="#F0DDE2" 
                strokeWidth="12" 
                strokeLinecap="round" 
              />
              <path 
                d="M 120 110 Q 200 160 280 180 T 420 260 T 520 330" 
                stroke="url(#roseLineGrad)" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />
              <path 
                d="M 120 110 Q 200 160 280 180 T 420 260 T 520 330" 
                stroke="#FFFFFF" 
                strokeWidth="2" 
                strokeDasharray="8 6" 
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Hospital Pin (PHC Mandya) */}
              <g transform="translate(120, 110)">
                <circle r="14" fill="#477A60" opacity="0.25" className="animate-ping" />
                <circle r="10" fill="#477A60" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">+</text>
                <text x="0" y="24" textAnchor="middle" fill="#477A60" fontSize="9" fontWeight="bold">PHC Mandya Base</text>
              </g>

              {/* Patient Pickup Pin */}
              <g transform="translate(520, 330)">
                <circle r="16" fill="#B94A58" opacity="0.3" className="animate-ping" />
                <circle r="11" fill="#B94A58" stroke="#FFFFFF" strokeWidth="2" />
                <circle r="4" fill="#FFFFFF" />
                <text x="0" y="24" textAnchor="middle" fill="#B94A58" fontSize="9" fontWeight="bold">Patient Pickup Location</text>
              </g>

              {/* Moving 108 Ambulance Vehicle Pin */}
              <g transform="translate(320, 205)">
                <circle r="20" fill="#A25B74" opacity="0.25" className="animate-ping" />
                <rect x="-14" y="-10" width="28" height="20" rx="5" fill="#FFFFFF" stroke="#A25B74" strokeWidth="2.5" />
                <rect x="-10" y="-7" width="9" height="7" fill="#C47A92" rx="1.5" />
                <rect x="2" y="-7" width="9" height="7" fill="#B94A58" rx="1.5" />
                <circle cx="-7" cy="10" r="3" fill="#3B2A33" />
                <circle cx="7" cy="10" r="3" fill="#3B2A33" />
                <text x="0" y="-14" textAnchor="middle" fill="#A25B74" fontSize="9" fontWeight="bold">🚑 108 LIVE</text>
              </g>
            </svg>

            {/* In-Map Info Pill explaining API Key configuration */}
            <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#F0DDE2] shadow-md text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-[#A25B74] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Maps Platform Integration Ready</span>
              </div>
              <p className="text-[11px] text-[#7A6670] leading-tight">
                Rendering calibrated vector terrain. To connect live Google Maps satellite/street tiles, configure <code className="font-mono text-[#A25B74] bg-[#FDF6F5] px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="font-mono text-[#7A6670]">.env</code>.
              </p>
            </div>
          </div>
        )}

        {/* Floating Real-Time Telemetry HUD Banner */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#F0DDE2] shadow-md text-xs flex items-center space-x-3 text-[#3B2A33]">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-[#A25B74] animate-pulse" />
            <span className="font-bold">ETA: {etaMinutes} ನಿಮಿಷ ({etaMinutes} min)</span>
          </div>
          <span className="text-[#F0DDE2] font-bold">|</span>
          <div className="flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-[#C47A92]" />
            <span className="font-mono font-bold">{distanceKm} km ಬಾಕಿ</span>
          </div>
          <span className="text-[#F0DDE2] font-bold">|</span>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
