import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKINGS_FILE = path.join(__dirname, '..', '..', 'server_data', 'bookings.json');

const loadDiskBookings = () => {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const content = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Bookings] Error reading bookings.json:', err?.message);
  }
  return [];
};

const saveDiskBookings = (bookings) => {
  try {
    const dir = path.dirname(BOOKINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Bookings] Error saving bookings.json:', err?.message);
  }
};

const router = express.Router();

// GET /api/bookings/provider - Provider service bookings
router.get('/provider', async (req, res) => {
  try {
    const diskBookings = loadDiskBookings();
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const ids = new Set(data.map(b => b.id || b._id));
        const merged = [...data, ...diskBookings.filter(b => !ids.has(b.id || b._id))];
        return res.json({ success: true, bookings: merged, data: merged });
      }
    } catch {
      // Supabase fallback
    }
    return res.json({ success: true, bookings: diskBookings, data: diskBookings });
  } catch (err) {
    console.error('Error in /bookings/provider:', err);
    return res.json({ success: true, bookings: loadDiskBookings(), data: loadDiskBookings() });
  }
});

// GET /api/bookings/my - Pet parent user service bookings
router.get('/my', async (req, res) => {
  try {
    const diskBookings = loadDiskBookings();
    const queryEmail = (req.query.email || req.headers['x-user-email'] || '').toLowerCase().trim();
    const queryUserId = String(req.query.userId || req.headers['x-user-id'] || '').trim();

    if (queryEmail || queryUserId) {
      const filtered = diskBookings.filter(b => {
        const bEmail = (b.userEmail || b.ownerEmail || b.customerEmail || b.email || b.user?.email || '').toLowerCase().trim();
        const bUserId = String(b.userId || b.customerId || b.user?._id || b.user?.id || '').trim();
        if (queryUserId && bUserId && bUserId === queryUserId) return true;
        if (queryEmail && bEmail && bEmail === queryEmail) return true;
        return false;
      });
      return res.json({ success: true, bookings: filtered, data: filtered });
    }

    return res.json({ success: true, bookings: diskBookings, data: diskBookings });
  } catch (err) {
    console.error('Error in /bookings/my:', err);
    return res.json({ success: true, bookings: [], data: [] });
  }
});

// POST /api/bookings - Create new service booking (e.g. Grooming, Vet, Walking)
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const prefix = (body.serviceType && body.serviceType.toLowerCase().includes('vet')) || body.doctorId
      ? 'VET-'
      : ((body.serviceType && body.serviceType.toLowerCase().includes('transport')) ? 'TRP-' : 'GRM-');
    const bookingId = body.id || body._id || `${prefix}${Date.now().toString().slice(-6)}`;
    const newBooking = {
      _id: bookingId,
      id: bookingId,
      ...body,
      status: body.status || 'Confirmed',
      paymentStatus: body.paymentStatus || ((body.serviceType && body.serviceType.toLowerCase().includes('vet')) ? 'Pay at Clinic' : 'Pay on Service'),
      createdAt: body.createdAt || new Date().toISOString()
    };

    const existing = loadDiskBookings();
    const updated = [newBooking, ...existing.filter(b => (b.id || b._id) !== bookingId)];
    saveDiskBookings(updated);

    // Try persisting to Supabase if table exists
    try {
      await supabase.from('bookings').insert([newBooking]);
    } catch {
      // Supabase table optional fallback
    }

    return res.status(201).json({
      success: true,
      booking: newBooking,
      data: newBooking,
      message: 'Booking confirmed successfully'
    });
  } catch (err) {
    console.error('Error in POST /bookings:', err);
    return res.status(500).json({ success: false, message: 'Failed to record booking' });
  }
});

// GET /api/bookings - All bookings for Admin/SuperAdmin
router.get('/', async (req, res) => {
  try {
    const diskBookings = loadDiskBookings();
    return res.json({ success: true, bookings: diskBookings, data: diskBookings });
  } catch (err) {
    console.error('Error in GET /bookings:', err);
    return res.json({ success: true, bookings: [], data: [] });
  }
});

// PATCH & PUT /api/bookings/:id/status - Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const diskBookings = loadDiskBookings();
    const updated = diskBookings.map(b => ((b.id === id || b._id === id) ? { ...b, ...body, status: body.status || b.status } : b));
    saveDiskBookings(updated);
    return res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (err) {
    console.error('Error updating booking status:', err);
    return res.status(500).json({ success: false, message: 'Failed to update booking status' });
  }
};
router.patch('/:id/status', updateBookingStatus);
router.put('/:id/status', updateBookingStatus);

// Fallback for any other booking routes
router.use((req, res) => res.json({ success: true, bookings: loadDiskBookings(), data: loadDiskBookings() }));

export default router;
