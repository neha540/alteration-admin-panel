import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Plus, 
  Minus, 
  Crosshair, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  AlertTriangle,
  Check,
  X,
  Compass,
  Filter
} from 'lucide-react';

import { adminDataService } from '../../services/adminDataService';
import { 
  getStudioCoordinates, 
  calculateDistanceKm, 
  calculateDistanceMiles, 
  formatDistance, 
  getCoordinatesFromPinOrText, 
  PLATFORM_CENTER 
} from '../../utils/locationHelper';

export default function TerritoriesView({ networkSettings }) {
  const [zipInput, setZipInput] = useState('');
  const [activeFilterPin, setActiveFilterPin] = useState('');
  const [zipResult, setZipResult] = useState(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [liveStudios, setLiveStudios] = useState([]);
  const [liveSettings, setLiveSettings] = useState(networkSettings || null);
  const [isLeafletReady, setIsLeafletReady] = useState(typeof window !== 'undefined' && !!window.L);
  const [selectedStudio, setSelectedStudio] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Sync settings
  useEffect(() => {
    if (networkSettings) setLiveSettings(networkSettings);
  }, [networkSettings]);

  useEffect(() => {
    const syncLocalSettings = () => {
      try {
        const cached = localStorage.getItem('alteration_network_settings') || localStorage.getItem('alteration_admin_network_settings');
        if (cached) setLiveSettings(JSON.parse(cached));
      } catch { }
    };
    syncLocalSettings();

    const handleSettingsUpdated = (e) => {
      if (e?.detail) setLiveSettings(e.detail);
    };
    window.addEventListener('admin_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', syncLocalSettings);
    return () => {
      window.removeEventListener('admin_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', syncLocalSettings);
    };
  }, []);

  // Minimum studio spacing in miles (dynamic from settings)
  const activeSpacing = parseFloat(liveSettings?.studioSpacing || networkSettings?.studioSpacing || '5') || 5;

  // Fetch live studios
  useEffect(() => {
    adminDataService.getStudios()
      .then(data => {
        if (Array.isArray(data)) setLiveStudios(data);
      })
      .catch(() => {});
  }, []);

  // Dynamically load Leaflet if not present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.L) {
      setIsLeafletReady(true);
      return;
    }

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => setIsLeafletReady(true);
      document.body.appendChild(script);
    }

    const checkTimer = setInterval(() => {
      if (window.L) {
        setIsLeafletReady(true);
        clearInterval(checkTimer);
      }
    }, 200);

    return () => clearInterval(checkTimer);
  }, []);

  // Compute resolved coordinates, distances & conflict for each studio
  const studiosWithTerritoryData = useMemo(() => {
    const rawList = Array.isArray(liveStudios) ? liveStudios : [];

    // 1. Resolve coordinates for all studios
    const withCoords = rawList.map(s => {
      const coords = getStudioCoordinates(s);
      const cleanZip = s.zip || (s.address?.match(/\b\d{6}\b/) ? s.address.match(/\b\d{6}\b/)[0] : '');
      return {
        ...s,
        coords,
        resolvedZip: cleanZip,
        locationDisplay: s.address || [s.city, s.state, cleanZip].filter(Boolean).join(', ') || 'Tailoring Studio'
      };
    });

    // 2. Pairwise distance check against activeSpacing (in miles)
    return withCoords.map((st, i) => {
      let nearestDistanceMiles = null;
      let nearestStudioName = null;
      let hasConflict = Boolean(st.hasConflict);

      withCoords.forEach((other, j) => {
        if (i === j) return;
        const dist = calculateDistanceMiles(st.coords.lat, st.coords.lng, other.coords.lat, other.coords.lng);
        if (dist !== null) {
          if (nearestDistanceMiles === null || dist < nearestDistanceMiles) {
            nearestDistanceMiles = dist;
            nearestStudioName = other.name;
          }
          if (dist < activeSpacing) {
            hasConflict = true;
          }
        }
      });

      const isLive = st.status === 'Approved' && !hasConflict;
      const statusLabel = hasConflict ? 'Conflict' : (st.status === 'Approved' ? 'Live' : (st.status || 'In review'));

      return {
        ...st,
        hasConflict,
        nearestDistanceMiles,
        nearestStudioName,
        statusLabel,
        statusColor: hasConflict
          ? 'bg-[#FFF1EB] text-[#E05638] border border-[#FCD9CF]'
          : (isLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80')
      };
    });
  }, [liveStudios, activeSpacing]);

  // Dynamic available cities list
  const availableCities = useMemo(() => {
    const cities = new Set();
    studiosWithTerritoryData.forEach(s => {
      if (s.city) cities.add(s.city.trim());
    });
    return Array.from(cities);
  }, [studiosWithTerritoryData]);

  // Filter studios: by PIN code search (if entered) or city filter (if selected)
  const filteredStudios = useMemo(() => {
    let result = studiosWithTerritoryData;

    // PIN code or text search
    if (activeFilterPin.trim()) {
      const q = activeFilterPin.trim().toLowerCase();
      result = result.filter(s => 
        (s.resolvedZip && s.resolvedZip.includes(q)) ||
        (s.zip && s.zip.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q))
      );
    } else if (cityFilter !== 'all') {
      result = result.filter(s => s.city && s.city.toLowerCase() === cityFilter.toLowerCase());
    }

    return result;
  }, [studiosWithTerritoryData, activeFilterPin, cityFilter]);

  // Audit of conflicts across live approved studios
  const territoryAudit = useMemo(() => {
    const conflicts = [];
    for (let i = 0; i < studiosWithTerritoryData.length; i++) {
      for (let j = i + 1; j < studiosWithTerritoryData.length; j++) {
        const s1 = studiosWithTerritoryData[i];
        const s2 = studiosWithTerritoryData[j];
        const dist = calculateDistanceMiles(s1.coords.lat, s1.coords.lng, s2.coords.lat, s2.coords.lng);
        if (dist !== null && dist < activeSpacing) {
          conflicts.push({
            studio1: s1.name,
            studio2: s2.name,
            distance: `${dist.toFixed(1)} miles`
          });
        }
      }
    }
    return conflicts;
  }, [studiosWithTerritoryData, activeSpacing]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isLeafletReady || !window.L || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [PLATFORM_CENTER.lat, PLATFORM_CENTER.lng],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 400);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const allPoints = [];

    // 1. Plot filtered studios (or ALL studios if no PIN filter)
    filteredStudios.forEach((st, idx) => {
      allPoints.push([st.coords.lat, st.coords.lng]);

      const isConflict = st.hasConflict;
      const pinColor = isConflict ? '#DC2626' : '#2563EB';
      const badgeIcon = isConflict ? '⚠️' : `${idx + 1}`;

      const pinHtml = `
        <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3)); cursor:pointer;">
          <div style="width:34px; height:34px; border-radius:50% 50% 50% 0; background:${pinColor}; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:2.5px solid #FFFFFF;">
            <div style="transform:rotate(45deg); color:#FFFFFF; font-size:11px; font-weight:800; font-family:sans-serif;">${badgeIcon}</div>
          </div>
          ${isConflict ? '<div style="position:absolute; width:44px; height:44px; border-radius:50%; border:2px dashed #DC2626; animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'studio-territory-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const marker = L.marker([st.coords.lat, st.coords.lng], { icon: customIcon }).addTo(markersGroup);
      marker.on('click', () => setSelectedStudio(st));

      const conflictInfo = isConflict 
        ? `<div style="background:#FEF2F2; color:#991B1B; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; margin-top:6px; border:1px solid #FECACA;">
             ⚠️ Conflict: Within ${activeSpacing}-mi spacing of ${st.nearestStudioName || 'another studio'} (${st.nearestDistanceMiles?.toFixed(1) || '?'} mi away)
           </div>`
        : `<div style="background:#ECFDF5; color:#065F46; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; margin-top:6px; border:1px solid #A7F3D0;">
             ✓ Meets ${activeSpacing}-mile separation rule
           </div>`;

      marker.bindPopup(`
        <div style="font-family:sans-serif; font-size:12px; min-width:210px; padding:3px;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:4px;">
            <strong style="font-size:13px; color:#0F172A;">${st.name}</strong>
            <span style="font-size:10px; padding:2px 6px; border-radius:4px; font-weight:bold; background:${isConflict ? '#FEE2E2; color:#991B1B' : '#DBEAFE; color:#1E40AF'};">${st.statusLabel}</span>
          </div>
          <p style="margin:0 0 4px 0; color:#64748B; font-size:11px;">${st.locationDisplay}</p>
          ${st.resolvedZip ? `<p style="margin:0 0 4px 0; color:#2563EB; font-weight:bold; font-size:11px;">PIN: ${st.resolvedZip}</p>` : ''}
          ${conflictInfo}
        </div>
      `, { offset: [0, -28] });
    });

    // Auto-fit bounds
    if (allPoints.length > 0) {
      if (allPoints.length === 1) {
        map.setView(allPoints[0], 14);
      } else {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    } else if (activeFilterPin) {
      // If PIN is searched but no studios exist in it: no marker is placed on the map.
      // Pan to region coordinates if available so the user sees the area.
      const targetCoords = getCoordinatesFromPinOrText(activeFilterPin);
      if (targetCoords && targetCoords.lat && targetCoords.lng) {
        map.setView([targetCoords.lat, targetCoords.lng], 12);
      } else {
        map.setView([PLATFORM_CENTER.lat, PLATFORM_CENTER.lng], 10);
      }
    } else {
      map.setView([PLATFORM_CENTER.lat, PLATFORM_CENTER.lng], 10);
    }

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);
  }, [isLeafletReady, filteredStudios, activeFilterPin, activeSpacing]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch { }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle PIN / ZIP Territory Check & Search
  const handleCheckZip = (e) => {
    e?.preventDefault?.();
    const clean = zipInput.trim();
    if (!clean) {
      // If empty: clear filter and show all studios in their correct real locations
      handleClearPinFilter();
      return;
    }

    // Set active filter to show only this pincode
    setActiveFilterPin(clean);

    // Filter matching studios from the network
    const q = clean.toLowerCase();
    const matchingStudios = studiosWithTerritoryData.filter(s => 
      (s.resolvedZip && s.resolvedZip.toLowerCase().includes(q)) ||
      (s.zip && String(s.zip).toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q))
    );

    if (matchingStudios.length === 0) {
      // If no studios in that pincode: show a clean message, no marker is placed
      setZipResult({
        type: 'empty',
        status: 'clear',
        title: `PIN: ${clean}`,
        message: `No studios found registered under PIN code "${clean}". This territory currently has no existing studios.`
      });
    } else {
      // Studios found in that pincode
      const conflictCount = matchingStudios.filter(s => s.hasConflict).length;
      if (conflictCount > 0) {
        setZipResult({
          type: 'found',
          status: 'conflict',
          title: `PIN: ${clean} (${matchingStudios.length} studio${matchingStudios.length > 1 ? 's' : ''})`,
          message: `${matchingStudios.length} studio(s) located in this PIN code. Warning: Spacing conflict detected (< ${activeSpacing} miles).`
        });
      } else {
        setZipResult({
          type: 'found',
          status: 'clear',
          title: `PIN: ${clean} (${matchingStudios.length} studio${matchingStudios.length > 1 ? 's' : ''})`,
          message: `${matchingStudios.length} studio(s) registered in PIN code "${clean}". Meets minimum separation rules.`
        });
      }
    }
  };

  const handleClearPinFilter = () => {
    setZipInput('');
    setActiveFilterPin('');
    setZipResult(null);
    setCityFilter('all');
  };

  // Map Recenter / Zoom Controls
  const handleZoom = (delta) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current || !window.L) return;
    const all = studiosWithTerritoryData.map(s => [s.coords.lat, s.coords.lng]);
    if (all.length > 0) {
      mapInstanceRef.current.fitBounds(window.L.latLngBounds(all), { padding: [50, 50], maxZoom: 13 });
    } else {
      mapInstanceRef.current.setView([PLATFORM_CENTER.lat, PLATFORM_CENTER.lng], 10);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
          Territory planning
        </h1>
        <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
          Give every studio room to build a local following.
        </p>
      </div>

      {/* Main Grid: Left Local Picture (65%), Right ZIP Check & Rule (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Interactive Leaflet Map & Studios List */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  The local picture
                </h2>
                {activeFilterPin ? (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>PIN: {activeFilterPin}</span>
                    <button type="button" onClick={handleClearPinFilter} className="hover:text-blue-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    All {studiosWithTerritoryData.length} studios plotted
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeSpacing} miles minimum separation rule active across the network
              </p>
            </div>

            {/* City Dropdown Filter */}
            <div className="flex items-center gap-2">
              <select
                value={cityFilter}
                disabled={Boolean(activeFilterPin)}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer disabled:bg-slate-50 disabled:opacity-60"
              >
                <option value="all">All cities ({studiosWithTerritoryData.length})</option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {activeFilterPin && (
                <button
                  type="button"
                  onClick={handleClearPinFilter}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Show all</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative w-full h-[360px] bg-slate-100 rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {/* Real OpenStreetMap Leaflet Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* When PIN filter has no studios: show clean overlay message on map (no markers) */}
            {activeFilterPin && filteredStudios.length === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-200/90 shadow-lg text-center max-w-xs pointer-events-auto">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-500">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    No studios in PIN {activeFilterPin}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    There are no registered studios in this PIN code area.
                  </p>
                </div>
              </div>
            )}

            {/* Floating Top Controls Bar on Map */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
              <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800 border border-slate-200 shadow-xs pointer-events-auto flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {activeFilterPin 
                    ? `PIN Filter: ${filteredStudios.length} studios` 
                    : `${filteredStudios.length} live locations`}
                </span>
              </span>
            </div>

            {/* Floating Map Zoom Controls (Top Right) */}
            <div className="absolute top-3 right-3 z-10 flex flex-col bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden">
              <button 
                type="button" 
                onClick={() => handleZoom(1)} 
                title="Zoom in"
                className="p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="h-[1px] bg-slate-200" />
              <button 
                type="button" 
                onClick={() => handleZoom(-1)} 
                title="Zoom out"
                className="p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="h-[1px] bg-slate-200" />
              <button 
                type="button" 
                onClick={handleRecenter} 
                title="Fit all studios"
                className="p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Map Legend */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[10px] text-slate-600 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="font-medium">Approved / Clear</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-200"></span>
                <span className="font-medium">Conflict (&lt; {activeSpacing} mi)</span>
              </div>
            </div>
          </div>

          {/* Studios List below map */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
              <span>Studio ({filteredStudios.length})</span>
              <span>Territory status</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {filteredStudios.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {activeFilterPin 
                    ? `No studios found registered under PIN code or search "${activeFilterPin}".` 
                    : 'No studios registered in the network yet.'}
                </div>
              ) : (
                filteredStudios.map((s, index) => (
                  <div 
                    key={s.id} 
                    onClick={() => {
                      setSelectedStudio(s);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([s.coords.lat, s.coords.lng], 14, { duration: 0.8 });
                      }
                    }}
                    className={`py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2.5 rounded-xl transition cursor-pointer ${
                      selectedStudio?.id === s.id ? 'bg-blue-50/70 border border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 shrink-0 rounded-lg text-xs font-bold flex items-center justify-center ${
                        s.hasConflict ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">{s.name}</span>
                          {s.resolvedZip && (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold">
                              {s.resolvedZip}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {s.locationDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {s.nearestDistanceMiles !== null && (
                        <span className="text-[10.5px] text-slate-400 hidden sm:inline font-mono">
                          {s.nearestDistanceMiles.toFixed(1)} mi away
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${s.statusColor}`}>
                        {s.statusLabel}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Check a PIN code & Spacing Rule */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Card 1: Check a PIN code / Location */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Check a ZIP code
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                See how a proposed location fits the network.
              </p>
            </div>

            <form onSubmit={handleCheckZip} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  ZIP code / PIN code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    placeholder="e.g. 10012, 90210, New York, Austin"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs placeholder:text-slate-400 font-mono pr-8"
                  />
                  {zipInput && (
                    <button
                      type="button"
                      onClick={handleClearPinFilter}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#2361E9] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Check territory</span>
                </button>

                {activeFilterPin && (
                  <button
                    type="button"
                    onClick={handleClearPinFilter}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {/* Check Result Pill */}
            {zipResult && (
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                zipResult.type === 'empty'
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : (zipResult.status === 'conflict'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800')
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  {zipResult.type === 'empty' ? (
                    <MapPin className="w-4 h-4 text-slate-500" />
                  ) : zipResult.status === 'conflict' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>{zipResult.title}</span>
                </div>
                <p className="mt-1 text-[11.5px] leading-relaxed">{zipResult.message}</p>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              • Type any 6-digit PIN code to filter the live map to only that area.<br />
              • Leave blank or click "Reset" to see all registered studios across the entire network in their correct real locations.
            </p>
          </div>

          {/* Card 2: One clear rule (Dynamic Minimum Spacing) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Minimum studio spacing rule
            </span>

            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-slate-900">
                {activeSpacing} miles
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                (~{(activeSpacing * 1.60934).toFixed(1)} km)
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Every new studio is checked against existing approved studios. Two studios cannot be within {activeSpacing} miles of each other without an administrative territory waiver.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Live Territory Audit Card (Dynamically computed from actual distances) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live territory audit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Computed from the coordinates of currently listed studios.
            </p>
          </div>

          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
            territoryAudit.length === 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {territoryAudit.length === 0 ? 'All clear' : `${territoryAudit.length} conflict(s) detected`}
          </span>
        </div>

        {territoryAudit.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.2]" />
            <span className="font-medium">
              All live studios satisfy the {activeSpacing || 5}-mile separation requirement.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/70 flex items-start gap-3 text-xs text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 stroke-[2.2] mt-0.5" />
              <div>
                <p className="font-bold">Territory separation violations detected:</p>
                <ul className="mt-1.5 space-y-1 list-disc pl-4 text-[11.5px]">
                  {territoryAudit.map((c, i) => (
                    <li key={i}>
                      <strong>{c.studio1}</strong> and <strong>{c.studio2}</strong> are only <strong>{c.distance}</strong> apart (violates {activeSpacing}-mile spacing rule).
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
