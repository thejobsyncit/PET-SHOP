import { supabase } from '../config/supabase.js';

// @desc    Submit a new contact/enquiry message
// @route   POST /api/enquiries
// @access  Public
export const createEnquiry = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please enter all required fields.' });
  }

  try {
    const { data: newEnquiry, error } = await supabase.from('enquiries').insert([{
      name, email, phone: phone || '', subject, message
    }]).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, enquiry: newEnquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
export const getAllEnquiries = async (req, res) => {
  try {
    const { data: enquiries, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, enquiries: enquiries || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
