import mongoose from 'mongoose';

const cookieConsentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  preferences: {
    essential: { type: Boolean, default: true },
    functional: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const CookieConsent = mongoose.model('CookieConsent', cookieConsentSchema);

export default CookieConsent;
