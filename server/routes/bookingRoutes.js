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
    const queryMobile = (req.query.mobile || req.query.phone || '').replace(/\D/g, '').slice(-10);

    let allBookings = [...diskBookings];

    if (supabase) {
      try {
        let sbQuery = supabase.from('bookings').select('*');
        if (queryUserId && queryUserId !== 'usr-custom') {
          sbQuery = sbQuery.eq('user_id', queryUserId);
        }
        const { data: sbData, error } = await sbQuery;
        if (!error && Array.isArray(sbData)) {
          const ids = new Set(allBookings.map(b => b.id || b._id));
          for (const item of sbData) {
            const rawItem = item.details ? { ...item.details, ...item } : item;
            if (!ids.has(rawItem.id || rawItem._id)) {
              allBookings.push(rawItem);
            }
          }
        }
      } catch (sbErr) {
        console.warn('[Bookings] Supabase /bookings/my fetch fallback:', sbErr?.message);
      }
    }

    if (queryEmail || (queryUserId && queryUserId !== 'usr-custom') || queryMobile) {
      const filtered = allBookings.filter(b => {
        const bEmail = (b.userEmail || b.ownerEmail || b.customerEmail || b.email || b.user?.email || b.pet_details?.userEmail || '').toLowerCase().trim();
        const bUserId = String(b.userId || b.customerId || b.user_id || (typeof b.user === 'string' ? b.user : b.user?._id || b.user?.id) || '').trim();
        const bPhone = (b.userPhone || b.customerPhone || b.ownerPhone || b.mobile || b.phone || b.pet_details?.userPhone || '').replace(/\D/g, '').slice(-10);

        // Strict isolation: if both records have an email and they differ, they can NEVER match
        if (queryEmail && bEmail && queryEmail !== bEmail) return false;

        // Strict isolation: if both records have a valid user ID and they differ, they can NEVER match
        if (queryUserId && queryUserId !== 'usr-custom' && bUserId && bUserId !== 'usr-custom' && queryUserId !== bUserId) return false;

        // Match 1: User ID
        if (queryUserId && queryUserId !== 'usr-custom' && bUserId && bUserId === queryUserId) return true;

        // Match 2: Email
        if (queryEmail && bEmail && bEmail === queryEmail) return true;

        // Match 3: Phone fallback (strictly ignored for common dummy/placeholder numbers like 9876543210)
        const isGenericPhone = !bPhone || bPhone === '9876543210' || bPhone === '9000000000' || bPhone === '9000000001' || bPhone === '9000000002';
        if (!isGenericPhone && queryMobile && queryMobile.length >= 10 && bPhone && (bPhone === queryMobile || bPhone.endsWith(queryMobile) || queryMobile.endsWith(bPhone))) {
          return true;
        }
        return false;
      });
      return res.json({ success: true, bookings: filtered, data: filtered });
    }

    return res.json({ success: true, bookings: [], data: [] });
  } catch (err) {
    console.error('Error in /bookings/my:', err);
    return res.json({ success: true, bookings: [], data: [] });
  }
});

// POST /api/bookings - Create new service booking (e.g. Grooming, Vet, Walking, Transport)
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const prefix = (body.serviceType && body.serviceType.toLowerCase().includes('vet')) || body.doctorId
      ? 'VET-'
      : ((body.serviceType && body.serviceType.toLowerCase().includes('transport')) ? 'TRP-'
      : ((body.serviceType && body.serviceType.toLowerCase().includes('hostel')) ? 'HSTBK-'
      : ((body.serviceType && body.serviceType.toLowerCase().includes('walk')) ? 'WALK-'
      : ((body.serviceType && body.serviceType.toLowerCase().includes('train')) ? 'TRN-BK-'
      : 'GRM-'))));
    const bookingId = body.id || body._id || `${prefix}${Date.now().toString().slice(-6)}`;
    const newBooking = {
      _id: bookingId,
      id: bookingId,
      bookingId: bookingId,
      service_type: body.service_type || body.serviceType || body.serviceCategory || 'Service',
      ...body,
      status: body.status || 'Confirmed',
      paymentStatus: body.paymentStatus || ((body.serviceType && body.serviceType.toLowerCase().includes('vet')) ? 'Pay at Clinic' : 'Pay on Service'),
      createdAt: body.createdAt || new Date().toISOString()
    };

    const existing = loadDiskBookings();
    const updated = [newBooking, ...existing.filter(b => (b.id || b._id) !== bookingId)];
    saveDiskBookings(updated);

    // Try persisting to Supabase if table exists
    if (supabase) {
      try {
        await supabase.from('bookings').insert([{
          id: bookingId,
          user_id: newBooking.userId || newBooking.user_id || newBooking.customerId || null,
          service_type: newBooking.service_type || newBooking.serviceType || 'Service',
          provider_name: newBooking.providerName || newBooking.provider_name || 'Josh Pets Hub',
          location: newBooking.location || (newBooking.departureCity && newBooking.destinationCity ? `${newBooking.departureCity} ➔ ${newBooking.destinationCity}` : (newBooking.departureCity || 'Pan-India')),
          date: newBooking.date || newBooking.bookingDate || newBooking.expectedDate || null,
          time_slot: newBooking.timeSlot || newBooking.time_slot || null,
          fee: Number(newBooking.fee || newBooking.quoteAmount || 0),
          total_amount: Number(newBooking.totalAmount || newBooking.fee || newBooking.quoteAmount || 0),
          status: newBooking.status || 'Confirmed',
          payment_status: newBooking.paymentStatus || newBooking.payment_status || 'Pending',
          pet_details: {
            petName: newBooking.petName || 'Pet',
            petSpecies: newBooking.petSpecies || 'Dog',
            petBreed: newBooking.petBreed || 'Domestic Companion',
            userEmail: newBooking.userEmail || newBooking.customerEmail || newBooking.email,
            userPhone: newBooking.userPhone || newBooking.customerPhone || newBooking.phone || newBooking.mobile
          },
          details: newBooking
        }]);
      } catch (sbErr) {
        console.warn('[Bookings] Supabase insert fallback notice:', sbErr?.message);
      }
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

// GET /api/bookings - All bookings
router.get('/', async (req, res) => {
  try {
    const diskBookings = loadDiskBookings();
    let allBookings = [...diskBookings];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const ids = new Set(allBookings.map(b => b.id || b._id));
          for (const item of data) {
            const rawItem = item.details ? { ...item.details, ...item } : item;
            if (!ids.has(rawItem.id || rawItem._id)) {
              allBookings.push(rawItem);
            }
          }
        }
      } catch (_) {}
    }
    return res.json({ success: true, bookings: allBookings, data: allBookings });
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
    const updated = diskBookings.map(b => {
      if (b.id === id || b._id === id) {
        const nextStatus = body.status || b.status;
        let settlementStatus = body.settlementStatus || b.settlementStatus;
        if (nextStatus === 'Completed' || nextStatus === 'confirmed_completed') {
          if (settlementStatus === 'Pending' || !settlementStatus) {
            settlementStatus = 'Available';
          }
        } else if (nextStatus === 'Cancelled' || nextStatus === 'Refunded') {
          settlementStatus = 'Refunded';
        }
        return {
          ...b,
          ...body,
          status: nextStatus,
          bookingStatus: nextStatus,
          settlementStatus: settlementStatus || 'Pending'
        };
      }
      return b;
    });
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
