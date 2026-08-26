import express from 'express';
import Adoption from '../models/Adoption.js';
import { protect, admin } from '../middleware/auth.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

const router = express.Router();

// GET all rescue pets
router.get('/', async (req, res) => {
  try {
    const { petType } = req.query;
    let adoptions = [];

    if (isDbConnected()) {
      const query = {};
      if (petType) query.petType = petType;
      adoptions = await Adoption.find(query);
    } else {
      adoptions = readMockData('adoptions');
      if (petType) {
        adoptions = adoptions.filter(a => a.petType === petType);
      }
    }

    res.json({ success: true, adoptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create rescue pet record (Admin/Shelter rep)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { shelterName, shelterLocation, petName, petType, breed, age, rescueStory, image, healthStatus, adoptionFee } = req.body;
    let newAdoption;

    if (isDbConnected()) {
      newAdoption = await Adoption.create({
        shelterName,
        shelterLocation,
        petName,
        petType,
        breed,
        age,
        rescueStory,
        image,
        healthStatus,
        adoptionFee
      });
    } else {
      const adoptions = readMockData('adoptions');
      newAdoption = {
        _id: `ADOPT-${Math.floor(100000 + Math.random() * 900000)}`,
        shelterName,
        shelterLocation,
        petName,
        petType,
        breed,
        age,
        rescueStory,
        image: image || 'https://images.unsplash.com/photo-1484156818044-c040038b0719?q=80&w=800',
        healthStatus: healthStatus || { vaccinated: false, neutered: false, microchipped: false },
        adoptionFee: parseFloat(adoptionFee) || 0,
        inquiries: [],
        createdAt: new Date().toISOString()
      };
      adoptions.unshift(newAdoption);
      writeMockData('adoptions', adoptions);
    }

    res.status(201).json({ success: true, adoption: newAdoption });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST submit adoption inquiry
router.post('/:id/inquiry', protect, async (req, res) => {
  try {
    const { message, phone } = req.body;
    if (isDbConnected()) {
      const adoption = await Adoption.findById(req.params.id);
      if (!adoption) return res.status(404).json({ success: false, message: 'Adoption profile not found' });

      adoption.inquiries.push({
        user: req.user._id,
        message,
        phone,
        status: 'Pending'
      });
      await adoption.save();
      res.json({ success: true, adoption });
    } else {
      const adoptions = readMockData('adoptions');
      const idx = adoptions.findIndex(a => a._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Adoption profile not found' });

      const newInquiry = {
        _id: `INQ-${Math.floor(100000 + Math.random() * 900000)}`,
        user: { _id: req.user._id.toString(), name: req.user.name, email: req.user.email },
        message,
        phone,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      adoptions[idx].inquiries = adoptions[idx].inquiries || [];
      adoptions[idx].inquiries.push(newInquiry);
      writeMockData('adoptions', adoptions);
      res.json({ success: true, adoption: adoptions[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
