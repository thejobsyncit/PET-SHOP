import express from 'express';
import Listing from '../models/Listing.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

const router = express.Router();

// GET all listings (filtered by petType)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { petType } = req.query;
    let listings = [];

    if (isDbConnected()) {
      const query = {};
      if (petType) query.petType = petType;
      
      // Auto-delete listings sold out > 48 hours ago
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      await Listing.deleteMany({ soldOutAt: { $lt: twoDaysAgo } });
      
      listings = await Listing.find(query).populate('user', 'name email');
    } else {
      listings = readMockData('listings');
      // Auto-remove sold out > 48 hours ago
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const filteredListings = listings.filter(l => {
        if (l.soldOutAt && new Date(l.soldOutAt) < twoDaysAgo) return false;
        return true;
      });
      if (listings.length !== filteredListings.length) {
        writeMockData('listings', filteredListings);
        listings = filteredListings;
      }
      
      if (petType) {
        listings = listings.filter(l => l.petType === petType);
      }
    }
    // Filter logic for verification
    const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN');
    
    if (!isAdmin) {
      listings = listings.filter(l => {
        const isOwner = req.user && (
          (l.user?._id?.toString() === req.user._id?.toString()) || 
          (l.user?.toString() === req.user._id?.toString())
        );
        return l.isVerified === true || isOwner;
      });
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
    const { title, petType, breed, age, price, description, images, location, contactPhone, quantity, vaccinationCertificate } = req.body;
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
        vaccinationCertificate: vaccinationCertificate || null,
        contactPhone,
        quantity: parseInt(quantity) || 1
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
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'],
        location,
        vaccinationCertificate: vaccinationCertificate || null,
        contactPhone,
        isVerified: false,
        quantity: parseInt(quantity) || 1,
        soldCount: 0,
        status: 'Available',
        soldOutAt: null,
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
      if (listing.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
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
      if (lOwnerId !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
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

// PUT buy 1 quantity (for buyers)
router.put('/:id/buy', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      
      if (listing.quantity > 0) {
        listing.quantity -= 1;
        listing.soldCount = (listing.soldCount || 0) + 1;
        if (listing.quantity === 0) {
          listing.status = 'Sold Out';
          listing.soldOutAt = new Date();
        }
        await listing.save();
      }
      return res.json({ success: true, listing });
    } else {
      const listings = readMockData('listings');
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Listing not found' });

      if (listings[idx].quantity > 0) {
        listings[idx].quantity -= 1;
        listings[idx].soldCount = (listings[idx].soldCount || 0) + 1;
        if (listings[idx].quantity === 0) {
          listings[idx].status = 'Sold Out';
          listings[idx].soldOutAt = new Date().toISOString();
        }
        writeMockData('listings', listings);
      }
      
      return res.json({ success: true, listing: listings[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT sell 1 quantity
router.put('/:id/sell', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      
      // Ensure is owner or admin
      if (listing.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      if (listing.quantity > 0) {
        listing.quantity -= 1;
        listing.soldCount = (listing.soldCount || 0) + 1;
        if (listing.quantity === 0) {
          listing.status = 'Sold Out';
          listing.soldOutAt = new Date();
        }
        await listing.save();
      }
      return res.json({ success: true, listing });
    } else {
      const listings = readMockData('listings');
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Listing not found' });

      const lOwnerId = listings[idx].user?._id || listings[idx].user;
      if (lOwnerId !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      if (listings[idx].quantity > 0) {
        listings[idx].quantity -= 1;
        listings[idx].soldCount = (listings[idx].soldCount || 0) + 1;
        if (listings[idx].quantity === 0) {
          listings[idx].status = 'Sold Out';
          listings[idx].soldOutAt = new Date().toISOString();
        }
        writeMockData('listings', listings);
      }
      
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
    console.error("Verify Listing Error: ", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE listing
router.delete('/:id', protect, async (req, res) => {
  try {
    if (isDbConnected()) {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

      if (listing.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      await listing.deleteOne();
      res.json({ success: true, message: 'Listing removed' });
    } else {
      const listings = readMockData('listings');
      const idx = listings.findIndex(l => l._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Listing not found' });

      const lOwnerId = listings[idx].user?._id || listings[idx].user;
      if (lOwnerId !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
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
