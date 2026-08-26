import express from 'express';
import Listing from '../models/Listing.js';
import { protect, admin } from '../middleware/auth.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

const router = express.Router();

// GET all listings (filtered by petType)
router.get('/', async (req, res) => {
  try {
    const { petType } = req.query;
    let listings = [];

    if (isDbConnected()) {
      const query = {};
      if (petType) query.petType = petType;
      listings = await Listing.find(query).populate('user', 'name email');
    } else {
      listings = readMockData('listings');
      if (petType) {
        listings = listings.filter(l => l.petType === petType);
      }
    }

    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET my listings
router.get('/my', protect, async (req, res) => {
  try {
    let listings = [];
    if (isDbConnected()) {
      listings = await Listing.find({ user: req.user._id });
    } else {
      listings = readMockData('listings').filter(l => l.user === req.user._id.toString() || l.user?._id === req.user._id.toString());
    }
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create listing
router.post('/', protect, async (req, res) => {
  try {
    const { title, petType, breed, age, price, description, images, location, contactPhone } = req.body;
    let newListing;

    if (isDbConnected()) {
      newListing = await Listing.create({
        user: req.user._id,
        title,
        petType,
        breed,
        age,
        price,
        description,
        images,
        location,
        contactPhone
      });
    } else {
      const listings = readMockData('listings');
      newListing = {
        _id: `LIST-${Math.floor(100000 + Math.random() * 900000)}`,
        user: { _id: req.user._id.toString(), name: req.user.name, email: req.user.email },
        title,
        petType,
        breed,
        age,
        price: parseFloat(price) || 0,
        description,
        images: images || ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'],
        location,
        contactPhone,
        isVerified: false,
        status: 'Available',
        createdAt: new Date().toISOString()
      };
      listings.unshift(newListing);
      writeMockData('listings', listings);
    }

    res.status(201).json({ success: true, listing: newListing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update status (Sold/Available/Adopted)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected()) {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      
      // Ensure is owner or admin
      if (listing.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      listing.status = status;
      await listing.save();
      return res.json({ success: true, listing });
    } else {
      const listings = readMockData('listings');
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Listing not found' });

      const lOwnerId = listings[idx].user?._id || listings[idx].user;
      if (lOwnerId !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      listings[idx].status = status;
      writeMockData('listings', listings);
      return res.json({ success: true, listing: listings[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT verify listing (Admin only)
router.put('/:id/verify', protect, admin, async (req, res) => {
  try {
    const { isVerified } = req.body;
    if (isDbConnected()) {
      const listing = await Listing.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      res.json({ success: true, listing });
    } else {
      const listings = readMockData('listings');
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Listing not found' });

      listings[idx].isVerified = isVerified;
      writeMockData('listings', listings);
      res.json({ success: true, listing: listings[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE listing
router.delete('/:id', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

      if (listing.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      await listing.deleteOne();
      res.json({ success: true, message: 'Listing removed' });
    } else {
      const listings = readMockData('listings');
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Listing not found' });

      const lOwnerId = listings[idx].user?._id || listings[idx].user;
      if (lOwnerId !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      listings.splice(idx, 1);
      writeMockData('listings', listings);
      res.json({ success: true, message: 'Listing removed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
