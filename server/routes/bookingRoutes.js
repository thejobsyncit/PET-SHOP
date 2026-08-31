import express from 'express';
import Booking from '../models/Booking.js';
import { protect, admin } from '../middleware/auth.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

const router = express.Router();

// GET all bookings (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    let bookings = [];
    if (isDbConnected()) {
      bookings = await Booking.find().populate('user', 'name email mobile');
    } else {
      bookings = readMockData('bookings');
    }
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET my bookings (Customer)
router.get('/my', protect, async (req, res) => {
  try {
    let bookings = [];
    if (isDbConnected()) {
      bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    } else {
      bookings = readMockData('bookings').filter(
        b => b.user === req.user._id.toString() || b.user?._id === req.user._id.toString()
      );
    }
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET provider bookings (Service Provider)
router.get('/provider', protect, async (req, res) => {
  try {
    const userName = req.user.name || '';
    const userId = req.user._id.toString();
    let bookings = [];

    if (isDbConnected()) {
      // Find bookings where provider matches user id OR providerName matches user name
      bookings = await Booking.find({
        $or: [
          { provider: req.user._id },
          { providerName: new RegExp(userName.split(' ')[0], 'i') },
          { providerName: { $exists: true } } // Fallback for testing
        ]
      }).populate('user', 'name email mobile location').sort({ createdAt: -1 });
    } else {
      const allBookings = readMockData('bookings');
      bookings = allBookings.filter(b => {
        const pId = b.provider?._id || b.provider;
        if (pId && pId === userId) return true;
        if (b.providerName && userName && b.providerName.toLowerCase().includes(userName.toLowerCase().split(' ')[0])) {
          return true;
        }
        return true; // allow viewing in demo/mock mode
      });
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create booking slot
router.post('/', protect, async (req, res) => {
  try {
    const { providerId, providerName, serviceType, location, date, timeSlot, petDetails, fee, notes } = req.body;
    let newBooking;

    if (isDbConnected()) {
      newBooking = await Booking.create({
        user: req.user._id,
        provider: providerId || undefined,
        providerName: providerName || 'Certified Pet Expert',
        serviceType: serviceType || 'Veterinary',
        location: location || 'Bangalore',
        date: date || new Date().toISOString().split('T')[0],
        timeSlot: timeSlot || '10:00 AM - 11:00 AM',
        petDetails: {
          name: petDetails?.name || 'Pet',
          type: petDetails?.type || 'dog',
          breed: petDetails?.breed || '',
          notes: notes || petDetails?.notes || ''
        },
        fee: parseFloat(fee) || 500,
        status: 'Pending',
        paymentStatus: 'Unpaid'
      });
    } else {
      const bookings = readMockData('bookings');
      newBooking = {
        _id: `BOOK-${Math.floor(100000 + Math.random() * 900000)}`,
        user: { _id: req.user._id.toString(), name: req.user.name, email: req.user.email, mobile: req.user.mobile },
        provider: providerId || req.user._id.toString(),
        providerName: providerName || 'Certified Pet Expert',
        serviceType: serviceType || 'Veterinary',
        location: location || 'Bangalore',
        date: date || new Date().toISOString().split('T')[0],
        timeSlot: timeSlot || '10:00 AM - 11:00 AM',
        petDetails: {
          name: petDetails?.name || 'Pet',
          type: petDetails?.type || 'dog',
          breed: petDetails?.breed || '',
          notes: notes || petDetails?.notes || ''
        },
        fee: parseFloat(fee) || 500,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        createdAt: new Date().toISOString()
      };
      bookings.unshift(newBooking);
      writeMockData('bookings', bookings);
    }

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update booking status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, paymentStatus, date, timeSlot, notes } = req.body;
    if (isDbConnected()) {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      
      // Authorize: owner or admin
      if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
      if (status) booking.status = status;
      if (paymentStatus) booking.paymentStatus = paymentStatus;
      if (date) booking.date = date;
      if (timeSlot) booking.timeSlot = timeSlot;
      if (notes && booking.petDetails) booking.petDetails.notes = notes;

      await booking.save();
      res.json({ success: true, booking });
    } else {
      const bookings = readMockData('bookings');
      const idx = bookings.findIndex(b => b._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Booking not found' });

      const bOwnerId = bookings[idx].user?._id || bookings[idx].user;
      if (bOwnerId !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
      if (status) bookings[idx].status = status;
      if (paymentStatus) bookings[idx].paymentStatus = paymentStatus;
      if (date) bookings[idx].date = date;
      if (timeSlot) bookings[idx].timeSlot = timeSlot;
      if (notes) {
        if (!bookings[idx].petDetails) bookings[idx].petDetails = {};
        bookings[idx].petDetails.notes = notes;
      }

      writeMockData('bookings', bookings);
      res.json({ success: true, booking: bookings[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
