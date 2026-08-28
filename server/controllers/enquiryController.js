import Enquiry from '../models/Enquiry.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

// @desc    Submit a new contact/enquiry message
// @route   POST /api/enquiries
// @access  Public
export const createEnquiry = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please enter all required fields.' });
  }

  try {
    let newEnquiry;
    if (isDbConnected()) {
      newEnquiry = await Enquiry.create({ name, email, phone, subject, message });
    } else {
      const enquiries = readMockData('enquiries');
      newEnquiry = {
        _id: `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
        name,
        email,
        phone: phone || '',
        subject,
        message,
        createdAt: new Date().toISOString()
      };
      enquiries.unshift(newEnquiry);
      writeMockData('enquiries', enquiries);
    }

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
    let enquiries = [];
    if (isDbConnected()) {
      enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    } else {
      enquiries = readMockData('enquiries');
    }
    res.json({ success: true, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
