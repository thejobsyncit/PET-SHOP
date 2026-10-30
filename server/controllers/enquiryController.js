import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENQUIRIES_FILE = path.join(__dirname, '..', 'data', 'enquiries.json');
const SERVER_DATA_ENQUIRIES_FILE = path.join(__dirname, '..', '..', 'server_data', 'enquiries.json');

export const loadDiskEnquiries = () => {
  try {
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Enquiries] Error reading primary enquiries.json:', err?.message);
  }

  try {
    if (fs.existsSync(SERVER_DATA_ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(SERVER_DATA_ENQUIRIES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Enquiries] Error reading server_data enquiries.json:', err?.message);
  }

  return [];
};

export const saveDiskEnquiries = (enquiries) => {
  try {
    const dir = path.dirname(ENQUIRIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Enquiries] Error saving primary enquiries.json:', err?.message);
  }

  try {
    const dir2 = path.dirname(SERVER_DATA_ENQUIRIES_FILE);
    if (!fs.existsSync(dir2)) fs.mkdirSync(dir2, { recursive: true });
    fs.writeFileSync(SERVER_DATA_ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf8');
  } catch (_) {}
};

// @desc    Submit a new contact/enquiry message
// @route   POST /api/enquiries
// @access  Public
export const createEnquiry = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please enter all required fields.' });
  }

  const enqId = `ENQ-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const newEnquiry = {
    _id: enqId,
    id: enqId,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    subject: String(subject).trim(),
    message: String(message).trim(),
    status: 'Pending',
    createdAt: nowIso,
    created_at: nowIso
  };

  // 1. Always persist to disk first (zero data loss guarantee)
  try {
    const currentList = loadDiskEnquiries();
    const updatedList = [newEnquiry, ...currentList.filter(e => (e._id || e.id) !== enqId)];
    saveDiskEnquiries(updatedList);
  } catch (diskErr) {
    console.error('[Enquiries] Failed writing enquiry to disk:', diskErr);
  }

  // 2. Try inserting into Supabase if table exists (graceful non-blocking fallback)
  if (supabase) {
    try {
      await supabase.from('enquiries').insert([{
        name: newEnquiry.name,
        email: newEnquiry.email,
        phone: newEnquiry.phone,
        subject: newEnquiry.subject,
        message: newEnquiry.message,
        created_at: nowIso
      }]);
    } catch (sbErr) {
      console.warn('[Enquiries] Supabase insert skipped/failed:', sbErr?.message);
    }
  }

  return res.status(201).json({
    success: true,
    enquiry: newEnquiry,
    message: 'Your message has been received! Our support team will respond within 24 hours.'
  });
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
export const getAllEnquiries = async (req, res) => {
  try {
    const diskEnquiries = loadDiskEnquiries();
    let merged = [...diskEnquiries];

    if (supabase) {
      try {
        const { data: sbEnquiries, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(sbEnquiries) && sbEnquiries.length > 0) {
          const seen = new Set(merged.map(e => e._id || e.id));
          for (const sbItem of sbEnquiries) {
            const key = sbItem.id || sbItem._id;
            if (!seen.has(key)) {
              merged.push({
                ...sbItem,
                _id: key,
                id: key,
                createdAt: sbItem.created_at || sbItem.createdAt
              });
              seen.add(key);
            }
          }
        }
      } catch (sbErr) {
        // Supabase table not present, fallback silently to disk data
      }
    }

    // Sort newest first
    merged.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

    return res.json({
      success: true,
      enquiries: merged,
      data: merged,
      count: merged.length
    });
  } catch (error) {
    console.error('[Enquiries] Error in getAllEnquiries:', error);
    const diskFallback = loadDiskEnquiries();
    return res.json({
      success: true,
      enquiries: diskFallback,
      data: diskFallback,
      count: diskFallback.length
    });
  }
};

// @desc    Delete an enquiry
// @route   DELETE /api/enquiries/:id
// @access  Private/Admin
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const currentList = loadDiskEnquiries();
    const updated = currentList.filter(e => (e._id || e.id) !== id);
    saveDiskEnquiries(updated);

    if (supabase) {
      try {
        await supabase.from('enquiries').delete().eq('id', id);
      } catch (_) {}
    }

    return res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
