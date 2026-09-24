<<<<<<< HEAD
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';
=======
import { supabase } from '../config/supabase.js';
>>>>>>> origin/main

// @desc    Upload a prescription
// @route   POST /api/prescriptions
// @access  Private
export const uploadPrescription = async (req, res) => {
  try {
    const { fileUrl, notes, doctorName } = req.body;
    const userId = req.user._id || req.user.id;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Prescription file is required' });
    }

    const { data: prescription, error } = await supabase.from('prescriptions').insert([{
      user_id: userId,
      file_url: fileUrl,
      notes,
      doctor_name: doctorName,
      status: 'Pending'
    }]).select().single();

<<<<<<< HEAD
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
        _id: 'rx_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
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
=======
    if (error) throw error;
    res.status(201).json({ success: true, prescription });
>>>>>>> origin/main
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's prescriptions
// @route   GET /api/prescriptions/my
// @access  Private
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { data: prescriptions, error } = await supabase.from('prescriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, prescriptions: prescriptions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update prescription status (Admin only)
// @route   PUT /api/prescriptions/:id
// @access  Private/Admin
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const { data: prescription, error } = await supabase.from('prescriptions').update({
      status, remarks
    }).eq('id', id).select().single();

    if (error) throw error;
    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all prescriptions (Admin only)
// @route   GET /api/prescriptions
// @access  Private/Admin
export const getAllPrescriptions = async (req, res) => {
  try {
    const { data: prescriptions, error } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, prescriptions: prescriptions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single prescription by ID (Admin only)
// @route   GET /api/prescriptions/:id
// @access  Private/Admin
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: prescription, error } = await supabase.from('prescriptions').select('*').eq('id', id).single();
    if (error || !prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
