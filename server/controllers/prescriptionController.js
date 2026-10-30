import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRESCRIPTIONS_FILE = path.join(__dirname, '..', 'data', 'prescriptions.json');

// Helper: load prescriptions from disk JSON
export const loadDiskPrescriptions = () => {
  try {
    if (fs.existsSync(PRESCRIPTIONS_FILE)) {
      const content = fs.readFileSync(PRESCRIPTIONS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Prescriptions] Error reading prescriptions.json:', err?.message);
  }
  return [];
};

// Helper: save prescriptions to disk JSON
export const saveDiskPrescriptions = (prescriptions) => {
  try {
    const dir = path.dirname(PRESCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRESCRIPTIONS_FILE, JSON.stringify(prescriptions, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Prescriptions] Error saving prescriptions.json:', err?.message);
  }
};

// @desc    Upload a prescription
// @route   POST /api/prescriptions
// @access  Private
export const uploadPrescription = async (req, res) => {
  try {
    const { 
      fileUrl: bodyFileUrl, 
      notes, 
      customerComments, 
      doctorName, 
      veterinarianName, 
      patientName, 
      clinicName 
    } = req.body || {};

    const userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Determine file URL: check uploaded file (multer) first, then request body
    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (bodyFileUrl) {
      fileUrl = bodyFileUrl;
    } else if (req.body?.prescriptionFileUrl) {
      fileUrl = req.body.prescriptionFileUrl;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Prescription file is required' });
    }

    const docName = doctorName || veterinarianName || 'Veterinarian';
    const finalNotes = customerComments || notes || '';
    const petName = patientName || 'Pet';
    const clinic = clinicName || '';
    const nowIso = new Date().toISOString();
    const generatedId = 'prsc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const userObj = {
      id: userId,
      _id: userId,
      name: req.user.name || 'Pet Parent',
      email: req.user.email || ''
    };

    const newPrescription = {
      id: generatedId,
      _id: generatedId,
      user_id: userId,
      userId: userId,
      user: userObj,
      file_url: fileUrl,
      prescriptionFileUrl: fileUrl,
      notes: finalNotes,
      customerComments: finalNotes,
      doctor_name: docName,
      veterinarianName: docName,
      patient_name: petName,
      patientName: petName,
      clinic_name: clinic,
      clinicName: clinic,
      status: 'Pending',
      remarks: '',
      reviewNotes: '',
      created_at: nowIso,
      createdAt: nowIso
    };

    let createdPrescription = null;

    // 1. Try Supabase if configured
    if (supabase) {
      try {
        const { data, error } = await supabase.from('prescriptions').insert([{
          user_id: userId,
          file_url: fileUrl,
          notes: finalNotes,
          doctor_name: docName,
          status: 'Pending'
        }]).select().single();

        if (!error && data) {
          createdPrescription = {
            ...newPrescription,
            ...data,
            _id: data.id || generatedId,
            id: data.id || generatedId,
            prescriptionFileUrl: data.file_url || fileUrl,
            file_url: data.file_url || fileUrl
          };
        }
      } catch (sbErr) {
        console.warn('[Prescription] Supabase insert notice, using disk fallback:', sbErr?.message);
      }
    }

    if (!createdPrescription) {
      createdPrescription = newPrescription;
    }

    // Always persist to disk fallback
    const existing = loadDiskPrescriptions();
    saveDiskPrescriptions([createdPrescription, ...existing]);

    return res.status(201).json({ 
      success: true, 
      prescription: createdPrescription 
    });
  } catch (error) {
    console.error('[Prescription] Upload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's prescriptions
// @route   GET /api/prescriptions/my
// @access  Private
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let prescriptions = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          prescriptions = data.map(p => ({
            ...p,
            _id: p.id,
            id: p.id,
            prescriptionFileUrl: p.file_url,
            createdAt: p.created_at,
            patientName: p.patient_name || 'Pet',
            veterinarianName: p.doctor_name || 'Veterinarian',
            clinicName: p.clinic_name || ''
          }));
        }
      } catch (sbErr) {
        console.warn('[Prescription] Supabase get error, falling back to disk:', sbErr?.message);
      }
    }

    if (prescriptions.length === 0) {
      const disk = loadDiskPrescriptions();
      prescriptions = disk.filter(p => String(p.user_id || p.userId) === String(userId));
    }

    return res.json({ success: true, prescriptions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update prescription status (Admin only)
// @route   PUT /api/prescriptions/:id/status or PUT /api/prescriptions/:id
// @access  Private/Admin
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, reviewNotes } = req.body;
    const finalRemarks = remarks || reviewNotes || '';

    let updatedPrescription = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .update({
            status,
            remarks: finalRemarks
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          updatedPrescription = {
            ...data,
            _id: data.id,
            prescriptionFileUrl: data.file_url,
            reviewNotes: finalRemarks
          };
        }
      } catch (sbErr) {
        console.warn('[Prescription] Supabase update status notice, using disk fallback:', sbErr?.message);
      }
    }

    // Always update disk storage
    const disk = loadDiskPrescriptions();
    const index = disk.findIndex(p => String(p.id) === String(id) || String(p._id) === String(id));
    if (index !== -1) {
      disk[index] = {
        ...disk[index],
        status: status || disk[index].status,
        remarks: finalRemarks || disk[index].remarks,
        reviewNotes: finalRemarks || disk[index].reviewNotes,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveDiskPrescriptions(disk);
      if (!updatedPrescription) {
        updatedPrescription = disk[index];
      }
    }

    if (!updatedPrescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    return res.json({ success: true, prescription: updatedPrescription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all prescriptions (Admin only)
// @route   GET /api/prescriptions
// @access  Private/Admin
export const getAllPrescriptions = async (req, res) => {
  try {
    let prescriptions = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          prescriptions = data.map(p => ({
            ...p,
            _id: p.id,
            id: p.id,
            prescriptionFileUrl: p.file_url,
            createdAt: p.created_at,
            patientName: p.patient_name || 'Pet',
            veterinarianName: p.doctor_name || 'Veterinarian',
            clinicName: p.clinic_name || ''
          }));
        }
      } catch (sbErr) {
        console.warn('[Prescription] Supabase get all error, falling back to disk:', sbErr?.message);
      }
    }

    if (prescriptions.length === 0) {
      prescriptions = loadDiskPrescriptions();
    }

    return res.json({ success: true, prescriptions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single prescription by ID (Admin only)
// @route   GET /api/prescriptions/:id
// @access  Private/Admin
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    let prescription = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          prescription = {
            ...data,
            _id: data.id,
            id: data.id,
            prescriptionFileUrl: data.file_url,
            createdAt: data.created_at
          };
        }
      } catch (sbErr) {
        console.warn('[Prescription] Supabase get by id error, falling back to disk:', sbErr?.message);
      }
    }

    if (!prescription) {
      const disk = loadDiskPrescriptions();
      prescription = disk.find(p => String(p.id) === String(id) || String(p._id) === String(id));
    }

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    return res.json({ success: true, prescription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
