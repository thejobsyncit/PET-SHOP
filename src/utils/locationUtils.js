// Client-side Location, Distance (Haversine) & Coordinate Utilities (₹0 Cost)

const USER_LOCATION_STORAGE_KEY = 'joshpetshub_user_location';

export const CITY_COORDINATES = {
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  whitefield: { lat: 12.9698, lng: 77.7500 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  hsr: { lat: 12.9121, lng: 77.6446 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bandra: { lat: 19.0596, lng: 72.8295 },
  juhu: { lat: 19.1075, lng: 72.8263 },
  andheri: { lat: 19.1136, lng: 72.8697 },
  powai: { lat: 19.1176, lng: 72.9060 },
  pune: { lat: 18.5204, lng: 73.8567 },
  koregaon: { lat: 18.5362, lng: 73.8940 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'hauz khas': { lat: 28.5494, lng: 77.2001 },
  'greater kailash': { lat: 28.5482, lng: 77.2380 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.3910 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  'jubilee hills': { lat: 17.4326, lng: 78.4071 },
  'banjara hills': { lat: 17.4156, lng: 78.4347 },
  gachibowli: { lat: 17.4401, lng: 78.3489 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  adyar: { lat: 13.0012, lng: 80.2565 },
  anna: { lat: 13.0850, lng: 80.2101 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  'salt lake': { lat: 22.5867, lng: 88.4171 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  ernakulam: { lat: 9.9816, lng: 76.2999 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  patna: { lat: 25.5941, lng: 85.1376 },
  bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  guwahati: { lat: 26.1445, lng: 91.7362 },
  goa: { lat: 15.2993, lng: 74.1240 },
  panaji: { lat: 15.4909, lng: 73.8278 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  ludhiana: { lat: 30.9010, lng: 75.8573 },
  amritsar: { lat: 31.6340, lng: 74.8723 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  thane: { lat: 19.2183, lng: 72.9781 },
  mangalore: { lat: 12.9141, lng: 74.8560 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  vijayawada: { lat: 16.5062, lng: 80.6480 },
  india: { lat: 20.5937, lng: 78.9629 }
};

/**
 * Haversine distance between two coordinates in kilometers (1 decimal place)
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (![nLat1, nLon1, nLat2, nLon2].every((v) => Number.isFinite(v))) {
    return null;
  }

  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
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
 * Deterministic small jitter (~0.5 - 2 km) based on item ID so providers in the
 * same city don't stack on identical coordinates on the map.
 */
const hashOffset = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  const latOff = ((hash % 100) / 100 - 0.5) * 0.03;
  const lngOff = (((hash >> 7) % 100) / 100 - 0.5) * 0.03;
  return { latOff, lngOff };
};

/**
 * Resolve { lat, lng } for any provider / listing object
 */
export const resolveItemCoordinates = (item) => {
  if (!item) return null;

  const explicitLat = Number(item.latitude ?? item.lat);
  const explicitLng = Number(item.longitude ?? item.lng ?? item.lon);
  if (Number.isFinite(explicitLat) && Number.isFinite(explicitLng) && explicitLat !== 0 && explicitLng !== 0) {
    return { lat: explicitLat, lng: explicitLng };
  }

  const areaLower = String(item.area || '').toLowerCase();
  const cityLower = String(item.city || '').toLowerCase();
  const locationLower = String(item.location || '').toLowerCase();
  const stateLower = String(item.state || '').toLowerCase();

  let base = null;
  const searchStr = `${areaLower} ${cityLower} ${locationLower} ${stateLower}`;

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (key !== 'india' && searchStr.includes(key)) {
      base = coords;
      break;
    }
  }

  if (!base) {
    base = CITY_COORDINATES.bangalore;
  }

  const { latOff, lngOff } = hashOffset(String(item.id || item.name || item.clinicName || 'default'));
  return {
    lat: Math.round((base.lat + latOff) * 10000) / 10000,
    lng: Math.round((base.lng + lngOff) * 10000) / 10000
  };
};

export const getStoredUserLocation = () => {
  try {
    const raw = localStorage.getItem(USER_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Number.isFinite(Number(parsed.latitude)) && Number.isFinite(Number(parsed.longitude))) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveUserLocation = (locationObj) => {
  try {
    localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(locationObj));
    window.dispatchEvent(new CustomEvent('user-location-updated', { detail: locationObj }));
  } catch {
    // Ignore storage errors
  }
};

export const clearUserLocation = () => {
  try {
    localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('user-location-updated', { detail: null }));
  } catch {
    // Ignore storage errors
  }
};
