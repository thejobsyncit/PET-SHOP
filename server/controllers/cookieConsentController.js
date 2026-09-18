import CookieConsent from '../models/CookieConsent.js';
import { isDbConnected, readMockData, writeMockData, getDbData } from '../utils/mockDb.js';

// @desc    Save user cookie consent
// @route   POST /api/cookie-consents
// @access  Public
export const saveConsent = async (req, res) => {
  try {
    const { sessionId, preferences } = req.body;
    
    if (!sessionId || !preferences) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const consentData = {
      sessionId,
      preferences,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      // Find if exists and update, or create new
      await CookieConsent.findOneAndUpdate(
        { sessionId },
        consentData,
        { upsert: true, new: true }
      );
    } else {
      const consents = readMockData('consents');
      const existingIndex = consents.findIndex(c => c.sessionId === sessionId);
      
      if (existingIndex !== -1) {
        consents[existingIndex] = { ...consents[existingIndex], ...consentData };
      } else {
        consentData._id = 'mock_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
        consents.push(consentData);
      }
      writeMockData('consents', consents);
    }

    res.status(200).json({ success: true, message: 'Consent saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all cookie consents for admin dashboard
// @route   GET /api/cookie-consents
// @access  Private/Admin
export const getConsents = async (req, res) => {
  try {
    let consents = [];
    if (isDbConnected()) {
      consents = await CookieConsent.find({}).sort({ createdAt: -1 }).limit(100);
    } else {
      consents = readMockData('consents');
      consents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.status(200).json({ success: true, consents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
