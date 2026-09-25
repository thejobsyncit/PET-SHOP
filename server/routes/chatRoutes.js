import express from 'express';
import { protect } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messagesFilePath = path.join(__dirname, '..', 'data', 'messages.json');

const router = express.Router();

// Helper to read local messages
const getLocalMessages = () => {
  try {
    if (fs.existsSync(messagesFilePath)) {
      return JSON.parse(fs.readFileSync(messagesFilePath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading messages.json:', err.message);
  }
  return [];
};

// Helper to save local messages
const saveLocalMessages = (messages) => {
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing messages.json:', err.message);
  }
};

// GET /api/chats/rooms - Active conversation rooms for the logged-in user
router.get('/rooms', protect, async (req, res) => {
  try {
    const currentUserId = (req.user._id || req.user.id || '').toString();
    const allMessages = getLocalMessages();

    // Map to track unique contacts
    const roomMap = new Map();

    allMessages.forEach((m) => {
      const senderId = (m.sender?._id || m.sender?.id || m.sender || '').toString();
      const recipientId = (m.recipient?._id || m.recipient?.id || m.recipient || '').toString();

      if (senderId === currentUserId || recipientId === currentUserId) {
        const isSender = senderId === currentUserId;
        const otherId = isSender ? recipientId : senderId;
        const otherData = isSender ? m.recipient : m.sender;

        if (otherId && otherId !== currentUserId) {
          const existing = roomMap.get(otherId);
          const msgTime = new Date(m.createdAt || 0).getTime();

          if (!existing || msgTime > existing._timestamp) {
            roomMap.set(otherId, {
              _id: otherId,
              id: otherId,
              name: typeof otherData === 'object' && otherData.name ? otherData.name : 'Pet Owner / Seller',
              email: typeof otherData === 'object' && otherData.email ? otherData.email : '',
              avatar: typeof otherData === 'object' && otherData.avatar ? otherData.avatar : '',
              lastMessage: m.messageText || '',
              lastMessageTime: m.createdAt || new Date().toISOString(),
              listingTitle: m.listingTitle || m.listingRef || null,
              _timestamp: msgTime
            });
          }
        }
      }
    });

    const rooms = Array.from(roomMap.values()).sort((a, b) => b._timestamp - a._timestamp);
    res.json({ success: true, rooms });
  } catch (err) {
    console.error('Error in GET /api/chats/rooms:', err);
    res.status(500).json({ success: false, message: err.message, rooms: [] });
  }
});

// GET /api/chats/messages/:contactId - Conversation history with a contact
router.get('/messages/:contactId', protect, async (req, res) => {
  try {
    const currentUserId = (req.user._id || req.user.id || '').toString();
    const contactId = (req.params.contactId || '').toString();

    const allMessages = getLocalMessages();
    const conversation = allMessages.filter((m) => {
      const sId = (m.sender?._id || m.sender?.id || m.sender || '').toString();
      const rId = (m.recipient?._id || m.recipient?.id || m.recipient || '').toString();

      return (sId === currentUserId && rId === contactId) || (sId === contactId && rId === currentUserId);
    }).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    res.json({ success: true, messages: conversation });
  } catch (err) {
    console.error('Error in GET /api/chats/messages:', err);
    res.status(500).json({ success: false, message: err.message, messages: [] });
  }
});

// POST /api/chats - Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId, messageText, recipientName, listingId, listingTitle, listingImage } = req.body;

    if (!recipientId || !messageText || !messageText.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and message text are required.' });
    }

    const currentUserId = (req.user._id || req.user.id || '').toString();
    const allMessages = getLocalMessages();

    const newMessage = {
      _id: `MSG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: {
        _id: currentUserId,
        id: currentUserId,
        name: req.user.name || 'Pet Parent',
        email: req.user.email || ''
      },
      recipient: {
        _id: recipientId.toString(),
        id: recipientId.toString(),
        name: recipientName || 'Seller'
      },
      listingRef: listingId || undefined,
      listingTitle: listingTitle || undefined,
      listingImage: listingImage || undefined,
      messageText: messageText.trim(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    allMessages.push(newMessage);
    saveLocalMessages(allMessages);

    // Also attempt saving to Supabase if configured and table exists
    try {
      if (supabase && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        await supabase.from('messages').insert([{
          sender_id: currentUserId,
          recipient_id: recipientId.toString(),
          message_text: messageText.trim(),
          listing_id: listingId || null
        }]);
      }
    } catch (e) {
      // Supabase write is non-blocking
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error('Error in POST /api/chats:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to transmit message.' });
  }
});

export default router;
