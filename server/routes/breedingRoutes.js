import express from 'express';
import Breeding from '../models/Breeding.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

const router = express.Router();

// GET verified studs list
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { breed } = req.query;
    let studs = [];

    if (isDbConnected()) {
      const query = {};
      if (breed) query.breed = breed;
      studs = await Breeding.find(query).populate('user', 'name email');
    } else {
      studs = readMockData('breedings');
      if (breed) {
        studs = studs.filter(s => s.breed.toLowerCase().includes(breed.toLowerCase()));
      }
    }

    // Filter logic for verification
    const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN');
    
    if (!isAdmin) {
      studs = studs.filter(s => {
        const isOwner = req.user && (
          (s.user?._id?.toString() === req.user._id?.toString()) || 
          (s.user?.toString() === req.user._id?.toString())
        );
        return s.isVerified === true || isOwner;
      });
    }

    res.json({ success: true, studs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create breeding stud listing
router.post('/', protect, async (req, res) => {
  try {
    const { studName, petType, breed, age, kciNumber, studFee, description, images, location, contactPhone, pedigreeDetails } = req.body;
    let newStud;

    if (isDbConnected()) {
      newStud = await Breeding.create({
        user: req.user._id,
        studName,
        petType,
        breed,
        age,
        kciNumber,
        studFee,
        description,
        images,
        location,
        contactPhone,
        pedigreeDetails
      });
    } else {
      const breedings = readMockData('breedings');
      newStud = {
        _id: `STUD-${Math.floor(100000 + Math.random() * 900000)}`,
        user: { _id: req.user._id.toString(), name: req.user.name, email: req.user.email },
        studName,
        petType,
        breed,
        age,
        kciNumber,
        studFee: parseFloat(studFee) || 0,
        description,
        images: images || ['https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800'],
        pedigreeDetails: pedigreeDetails || { sire: 'Sire line', dam: 'Dam line' },
        location,
        contactPhone,
        isVerified: false, // Must be verified by admin
        createdAt: new Date().toISOString()
      };
      breedings.unshift(newStud);
      writeMockData('breedings', breedings);
    }

    res.status(201).json({ success: true, stud: newStud });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT verify stud listing (Admin KCI check)
router.put('/:id/verify', protect, admin, async (req, res) => {
  try {
    const { isVerified } = req.body;
    if (isDbConnected()) {
      const stud = await Breeding.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
      if (!stud) return res.status(404).json({ success: false, message: 'Stud profile not found' });
      res.json({ success: true, stud });
    } else {
      const breedings = readMockData('breedings');
      const idx = breedings.findIndex(s => s._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Stud profile not found' });

      breedings[idx].isVerified = isVerified;
      writeMockData('breedings', breedings);
      res.json({ success: true, stud: breedings[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
