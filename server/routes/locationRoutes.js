import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  calculateHaversineDistance,
  geocodeAddress,
  reverseGeocode,
  lookupPincode,
  lookupCityCoordsFallback,
  geolocateByIp
} from '../utils/locationUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const router = express.Router();

const readJsonSafe = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * GET /api/location/pincode/:pincode
 * Free India Post Pincode API + Nominatim coordinates
 */
router.get('/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const cleanPin = String(pincode || '').replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit Indian pincode.' });
    }

    const result = await lookupPincode(cleanPin);
    if (!result) {
      return res.status(404).json({ success: false, message: `Pincode ${cleanPin} not found.` });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to lookup pincode', error: error.message });
  }
});

/**
 * GET /api/location/geocode?q=...
 * Forward geocode an address or city name to lat/lng
 */
router.get('/geocode', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter q is required.' });
    }

    const result = await geocodeAddress(q);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Could not locate that address.' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Geocoding failed', error: error.message });
  }
});

/**
 * GET /api/location/reverse?lat=...&lng=...
 * Reverse geocode coordinates to city/area/pincode
 */
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng query parameters are required.' });
    }

    const result = await reverseGeocode(lat, lng);
    if (!result) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates.' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Reverse geocoding failed', error: error.message });
  }
});

/**
 * GET /api/location/ip-locate
 * Free IP-based geolocation fallback when browser GPS is denied or unavailable
 */
router.get('/ip-locate', async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = Array.isArray(forwarded)
      ? forwarded[0]
      : (forwarded || req.ip || req.socket?.remoteAddress || '').split(',')[0].trim();

    const result = await geolocateByIp(clientIp);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Could not detect location via network.' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'IP location lookup failed', error: error.message });
  }
});

/**
 * POST /api/location/nearby-providers
 * Filter and sort registered service providers by Haversine distance
 */
router.post('/nearby-providers', (req, res) => {
  try {
    const { lat, lng, radiusKm = 25, category } = req.body || {};
    const userLat = Number(lat);
    const userLng = Number(lng);
    const maxRadius = Number(radiusKm) || 25;

    const providers = readJsonSafe('service_providers.json');
    const users = readJsonSafe('users.json').filter((u) => u.role === 'SERVICE_PROVIDER');

    // Merge deduplicated providers
    const map = new Map();
    [...users, ...providers].forEach((p) => {
      const key = p.email ? p.email.toLowerCase() : p.id;
      if (key) map.set(key, { ...(map.get(key) || {}), ...p });
    });

    let list = Array.from(map.values()).filter((p) => {
      if (category && category !== 'ALL') {
        const cat = String(p.serviceCategory || p.service_category || '').toLowerCase();
        return cat.includes(String(category).toLowerCase());
      }
      return true;
    });

    if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
      list = list
        .map((p) => {
          let pLat = Number(p.latitude);
          let pLng = Number(p.longitude);
          if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) {
            const fallback = lookupCityCoordsFallback(p.city || p.location || p.address || '');
            if (fallback) {
              pLat = fallback.lat;
              pLng = fallback.lng;
            }
          }
          const distanceKm =
            Number.isFinite(pLat) && Number.isFinite(pLng)
              ? calculateHaversineDistance(userLat, userLng, pLat, pLng)
              : null;

          return {
            id: p.id,
            name: p.businessName || p.business_name || p.name,
            serviceCategory: p.serviceCategory || p.service_category,
            city: p.city || '',
            state: p.state || '',
            location: p.location || '',
            pincode: p.pincode || '',
            latitude: Number.isFinite(pLat) ? pLat : null,
            longitude: Number.isFinite(pLng) ? pLng : null,
            serviceRadius: Number(p.serviceRadius || p.service_radius) || 15,
            verificationStatus: p.verificationStatus || p.verification_status || 'Pending',
            distanceKm
          };
        })
        .filter((p) => p.distanceKm === null || p.distanceKm <= maxRadius)
        .sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    }

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search nearby providers', error: error.message });
  }
});

export default router;
