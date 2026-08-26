import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
import mongoose from 'mongoose';

// @desc    Submit a prescription
// @route   POST /api/prescriptions
// @access  Private
export const uploadPrescription = async (req, res) => {
  const { patientName, veterinarianName, clinicName, customerComments, items } = req.body;
  const userId = req.user._id || req.user.id;

  let fileUrl = '';
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.prescriptionFileUrl) {
    fileUrl = req.body.prescriptionFileUrl;
  }

  if (!patientName || !veterinarianName || !fileUrl) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide pet name, vet name, and upload a prescription document' 
    });
  }

  try {
    let parsedItems = [];
    if (items) {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    }

    if (isDbConnected()) {
      const newPrescription = new Prescription({
        user: userId,
        patientName,
        veterinarianName,
        clinicName,
        customerComments,
        prescriptionFileUrl: fileUrl,
        items: parsedItems
      });

      const saved = await newPrescription.save();

      // Add to user's history
      await User.findByIdAndUpdate(userId, {
        $push: { prescriptionHistory: saved._id }
      });

      res.status(201).json({ success: true, prescription: saved });
    } else {
      const prescriptionsList = readMockData('prescriptions');
      const usersList = readMockData('users');

      const newPrescription = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: userId.toString(),
        patientName,
        veterinarianName,
        clinicName,
        customerComments,
        prescriptionFileUrl: fileUrl,
        status: 'Pending',
        items: parsedItems,
        createdAt: new Date().toISOString()
      };

      prescriptionsList.push(newPrescription);
      writeMockData('prescriptions', prescriptionsList);

      // Add to user history
      const uIdx = usersList.findIndex(u => u._id.toString() === userId.toString());
      if (uIdx !== -1) {
        usersList[uIdx].prescriptionHistory = usersList[uIdx].prescriptionHistory || [];
        usersList[uIdx].prescriptionHistory.push(newPrescription._id);
        writeMockData('users', usersList);
      }

      res.status(201).json({ success: true, prescription: newPrescription });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's prescriptions
// @route   GET /api/prescriptions/my
// @access  Private
export const getMyPrescriptions = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected()) {
      const prescriptions = await Prescription.find({ user: userId }).sort({ createdAt: -1 });
      res.json({ success: true, prescriptions });
    } else {
      const prescriptionsList = readMockData('prescriptions');
      const myPrescriptions = prescriptionsList
        .filter(p => p.user.toString() === userId.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, prescriptions: myPrescriptions });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req, res) => {
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      const prescription = await Prescription.findById(id).populate('user', 'name email');
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }
      res.json({ success: true, prescription });
    } else {
      const prescriptionsList = readMockData('prescriptions');
      const usersList = readMockData('users');
      const prescription = prescriptionsList.find(p => p._id.toString() === id.toString());

      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }

      const userObj = usersList.find(u => u._id.toString() === prescription.user.toString());
      const populated = {
        ...prescription,
        user: userObj ? { _id: userObj._id, name: userObj.name, email: userObj.email } : { name: 'Unknown User' }
      };

      res.json({ success: true, prescription: populated });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all prescriptions (Admin only)
// @route   GET /api/prescriptions
// @access  Private/Admin
export const getAllPrescriptions = async (req, res) => {
  try {
    if (isDbConnected()) {
      const prescriptions = await Prescription.find({}).populate('user', 'name email').sort({ createdAt: -1 });
      res.json({ success: true, prescriptions });
    } else {
      const prescriptionsList = readMockData('prescriptions');
      const usersList = readMockData('users');
      
      const populated = prescriptionsList.map(p => {
        const userObj = usersList.find(u => u._id.toString() === p.user.toString());
        return {
          ...p,
          user: userObj ? { _id: userObj._id, name: userObj.name, email: userObj.email } : { name: 'Unknown User' }
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, prescriptions: populated });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify prescription status (Admin only)
// @route   PUT /api/prescriptions/:id/status
// @access  Private/Admin
export const verifyPrescription = async (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  try {
    if (isDbConnected()) {
      const prescription = await Prescription.findById(id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }

      prescription.status = status;
      prescription.reviewNotes = reviewNotes;
      prescription.reviewedBy = req.user._id;

      await prescription.save();
      res.json({ success: true, prescription });
    } else {
      const prescriptionsList = readMockData('prescriptions');
      const idx = prescriptionsList.findIndex(p => p._id.toString() === id.toString());

      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }

      prescriptionsList[idx].status = status;
      prescriptionsList[idx].reviewNotes = reviewNotes;
      prescriptionsList[idx].reviewedBy = (req.user._id || req.user.id).toString();

      writeMockData('prescriptions', prescriptionsList);
      res.json({ success: true, prescription: prescriptionsList[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
