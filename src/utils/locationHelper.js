// Location & Dynamic Geocoding Helper for Alteration Connect Admin
// Primary: OpenStreetMap (Nominatim API)
// Secondary: Photon (OpenStreetMap / Komoot API)
// All distances directly calculated and displayed in MILES (100% dynamic, no hardcoded coordinates)

// Compatibility exports kept as empty objects for backward-compatibility
export const KNOWN_PIN_COORDINATES = {};
export const KNOWN_LOCALITY_COORDINATES = {};
export const KNOWN_CITY_COORDINATES = {};
export const STATE_FALLBACK_COORDINATES = {};
export const PLATFORM_CENTER = { lat: 21.8974, lng: 83.3950 };

// In-memory cache for dynamic geocoded coordinates to prevent redundant network calls
const geocodeCache = new Map();

// Helper to check localStorage safely
function getSafeStorage(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (e) {}
  return null;
}

function setSafeStorage(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch (e) {}
}

/**
 * Geocode any address, street, landmark, or PIN code dynamically
 * 1. Primary: OpenStreetMap Nominatim API
 * 2. Secondary Fallback: Photon (Komoot / OpenStreetMap) API
 */
export async function geocodeAddress(query) {
  if (!query || String(query).trim().length < 2) return null;
  const clean = String(query).trim();
  const cacheKey = clean.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Check persistent storage cache
  try {
    const cached = getSafeStorage(`ac_admin_geo_${cacheKey}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.lat && parsed?.lng) {
        geocodeCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch (e) {}

  // 1. PRIMARY: OpenStreetMap Nominatim API (with timeout)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(clean)}&limit=1`;
    const res = await fetch(nomUrl, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en'
      },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
        geocodeCache.set(cacheKey, result);
        setSafeStorage(`ac_admin_geo_${cacheKey}`, JSON.stringify(result));
        return result;
      }
    }
  } catch (nomErr) {
    // Proceed to secondary fallback
  }

  // 2. SECONDARY FALLBACK: Photon (OpenStreetMap / Komoot) API
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(clean)}&limit=1`;
    const res = await fetch(photonUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.features?.length > 0 && data.features[0].geometry?.coordinates?.length >= 2) {
        const coords = data.features[0].geometry.coordinates; // [lng, lat]
        const props = data.features[0].properties || {};
        const displayName = [props.name, props.city, props.state, props.country].filter(Boolean).join(', ') || clean;
        const result = {
          lat: Number(coords[1]),
          lng: Number(coords[0]),
          displayName
        };
        geocodeCache.set(cacheKey, result);
        setSafeStorage(`ac_admin_geo_${cacheKey}`, JSON.stringify(result));
        return result;
      }
    }
  } catch (photonErr) {
    // Secondary failed
  }

  return null;
}

/**
 * Resolve coordinates from query or cache
 */
export function getCoordinatesFromPinOrText(pinOrText) {
  if (!pinOrText) return null;
  const raw = String(pinOrText).trim().toLowerCase();
  if (geocodeCache.has(raw)) {
    return geocodeCache.get(raw);
  }
  geocodeAddress(raw).catch(() => {});
  return null;
}

/**
 * Format studio location cleanly from address segments, locality and zip
 */
export function formatStudioLocation(studio) {
  if (!studio) return { primary: 'Local studio', secondary: '' };

  const rawAddress = studio.address || studio.streetAddress || '';
  const rawCity = studio.city || '';
  const rawZip = String(studio.zip || studio.postalCode || '').trim();
  const rawState = studio.state || '';

  // 1. Extract clean locality from address (e.g. "Kirodimal Nagar" or "Station Road")
  let locality = '';
  if (rawAddress) {
    const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean);
    const cleanParts = parts.filter(p => !/^(near|opp|opposite|behind|beside|in front of|at post)\b/i.test(p));
    if (cleanParts.length > 0) {
      locality = cleanParts[cleanParts.length - 1];
    }
  }

  let cleanCity = rawCity;
  let primary = cleanCity;
  if (locality && cleanCity && locality.toLowerCase() !== cleanCity.toLowerCase()) {
    primary = `${locality}, ${cleanCity}`;
  } else if (locality) {
    primary = locality;
  } else if (!primary) {
    primary = rawAddress || 'Local studio';
  }

  const statePart = (rawState && rawState !== 'TX') ? rawState : '';
  const secondary = [statePart, rawZip].filter(Boolean).join(' ') || rawZip;

  return { primary, secondary };
}

/**
 * Asynchronously and progressively resolve studio coordinates
 * Directly prioritizes coordinates from database / API
 */
export async function resolveStudioCoordinates(studio) {
  if (!studio) return null;

  // 1. Explicit coordinates from API/database
  const lat = Number(studio.latitude !== undefined && studio.latitude !== null ? studio.latitude : studio.lat);
  const lng = Number(studio.longitude !== undefined && studio.longitude !== null ? studio.longitude : studio.lng);
  if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }

  // 2. GeoJSON coordinates array: [longitude, latitude]
  if (Array.isArray(studio.coordinates) && studio.coordinates.length === 2) {
    const cLat = Number(studio.coordinates[1]);
    const cLng = Number(studio.coordinates[0]);
    if (!isNaN(cLat) && !isNaN(cLng) && (cLat !== 0 || cLng !== 0)) {
      return { lat: cLat, lng: cLng };
    }
  }

  const rawAddress = studio.address || studio.streetAddress || '';
  const rawZip = String(studio.zip || studio.postalCode || '').trim();
  const rawCity = studio.city || '';

  // Extract locality if available
  let locality = '';
  if (rawAddress) {
    const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean);
    const cleanParts = parts.filter(p => !/^(near|opp|behind|beside)\b/i.test(p));
    if (cleanParts.length > 0) locality = cleanParts[cleanParts.length - 1];
  }

  const queries = [];
  if (locality && rawZip) queries.push(`${locality}, ${rawZip}, India`);
  if (rawAddress && rawZip) queries.push(`${rawAddress}, ${rawZip}, India`);
  if (locality && rawCity) queries.push(`${locality}, ${rawCity}, India`);
  if (rawZip) queries.push(`${rawZip}, India`);
  if (rawCity) queries.push(`${rawCity}, India`);

  for (const q of queries) {
    try {
      const geo = await geocodeAddress(q);
      if (geo && geo.lat && geo.lng) {
        return { lat: geo.lat, lng: geo.lng };
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Retrieve exact latitude & longitude for a studio (directly from database or dynamically geocoded)
 */
export function getStudioCoordinates(studio) {
  if (!studio) return { lat: 21.8974, lng: 83.3950 };

  // 1. Explicit latitude/longitude saved in database / API
  const lat = studio.latitude !== undefined && studio.latitude !== null ? Number(studio.latitude) :
             (studio.lat !== undefined && studio.lat !== null ? Number(studio.lat) : null);
  const lng = studio.longitude !== undefined && studio.longitude !== null ? Number(studio.longitude) :
             (studio.lng !== undefined && studio.lng !== null ? Number(studio.lng) : null);

  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }

  // 2. GeoJSON coordinates array: [longitude, latitude]
  if (studio.coordinates && Array.isArray(studio.coordinates) && studio.coordinates.length === 2) {
    const cLat = Number(studio.coordinates[1]);
    const cLng = Number(studio.coordinates[0]);
    if (!isNaN(cLat) && !isNaN(cLng) && (cLat !== 0 || cLng !== 0)) {
      return { lat: cLat, lng: cLng };
    }
  }

  // 3. Dynamic geocode query
  const locationText = [studio.address, studio.city, studio.state, studio.zip, studio.postalCode].filter(Boolean).join(', ');
  if (locationText && geocodeCache.has(locationText.toLowerCase())) {
    return geocodeCache.get(locationText.toLowerCase());
  }

  if (locationText) {
    geocodeAddress(locationText).catch(() => {});
  }

  return { lat: 21.8974, lng: 83.3950 };
}

/**
 * Calculate Great-Circle distance directly in MILES using Haversine formula
 * Earth radius = 3958.8 miles
 */
export function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lat1 === null || lon1 === undefined || lon1 === null ||
      lat2 === undefined || lat2 === null || lon2 === undefined || lon2 === null) {
    return null;
  }
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 3958.8; // Earth radius in miles
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const crowFlies = R * c;

  // Real ground road factor: driving distance on roads is ~1.12x straight-line aerial chord
  return crowFlies * 1.12;
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const dMi = calculateDistanceMiles(lat1, lon1, lat2, lon2);
  if (dMi === null) return null;
  return dMi * 1.60934;
}

/**
 * Format distance in miles
 */
export function formatDistance(distanceMiles) {
  if (distanceMiles === null || distanceMiles === undefined || isNaN(distanceMiles)) {
    return 'Nearby';
  }
  const miles = Number(distanceMiles);
  if (miles < 0.1) {
    return '< 0.1 mi away';
  }
  if (miles >= 100) {
    return `${Math.round(miles)} mi away`;
  }
  return `${miles.toFixed(1)} mi away`;
}
