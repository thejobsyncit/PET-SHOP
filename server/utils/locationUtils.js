import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fast built-in Indian city/district coordinate dictionary (fallback & instant lookup)
export const INDIA_CITY_COORDS = {
  bangalore: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  bengaluru: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'bengaluru urban': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  koramangala: { lat: 12.9352, lng: 77.6245, state: 'Karnataka' },
  indiranagar: { lat: 12.9784, lng: 77.6408, state: 'Karnataka' },
  whitefield: { lat: 12.9698, lng: 77.7500, state: 'Karnataka' },
  mumbai: { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'mumbai suburban': { lat: 19.1136, lng: 72.8697, state: 'Maharashtra' },
  bandra: { lat: 19.0596, lng: 72.8295, state: 'Maharashtra' },
  andheri: { lat: 19.1136, lng: 72.8697, state: 'Maharashtra' },
  pune: { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  delhi: { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'south delhi': { lat: 28.5245, lng: 77.2066, state: 'Delhi' },
  gurugram: { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  gurgaon: { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  noida: { lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' },
  hyderabad: { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  chennai: { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  kolkata: { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  surat: { lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  jaipur: { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  kochi: { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  ernakulam: { lat: 9.9816, lng: 76.2999, state: 'Kerala' },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  chandigarh: { lat: 30.7333, lng: 76.7794, state: 'Chandigarh' },
  lucknow: { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  indore: { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  bhopal: { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  nagpur: { lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  coimbatore: { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  mysuru: { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  mysore: { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  patna: { lat: 25.5941, lng: 85.1376, state: 'Bihar' },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, state: 'Odisha' },
  guwahati: { lat: 26.1445, lng: 91.7362, state: 'Assam' },
  goa: { lat: 15.2993, lng: 74.1240, state: 'Goa' },
  panaji: { lat: 15.4909, lng: 73.8278, state: 'Goa' },
  dehradun: { lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' },
  ludhiana: { lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  amritsar: { lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  vadodara: { lat: 22.3072, lng: 73.1812, state: 'Gujarat' },
  nashik: { lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  thane: { lat: 19.2183, lng: 72.9781, state: 'Maharashtra' },
  faridabad: { lat: 28.4089, lng: 77.3178, state: 'Haryana' },
  ghaziabad: { lat: 28.6692, lng: 77.4538, state: 'Uttar Pradesh' },
  mangalore: { lat: 12.9141, lng: 74.8560, state: 'Karnataka' },
  mangaluru: { lat: 12.9141, lng: 74.8560, state: 'Karnataka' },
  madurai: { lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  trichy: { lat: 10.7905, lng: 78.7047, state: 'Tamil Nadu' },
  vijayawada: { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' }
};

/**
 * Calculate great-circle distance between two coordinates using Haversine formula.
 * @returns {number} Distance in kilometers (rounded to 1 decimal place)
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (![nLat1, nLon1, nLat2, nLon2].every((n) => Number.isFinite(n))) {
    return null;
  }

  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(nLat2 - nLat1);
  const dLon = toRad(nLon2 - nLon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(nLat1)) * Math.cos(toRad(nLat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Fast synchronous fallback coordinate lookup from Indian city/area string
 */
export const lookupCityCoordsFallback = (query = '') => {
  const clean = String(query || '').toLowerCase().trim();
  if (!clean) return null;

  if (INDIA_CITY_COORDS[clean]) {
    return { ...INDIA_CITY_COORDS[clean], city: clean };
  }

  for (const [key, coords] of Object.entries(INDIA_CITY_COORDS)) {
    if (clean.includes(key)) {
      return { ...coords, city: key };
    }
  }
  return null;
};

/**
 * Forward geocode address/city/pincode using OpenStreetMap Nominatim (free)
 * with built-in Indian city fallback.
 */
export const geocodeAddress = async (query) => {
  const trimmed = String(query || '').trim();
  if (!trimmed) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&addressdetails=1&limit=1&q=${encodeURIComponent(trimmed)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'JoshPetsHub/1.0 (https://joshpetshub.com)',
        'Accept-Language': 'en'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const hit = data[0];
        const addr = hit.address || {};
        return {
          latitude: Number(hit.lat),
          longitude: Number(hit.lon),
          displayName: hit.display_name,
          city: addr.city || addr.town || addr.village || addr.state_district || '',
          state: addr.state || '',
          pincode: addr.postcode || '',
          area: addr.suburb || addr.neighbourhood || addr.road || '',
          source: 'nominatim'
        };
      }
    }
  } catch (err) {
    // Fall back silently to local dictionary
  }

  const fallback = lookupCityCoordsFallback(trimmed);
  if (fallback) {
    return {
      latitude: fallback.lat,
      longitude: fallback.lng,
      displayName: `${trimmed}, ${fallback.state}, India`,
      city: trimmed,
      state: fallback.state,
      pincode: '',
      area: '',
      source: 'fallback'
    };
  }

  return null;
};

/**
 * Reverse geocode lat/lng coordinates to human-readable address using OpenStreetMap Nominatim.
 */
export const reverseGeocode = async (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${nLat}&lon=${nLng}&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'JoshPetsHub/1.0 (https://joshpetshub.com)',
        'Accept-Language': 'en'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || 'India';
      const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.road || '';
      const state = addr.state || '';
      const pincode = addr.postcode || '';

      return {
        latitude: nLat,
        longitude: nLng,
        city,
        area,
        state,
        pincode,
        displayName: data.display_name || `${area ? area + ', ' : ''}${city}, ${state}`.trim(),
        source: 'nominatim'
      };
    }
  } catch (err) {
    // Fallback to nearest city from dictionary
  }

  // Nearest known Indian city fallback
  let nearestCity = 'Bangalore';
  let nearestState = 'Karnataka';
  let minDist = Infinity;

  for (const [key, coords] of Object.entries(INDIA_CITY_COORDS)) {
    const dist = calculateHaversineDistance(nLat, nLng, coords.lat, coords.lng);
    if (dist !== null && dist < minDist) {
      minDist = dist;
      nearestCity = key.charAt(0).toUpperCase() + key.slice(1);
      nearestState = coords.state;
    }
  }

  return {
    latitude: nLat,
    longitude: nLng,
    city: nearestCity,
    area: '',
    state: nearestState,
    pincode: '',
    displayName: `${nearestCity}, ${nearestState}`,
    source: 'fallback'
  };
};

/**
 * Free IP-based geolocation fallback (ipwho.is / ipapi.co) when browser GPS is denied or unavailable.
 */
export const geolocateByIp = async (clientIp = '') => {
  const cleanIp = String(clientIp || '').replace('::ffff:', '').trim();
  const isLocal = !cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.');

  // 1. Try ipwho.is (free, no key, fast)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const url = isLocal ? 'https://ipwho.is/' : `https://ipwho.is/${encodeURIComponent(cleanIp)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const d = await res.json();
      if (d && d.success !== false && Number.isFinite(Number(d.latitude)) && Number.isFinite(Number(d.longitude))) {
        const rev = await reverseGeocode(d.latitude, d.longitude);
        return {
          latitude: Number(d.latitude),
          longitude: Number(d.longitude),
          city: rev?.city || d.city || '',
          area: rev?.area || '',
          state: rev?.state || d.region || '',
          pincode: rev?.pincode || d.postal || '',
          displayName: rev?.displayName || [d.city, d.region, d.country].filter(Boolean).join(', '),
          source: 'ip'
        };
      }
    }
  } catch {
    // Try next provider
  }

  // 2. Fallback: ipapi.co (free 1000/day)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const url = isLocal ? 'https://ipapi.co/json/' : `https://ipapi.co/${encodeURIComponent(cleanIp)}/json/`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'JoshPetsHub/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const d = await res.json();
      if (d && Number.isFinite(Number(d.latitude)) && Number.isFinite(Number(d.longitude))) {
        const rev = await reverseGeocode(d.latitude, d.longitude);
        return {
          latitude: Number(d.latitude),
          longitude: Number(d.longitude),
          city: rev?.city || d.city || '',
          area: rev?.area || '',
          state: rev?.state || d.region || '',
          pincode: rev?.pincode || d.postal || '',
          displayName: rev?.displayName || [d.city, d.region, d.country_name].filter(Boolean).join(', '),
          source: 'ip'
        };
      }
    }
  } catch {
    // Ignore
  }

  return null;
};

/**
 * Lookup 6-digit Indian Pincode via India Post Pincode API (100% free, unlimited)
 * and enrich with coordinates via Nominatim / fallback.
 */
export const lookupPincode = async (pincode) => {
  const cleanPin = String(pincode || '').replace(/\D/g, '').slice(0, 6);
  if (cleanPin.length !== 6) {
    return null;
  }

  let postInfo = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;
      if (entry && entry.Status === 'Success' && Array.isArray(entry.PostOffice) && entry.PostOffice.length > 0) {
        const po = entry.PostOffice[0];
        postInfo = {
          pincode: cleanPin,
          area: po.Name || po.Block || '',
          city: po.District || po.Division || '',
          district: po.District || '',
          state: po.State || ''
        };
      }
    }
  } catch (err) {
    // Continue to Nominatim pincode search
  }

  // Geocode to get lat/lng
  const geoQuery = postInfo
    ? `${postInfo.pincode}, ${postInfo.district}, ${postInfo.state}, India`
    : `${cleanPin}, India`;
  const geo = await geocodeAddress(geoQuery) || (postInfo ? lookupCityCoordsFallback(postInfo.district) || lookupCityCoordsFallback(postInfo.city) : null);

  if (!postInfo && !geo) return null;

  return {
    pincode: cleanPin,
    area: postInfo?.area || geo?.area || '',
    city: postInfo?.city || geo?.city || '',
    district: postInfo?.district || geo?.city || '',
    state: postInfo?.state || geo?.state || '',
    latitude: geo?.latitude ?? geo?.lat ?? null,
    longitude: geo?.longitude ?? geo?.lng ?? null,
    displayName: postInfo
      ? `${postInfo.area ? postInfo.area + ', ' : ''}${postInfo.district}, ${postInfo.state} - ${cleanPin}`
      : geo?.displayName || cleanPin
  };
};
