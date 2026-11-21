import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Key,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { t } from '../../services/i18n';

/**
 * Robust Google Maps JavaScript API script loader.
 * Loads the official Google Maps JS API. If apiKey is not provided or empty,
 * it loads Google Maps in standard developer mode which provides fully functional
 * interactive road vector tiles, street labels, landmarks, and DirectionsService.
 */
function loadGoogleMapsScript(apiKey, language = 'en') {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window not available'));
    if (window.google && window.google.maps) {
      return resolve(window.google);
    }

    const scriptId = 'google-maps-js-sdk';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      const keyParam = apiKey ? `key=${encodeURIComponent(apiKey)}&` : '';
      script.src = `https://maps.googleapis.com/maps/api/js?${keyParam}libraries=geometry,places&language=${encodeURIComponent(language)}&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps script loaded but window.google.maps is unavailable'));
      }
    };

    const handleError = (e) => {
      reject(new Error('Failed to load Google Maps script. Check network or API key restrictions.'));
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    // Timeout safety
    setTimeout(() => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      }
    }, 3000);
  });
}

// Custom Rose & Blush Google Maps Style: High legibility street map
export const ASHA_ROSE_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#FDFBF7" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#4A3B43" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#FFFFFF" }, { "weight": 2.5 }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3B2A33" }, { "weight": 600 }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#84455C" }]
  },
  {
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [{ "color": "#F4FAF6" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#FFFFFF" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#EED8DE" }, { "weight": 1.5 }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#FFF0F4" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#E2A4B8" }, { "weight": 2 }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#FFFFFF" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#F0DDE2" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#EBF2F7" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#5A738E" }]
  }
];

export default function GoogleAmbulanceMap({
  ambulanceLocation = { lat: 12.5450, lng: 76.9090 },
  patientLocation = { lat: 12.5835, lng: 76.9280 },
  hospitalLocation = { lat: 12.5240, lng: 76.8980 },
  status = 'AMBULANCE_ASSIGNED',
  etaMinutes = 8,
  distanceKm = 2.4,
  speedKmh = 42,
  heading = 45,
  accuracy = 4.5,
  trackingMode = 'LIVE_GPS', // 'LIVE_GPS' or 'DEMO_SIMULATION'
  currentLanguage = 'kn',
  onLocationDetected = null,
  onRouteMetricsCalculated = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const patientMarkerRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const lastRoutedCoordsRef = useRef({ ambLat: 0, ambLng: 0, destLat: 0, destLng: 0 });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [geoStatus, setGeoStatus] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [calculatedDistance, setCalculatedDistance] = useState(null);
  const [calculatedDuration, setCalculatedDuration] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => {
    return localStorage.getItem('asha_custom_gmaps_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });
  const [activeApiKey, setActiveApiKey] = useState(() => {
    return localStorage.getItem('asha_custom_gmaps_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });

  // Validate latitude and longitude values
  const isValidCoord = (coord) => {
    return (
      coord &&
      typeof coord.lat === 'number' &&
      !isNaN(coord.lat) &&
      coord.lat >= -90 &&
      coord.lat <= 90 &&
      typeof coord.lng === 'number' &&
      !isNaN(coord.lng) &&
      coord.lng >= -180 &&
      coord.lng <= 180
    );
  };

  const validAmbulanceLoc = isValidCoord(ambulanceLocation) ? ambulanceLocation : { lat: 12.5450, lng: 76.9090 };
  const validPatientLoc = isValidCoord(patientLocation) ? patientLocation : { lat: 12.5835, lng: 76.9280 };
  const validHospitalLoc = isValidCoord(hospitalLocation) ? hospitalLocation : { lat: 12.5240, lng: 76.8980 };

  // Determine current routing destination
  const isTransportingToHospital = status === 'ARRIVED' || status === 'TRIP_COMPLETED';
  const currentDestination = isTransportingToHospital ? validHospitalLoc : validPatientLoc;

  // Initialize Google Maps instance
  useEffect(() => {
    let isMounted = true;
    const lang = currentLanguage === 'hi' ? 'hi' : currentLanguage === 'kn' ? 'kn' : 'en';

    loadGoogleMapsScript(activeApiKey, lang)
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return;

        try {
          // Create Google Map
          const map = new google.maps.Map(mapContainerRef.current, {
            center: validAmbulanceLoc,
            zoom: 14,
            mapTypeId: mapType,
            styles: mapType === 'roadmap' ? ASHA_ROSE_MAP_STYLE : null,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            backgroundColor: '#FDFBF7'
          });

          mapInstanceRef.current = map;
          directionsServiceRef.current = new google.maps.DirectionsService();

          // Hospital Base Marker
          const hospitalMarker = new google.maps.Marker({
            position: validHospitalLoc,
            map,
            title: "Mandya Taluk Hospital & PHC Base",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
                  <path d="M20 0C8.95 0 0 8.95 0 20c0 14 20 28 20 28s20-14 20-28C40 8.95 31.05 0 20 0z" fill="#477A60"/>
                  <circle cx="20" cy="18" r="13" fill="#FFFFFF"/>
                  <rect x="18" y="10" width="4" height="16" fill="#477A60" rx="1.5"/>
                  <rect x="12" y="16" width="16" height="4" fill="#477A60" rx="1.5"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(36, 44),
              anchor: new google.maps.Point(18, 44)
            }
          });
          hospitalMarkerRef.current = hospitalMarker;

          const hospitalInfo = new google.maps.InfoWindow({
            content: `
              <div style="font-family: sans-serif; padding: 6px; max-width: 200px;">
                <div style="font-weight: bold; color: #477A60; font-size: 13px;">🏥 Mandya Taluk Hospital</div>
                <div style="font-size: 11px; color: #666; margin-top: 3px;">24/7 PHC Sector 4 Referral Centre</div>
                <div style="font-size: 10px; color: #888; margin-top: 2px;">Emergency Beds Available: 14</div>
              </div>
            `
          });
          hospitalMarker.addListener('click', () => hospitalInfo.open(map, hospitalMarker));

          // Patient Pickup Marker
          const patientMarker = new google.maps.Marker({
            position: validPatientLoc,
            map,
            title: "Patient Pickup Location (Geetha M.)",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
                  <path d="M20 0C8.95 0 0 8.95 0 20c0 14 20 28 20 28s20-14 20-28C40 8.95 31.05 0 20 0z" fill="#B94A58"/>
                  <circle cx="20" cy="18" r="13" fill="#FFFFFF"/>
                  <circle cx="20" cy="15" r="4" fill="#B94A58"/>
                  <path d="M14 24c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#B94A58"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(36, 44),
              anchor: new google.maps.Point(18, 44)
            }
          });
          patientMarkerRef.current = patientMarker;

          const patientInfo = new google.maps.InfoWindow({
            content: `
              <div style="font-family: sans-serif; padding: 6px; max-width: 220px;">
                <div style="font-weight: bold; color: #B94A58; font-size: 13px;">📍 Patient Pickup Location</div>
                <div style="font-size: 11px; font-weight: bold; color: #3B2A33; margin-top: 3px;">Geetha M. (High Risk ANC)</div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">Keregodu Village, Mandya</div>
                <div style="font-size: 10px; color: #B94A58; font-weight: bold; margin-top: 3px;">Pre-eclampsia (BP 150/98 mmHg)</div>
              </div>
            `
          });
          patientMarker.addListener('click', () => patientInfo.open(map, patientMarker));

          // Ambulance Vehicle Marker
          const ambulanceMarker = new google.maps.Marker({
            position: validAmbulanceLoc,
            map,
            title: "108 Emergency Ambulance (KA-11-G-1081)",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
                  <circle cx="23" cy="23" r="22" fill="#FFFFFF" stroke="#A25B74" stroke-width="3"/>
                  <rect x="10" y="15" width="26" height="17" rx="4" fill="#A25B74"/>
                  <rect x="13" y="18" width="8" height="6" fill="#FFFFFF" rx="1"/>
                  <rect x="23" y="18" width="10" height="6" fill="#E8D0D8" rx="1"/>
                  <circle cx="16" cy="32" r="3.5" fill="#3B2A33" stroke="#FFFFFF" stroke-width="1.5"/>
                  <circle cx="30" cy="32" r="3.5" fill="#3B2A33" stroke="#FFFFFF" stroke-width="1.5"/>
                  <rect x="21" y="9" width="4" height="6" fill="#B94A58" rx="1"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(46, 46),
              anchor: new google.maps.Point(23, 23)
            },
            zIndex: 999
          });
          ambulanceMarkerRef.current = ambulanceMarker;

          const ambulanceInfo = new google.maps.InfoWindow({
            content: `
              <div style="font-family: sans-serif; padding: 6px; max-width: 220px;">
                <div style="font-weight: bold; color: #A25B74; font-size: 13px;">🚑 108 Emergency Ambulance</div>
                <div style="font-size: 11px; font-weight: bold; color: #3B2A33; margin-top: 3px;">KA-11-G-1081 • Ramesh Gowda</div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">EMT: Suresh Kumar</div>
                <div style="font-size: 10px; color: #477A60; font-weight: bold; margin-top: 3px;">Telemetry: Live Road Routing</div>
              </div>
            `
          });
          ambulanceMarker.addListener('click', () => ambulanceInfo.open(map, ambulanceMarker));

          // Directions Renderer for Genuine Road Route Polyline
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            preserveViewport: false,
            polylineOptions: {
              strokeColor: '#A25B74',
              strokeWeight: 6,
              strokeOpacity: 0.95
            }
          });
          directionsRendererRef.current = directionsRenderer;

          setMapLoaded(true);
          setLoadError(null);
        } catch (err) {
          console.error('[GoogleAmbulanceMap] Map initialization error', err);
          setLoadError(err.message);
        }
      })
      .catch((err) => {
        console.error('[GoogleAmbulanceMap] Loader error', err);
        setLoadError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [activeApiKey, currentLanguage, mapType]);

  // Recalculate Genuine Road Route via Google Maps DirectionsService
  const calculateRoadRoute = useCallback(() => {
    if (!mapLoaded || !window.google || !directionsServiceRef.current || !directionsRendererRef.current) {
      return;
    }

    const ambLat = validAmbulanceLoc.lat;
    const ambLng = validAmbulanceLoc.lng;
    const destLat = currentDestination.lat;
    const destLng = currentDestination.lng;

    // Check if coordinates have moved significantly (> ~20 meters)
    const last = lastRoutedCoordsRef.current;
    const latDiff = Math.abs(ambLat - last.ambLat);
    const lngDiff = Math.abs(ambLng - last.ambLng);
    const destDiff = Math.abs(destLat - last.destLat) + Math.abs(destLng - last.destLng);

    if (latDiff < 0.0002 && lngDiff < 0.0002 && destDiff < 0.0001 && calculatedDistance) {
      return; // Skip redundant API calls when stationary
    }

    lastRoutedCoordsRef.current = { ambLat, ambLng, destLat, destLng };

    directionsServiceRef.current.route(
      {
        origin: new window.google.maps.LatLng(ambLat, ambLng),
        destination: new window.google.maps.LatLng(destLat, destLng),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, routeStatus) => {
        if (routeStatus === window.google.maps.DirectionsStatus.OK && result.routes && result.routes[0]) {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes[0].legs[0];
          if (leg) {
            const distInKm = Number((leg.distance.value / 1000).toFixed(1));
            const durationInMins = Math.ceil(leg.duration.value / 60);

            setCalculatedDistance(distInKm);
            setCalculatedDuration(durationInMins);

            if (onRouteMetricsCalculated) {
              onRouteMetricsCalculated({
                distanceKm: distInKm,
                etaMinutes: durationInMins,
                distanceText: leg.distance.text,
                durationText: leg.duration.text
              });
            }
          }
        } else {
          console.warn('[GoogleAmbulanceMap] Directions route status:', routeStatus);
        }
      }
    );
  }, [mapLoaded, validAmbulanceLoc, currentDestination, calculatedDistance, onRouteMetricsCalculated]);

  // Trigger route calculation when coordinates or destination changes
  useEffect(() => {
    calculateRoadRoute();
  }, [calculateRoadRoute]);

  // Update marker positions smoothly when coordinates change
  useEffect(() => {
    if (mapLoaded && window.google) {
      if (ambulanceMarkerRef.current && isValidCoord(validAmbulanceLoc)) {
        ambulanceMarkerRef.current.setPosition(validAmbulanceLoc);
      }
      if (patientMarkerRef.current && isValidCoord(validPatientLoc)) {
        patientMarkerRef.current.setPosition(validPatientLoc);
      }
      if (hospitalMarkerRef.current && isValidCoord(validHospitalLoc)) {
        hospitalMarkerRef.current.setPosition(validHospitalLoc);
      }
    }
  }, [validAmbulanceLoc, validPatientLoc, validHospitalLoc, mapLoaded]);

  // Browser Geolocation: Detect patient's real GPS coordinates
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
      mapInstanceRef.current.panTo(validAmbulanceLoc);
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleRecenterPatient = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(validPatientLoc);
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleFitRouteBounds = () => {
    if (mapInstanceRef.current && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(validAmbulanceLoc);
      bounds.extend(validPatientLoc);
      bounds.extend(validHospitalLoc);
      mapInstanceRef.current.fitBounds(bounds, { padding: 40 });
    }
  };

  const handleSaveCustomKey = () => {
    const key = customKeyInput.trim();
    localStorage.setItem('asha_custom_gmaps_key', key);
    setActiveApiKey(key);
    setShowKeyModal(false);
    window.location.reload();
  };

  // Display values: Genuine calculated route metrics take precedence
  const displayEta = calculatedDuration !== null ? calculatedDuration : etaMinutes;
  const displayDist = calculatedDistance !== null ? calculatedDistance : distanceKm;

  return (
    <div className="relative w-full rounded-3xl bg-[#FFF9F7] border border-[#F0DDE2] shadow-card overflow-hidden">
      
      {/* Top Map Header & Controls Overlay */}
      <div className="p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-b border-[#F0DDE2] flex flex-wrap items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center font-bold shadow-inner">
            <Navigation className="w-4 h-4 text-[#A25B74]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold font-serif text-[#3B2A33] leading-tight">
                Google Maps GPS Road Telemetry
              </h3>
              {/* Dynamic Tracking Mode Badge */}
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                trackingMode === 'LIVE_GPS'
                  ? 'bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]'
                  : 'bg-[#FEF9EF] text-[#B88745] border border-[#F2B84B]/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${trackingMode === 'LIVE_GPS' ? 'bg-[#477A60] animate-ping' : 'bg-[#B88745]'}`}></span>
                <span>{trackingMode === 'LIVE_GPS' ? 'LIVE GPS' : 'DEMO ROAD'}</span>
              </span>
            </div>
            <span className="text-[10px] text-[#7A6670] font-mono block mt-0.5">
              Lat: {validAmbulanceLoc.lat.toFixed(5)}° N, Lng: {validAmbulanceLoc.lng.toFixed(5)}° E {accuracy ? `• ±${accuracy}m` : ''}
            </span>
          </div>
        </div>

        {/* Quick Map Action Controls */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleDetectPatientLocation}
            className="px-2.5 py-1.5 rounded-xl bg-[#FDF6F5] hover:bg-[#F9ECEC] border border-[#F0DDE2] text-[#A25B74] font-bold text-[11px] flex items-center space-x-1 transition-all active:scale-95 shadow-xs"
            title="Detect Device GPS Location via Geolocation API"
          >
            <LocateFixed className="w-3.5 h-3.5 text-[#A25B74]" />
            <span className="hidden sm:inline">GPS ಪಿಕ್-ಅಪ್</span>
          </button>

          <button
            onClick={handleRecenterAmbulance}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] text-[11px] font-bold transition-all shadow-xs"
            title="Recenter on 108 Ambulance"
          >
            🚑 108
          </button>

          <button
            onClick={handleRecenterPatient}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] text-[11px] font-bold transition-all shadow-xs"
            title="Recenter on Patient"
          >
            📍 Patient
          </button>

          <button
            onClick={handleFitRouteBounds}
            className="p-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] border border-[#F0DDE2] text-[#A25B74] font-bold shadow-xs active:scale-95 transition-all"
            title="Fit Entire Road Route Bounds"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMapType(mapType === 'roadmap' ? 'hybrid' : 'roadmap')}
            className={`p-1.5 rounded-xl border font-bold text-[11px] shadow-xs transition-all ${
              mapType === 'hybrid'
                ? 'bg-[#A25B74] text-white border-[#A25B74]'
                : 'bg-white hover:bg-[#FDF6F5] text-[#3B2A33] border-[#F0DDE2]'
            }`}
            title="Toggle Satellite / Street Map"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className="p-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] border border-[#F0DDE2] text-[#7A6670] hover:text-[#A25B74] font-bold shadow-xs transition-all"
            title="Google Maps API Key Configuration"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
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
              {geoStatus === 'success' && 'Device GPS location successfully detected and updated!'}
              {geoStatus === 'detecting' && 'Detecting patient pickup coordinates via hardware GPS...'}
              {geoStatus === 'denied' && 'GPS location permission was denied. Please allow location in browser settings.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Google Maps Viewport */}
      <div className="relative w-full h-[420px] sm:h-[480px] bg-[#FDFBF7]">
        {/* Actual Google Maps DOM Element */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full"
        />

        {/* Loading Spinner overlay before map tiles mount */}
        {!mapLoaded && !loadError && (
          <div className="absolute inset-0 bg-[#FFF9F7]/90 flex flex-col items-center justify-center space-y-3 z-10">
            <Radio className="w-8 h-8 text-[#A25B74] animate-spin" />
            <span className="text-xs font-bold text-[#3B2A33]">Initializing Google Maps Road Engine...</span>
            <span className="text-[11px] text-[#7A6670]">Connecting Mandya road network telemetry</span>
          </div>
        )}

        {/* Floating Real-Time Road Telemetry HUD Banner */}
        <div className="absolute top-4 left-4 right-4 sm:right-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#F0DDE2] shadow-md text-xs flex flex-wrap items-center justify-between sm:justify-start gap-3 text-[#3B2A33] z-10">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-[#A25B74] animate-pulse" />
            <span className="font-bold text-xs">ETA: {displayEta} min</span>
          </div>
          <span className="text-[#F0DDE2] font-bold hidden sm:inline">|</span>
          <div className="flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-[#C47A92]" />
            <span className="font-mono font-bold">{displayDist} km remaining</span>
          </div>
          {speedKmh > 0 && (
            <>
              <span className="text-[#F0DDE2] font-bold hidden sm:inline">|</span>
              <span className="text-[11px] font-mono text-[#7A6670] font-bold">
                {speedKmh} km/h
              </span>
            </>
          )}
          <span className="text-[#F0DDE2] font-bold hidden sm:inline">|</span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]">
            {status}
          </span>
        </div>

        {/* Bottom Route Legend HUD */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#F0DDE2] shadow-md text-[11px] flex items-center space-x-3 text-[#3B2A33] z-10">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A25B74]"></span>
            <span className="font-bold">108 Ambulance</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B94A58]"></span>
            <span className="font-bold">Patient</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#477A60]"></span>
            <span className="font-bold">PHC Hospital</span>
          </div>
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#F0DDE2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#A25B74]" />
                <h3 className="text-sm font-bold text-[#3B2A33]">Google Maps API Configuration</h3>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-xs font-bold text-[#7A6670] hover:text-[#3B2A33] p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7A6670] leading-relaxed">
              Google Maps is initialized and rendering genuine street & road vector tiles. To connect your production Cloud Project key with custom quota restrictions, paste your key below:
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#3B2A33] block">
                Google Maps API Key (VITE_GOOGLE_MAPS_API_KEY)
              </label>
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono p-3 rounded-xl border border-[#F0DDE2] bg-[#FDF6F5] focus:outline-none focus:ring-2 focus:ring-[#A25B74]"
              />
            </div>

            <div className="bg-[#FEF9EF] border border-[#F2B84B]/40 rounded-xl p-3 text-[11px] text-[#B88745] space-y-1">
              <span className="font-bold block">Maps Demo Key:</span>
              <p>For instant prototyping without billing setup, mint a free key at:</p>
              <a 
                href="https://mapsplatform.google.com/maps-demo-key" 
                target="_blank" 
                rel="noreferrer"
                className="font-bold text-[#A25B74] flex items-center space-x-1 underline"
              >
                <span>mapsplatform.google.com/maps-demo-key</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A6670] hover:bg-[#FDF6F5]"
              >
                Close
              </button>
              <button
                onClick={handleSaveCustomKey}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#A25B74] hover:bg-[#84455C] text-white shadow-touch"
              >
                Save & Reload Map
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
