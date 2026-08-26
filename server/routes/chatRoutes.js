import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

const router = express.Router();

// GET conversation history with a contact
router.get('/messages/:contactId', protect, async (req, res) => {
  try {
    const contactId = req.params.contactId;
    const userId = req.user._id.toString();
    let messages = [];

    if (isDbConnected()) {
      messages = await Message.find({
        $or: [
          { sender: userId, recipient: contactId },
          { sender: contactId, recipient: userId }
        ]
      }).sort({ createdAt: 1 }).populate('sender recipient', 'name email');
    } else {
      messages = readMockData('messages').filter(m => {
        const mSender = m.sender?._id || m.sender;
        const mRecip = m.recipient?._id || m.recipient;
        return (mSender === userId && mRecip === contactId) || (mSender === contactId && mRecip === userId);
      });
    }

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all active chat rooms (users list I have spoken with)
router.get('/rooms', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let rooms = [];

    if (isDbConnected()) {
      const messages = await Message.find({
        $or: [{ sender: userId }, { recipient: userId }]
      }).populate('sender recipient', 'name email');

      const uniqueUsers = new Map();
      messages.forEach(m => {
        const otherUser = m.sender._id.toString() === userId ? m.recipient : m.sender;
        uniqueUsers.set(otherUser._id.toString(), otherUser);
      });
      rooms = Array.from(uniqueUsers.values());
    } else {
      const messages = readMockData('messages');
      const uniqueUsers = new Map();
      messages.forEach(m => {
        const mSender = m.sender?._id || m.sender;
        const mRecip = m.recipient?._id || m.recipient;
        
        if (mSender === userId) {
          // Recipient is the contact
          const rObj = typeof m.recipient === 'object' ? m.recipient : { _id: m.recipient, name: 'User Profile' };
          uniqueUsers.set(rObj._id.toString(), rObj);
        } else if (mRecip === userId) {
          // Sender is the contact
          const sObj = typeof m.sender === 'object' ? m.sender : { _id: m.sender, name: 'User Profile' };
          uniqueUsers.set(sObj._id.toString(), sObj);
        }
      });
      rooms = Array.from(uniqueUsers.values());
    }

    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST send message
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId, messageText, listingId } = req.body;
    if (!recipientId || !messageText) {
      return res.status(400).json({ success: false, message: 'Recipient and message body are required' });
    }

    let newMessage;
    if (isDbConnected()) {
      newMessage = await Message.create({
        sender: req.user._id,
        recipient: recipientId,
        listingRef: listingId || undefined,
        messageText
      });
      newMessage = await Message.findById(newMessage._id).populate('sender recipient', 'name email');
    } else {
      const messages = readMockData('messages');
      newMessage = {
        _id: `MSG-${Math.floor(100000 + Math.random() * 900000)}`,
        sender: { _id: req.user._id.toString(), name: req.user.name, email: req.user.email },
        recipient: { _id: recipientId, name: 'Recipient Profile' },
        listingRef: listingId || undefined,
        messageText,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      messages.push(newMessage);
      writeMockData('messages', messages);
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
