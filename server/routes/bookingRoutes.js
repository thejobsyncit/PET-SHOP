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
      bookings = await Booking.find().populate('user', 'name email');
    } else {
      bookings = readMockData('bookings');
    }
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET my bookings
router.get('/my', protect, async (req, res) => {
  try {
    let bookings = [];
    if (isDbConnected()) {
      bookings = await Booking.find({ user: req.user._id });
    } else {
      bookings = readMockData('bookings').filter(b => b.user === req.user._id.toString() || b.user?._id === req.user._id.toString());
    }
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create booking slot
router.post('/', protect, async (req, res) => {
  try {
    const { providerName, serviceType, location, date, timeSlot, petDetails, fee } = req.body;
    let newBooking;

    if (isDbConnected()) {
      newBooking = await Booking.create({
        user: req.user._id,
        providerName,
        serviceType,
        location,
        date,
        timeSlot,
        petDetails,
        fee
      });
    } else {
      const bookings = readMockData('bookings');
      newBooking = {
        _id: `BOOK-${Math.floor(100000 + Math.random() * 900000)}`,
        user: { _id: req.user._id.toString(), name: req.user.name, email: req.user.email },
        providerName,
        serviceType,
        location,
        date,
        timeSlot,
        petDetails,
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
    const { status, paymentStatus } = req.body;
    if (isDbConnected()) {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      
      // Authorize: owner or admin
      if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      if (status) booking.status = status;
      if (paymentStatus) booking.paymentStatus = paymentStatus;
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

      writeMockData('bookings', bookings);
      res.json({ success: true, booking: bookings[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
