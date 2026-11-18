import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ANNOUNCEMENTS_FILE = path.join(__dirname, '..', 'data', 'announcements.json');

const defaultAnnouncementsData = {
  settings: {
    isEnabled: true,
    speed: 'normal',
    pauseOnHover: true
  },
  items: [
    {
      id: 'anc_1',
      badge: 'HOT OFFER',
      badgeColor: 'rose',
      icon: '🚚',
      text: 'FREE SHIPPING ON ORDERS ABOVE ₹999',
      link: '/shop',
      ctaText: 'Shop Now',
      highlight: true,
      isActive: true,
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'anc_2',
      badge: 'SPECIAL',
      badgeColor: 'amber',
      icon: '🎟️',
      text: 'USE CODE "PAWFIRST" FOR 15% OFF YOUR 1ST ORDER',
      link: '/shop',
      ctaText: 'Claim Offer',
      highlight: false,
      isActive: true,
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'anc_3',
      badge: 'VERIFIED',
      badgeColor: 'emerald',
      icon: '🏡',
      text: '100% CAGE-FREE LUXURY PET HOSTELS & RESORTS',
      link: '/hostel',
      ctaText: 'View Hostels',
      highlight: false,
      isActive: true,
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'anc_4',
      badge: 'EXPRESS',
      badgeColor: 'blue',
      icon: '⚡',
      text: 'SAME-DAY EXPRESS DISPATCH ACROSS MAJOR METROS',
      link: '/shop',
      ctaText: 'Shop Now',
      highlight: false,
      isActive: true,
      order: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 'anc_5',
      badge: '24/7 VET',
      badgeColor: 'teal',
      icon: '🩺',
      text: 'EMERGENCY VETERINARY STANDBY & INSTANT RX VERIFICATION',
      link: '/veterinary',
      ctaText: 'Book Vet',
      highlight: false,
      isActive: true,
      order: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'anc_6',
      badge: 'KCI STUDS',
      badgeColor: 'purple',
      icon: '🐾',
      text: 'ETHICAL BREEDING DIRECTORY WITH PEDIGREE CERTIFICATION',
      link: '/breeding',
      ctaText: 'Explore',
      highlight: false,
      isActive: true,
      order: 6,
      createdAt: new Date().toISOString()
    }
  ]
};

export const loadDiskAnnouncements = () => {
  try {
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
      const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        return {
          settings: parsed.settings || defaultAnnouncementsData.settings,
          items: parsed.items
        };
      }
    }
  } catch (err) {
    console.warn('[Announcements] Error reading announcements.json:', err?.message);
  }
  return defaultAnnouncementsData;
};

export const saveDiskAnnouncements = (data) => {
  try {
    const dir = path.dirname(ANNOUNCEMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Announcements] Error saving announcements.json:', err?.message);
  }
};

// @desc    Get active announcements for public header
// @route   GET /api/announcements
// @access  Public
export const getPublicAnnouncements = async (req, res) => {
  try {
    const diskData = loadDiskAnnouncements();
    let items = diskData.items;
    let settings = diskData.settings;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          items = data.map(d => ({
            id: d.id,
            badge: d.badge,
            badgeColor: d.badge_color || 'rose',
            icon: d.icon || '📢',
            text: d.text,
            link: d.link || '/shop',
            ctaText: d.cta_text || 'Shop Now',
            highlight: Boolean(d.highlight),
            isActive: true,
            order: d.display_order ?? 1
          }));
        }
      } catch (_) {}
    }

    const activeItems = items
      .filter(i => i.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return res.json({
      success: true,
      settings: settings || { isEnabled: true, speed: 'normal', pauseOnHover: true },
      announcements: activeItems
    });
  } catch (error) {
    console.error('[Announcements] Error in getPublicAnnouncements:', error);
    const diskData = loadDiskAnnouncements();
    return res.json({
      success: true,
      settings: diskData.settings,
      announcements: diskData.items.filter(i => i.isActive !== false)
    });
  }
};

// @desc    Get all announcements for Admin Manager
// @route   GET /api/announcements/admin
// @access  Private/Admin
export const getAdminAnnouncements = async (req, res) => {
  try {
    const diskData = loadDiskAnnouncements();
    let items = diskData.items;
    let settings = diskData.settings;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const map = new Map();
          for (const item of diskData.items) map.set(item.id, item);
          for (const d of data) {
            map.set(d.id, {
              id: d.id,
              badge: d.badge,
              badgeColor: d.badge_color || 'rose',
              icon: d.icon || '📢',
              text: d.text,
              link: d.link || '/shop',
              ctaText: d.cta_text || 'Shop Now',
              highlight: Boolean(d.highlight),
              isActive: Boolean(d.is_active),
              order: d.display_order ?? 1,
              createdAt: d.created_at
            });
          }
          items = Array.from(map.values());
        }
      } catch (_) {}
    }

    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return res.json({
      success: true,
      settings,
      announcements: items
    });
  } catch (error) {
    console.error('[Announcements] Error in getAdminAnnouncements:', error);
    const diskData = loadDiskAnnouncements();
    return res.json({
      success: true,
      settings: diskData.settings,
      announcements: diskData.items
    });
  }
};

// @desc    Create a new announcement offer
// @route   POST /api/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res) => {
  try {
    const { badge, badgeColor, icon, text, link, ctaText, highlight, isActive, order } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Announcement text message is required' });
    }

    const diskData = loadDiskAnnouncements();
    const id = `anc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const newAnnouncement = {
      id,
      badge: badge ? badge.trim() : 'HOT OFFER',
      badgeColor: badgeColor || 'rose',
      icon: icon ? icon.trim() : '📢',
      text: text.trim(),
      link: link ? link.trim() : '/shop',
      ctaText: ctaText ? ctaText.trim() : 'Shop Now',
      highlight: Boolean(highlight),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: order ? Number(order) : diskData.items.length + 1,
      createdAt: now,
      updatedAt: now
    };

    diskData.items.push(newAnnouncement);
    saveDiskAnnouncements(diskData);

    if (supabase) {
      try {
        await supabase.from('announcements').insert([{
          id: newAnnouncement.id,
          badge: newAnnouncement.badge,
          badge_color: newAnnouncement.badgeColor,
          icon: newAnnouncement.icon,
          text: newAnnouncement.text,
          link: newAnnouncement.link,
          cta_text: newAnnouncement.ctaText,
          highlight: newAnnouncement.highlight,
          is_active: newAnnouncement.isActive,
          display_order: newAnnouncement.order,
          created_at: now
        }]);
      } catch (_) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Announcement offer created successfully',
      announcement: newAnnouncement
    });
  } catch (error) {
    console.error('[Announcements] Error creating announcement:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error creating announcement' });
  }
};

// @desc    Update an announcement offer
// @route   PUT /api/announcements/:id
// @access  Private/Admin
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { badge, badgeColor, icon, text, link, ctaText, highlight, isActive, order } = req.body;

    const diskData = loadDiskAnnouncements();
    const index = diskData.items.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Announcement offer not found' });
    }

    const existing = diskData.items[index];
    const now = new Date().toISOString();

    const updated = {
      ...existing,
      badge: badge !== undefined ? badge.trim() : existing.badge,
      badgeColor: badgeColor !== undefined ? badgeColor : existing.badgeColor,
      icon: icon !== undefined ? icon.trim() : existing.icon,
      text: text !== undefined ? text.trim() : existing.text,
      link: link !== undefined ? link.trim() : existing.link,
      ctaText: ctaText !== undefined ? ctaText.trim() : existing.ctaText,
      highlight: highlight !== undefined ? Boolean(highlight) : existing.highlight,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      order: order !== undefined ? Number(order) : existing.order,
      updatedAt: now
    };

    diskData.items[index] = updated;
    saveDiskAnnouncements(diskData);

    if (supabase) {
      try {
        await supabase.from('announcements').update({
          badge: updated.badge,
          badge_color: updated.badgeColor,
          icon: updated.icon,
          text: updated.text,
          link: updated.link,
          cta_text: updated.ctaText,
          highlight: updated.highlight,
          is_active: updated.isActive,
          display_order: updated.order,
          updated_at: now
        }).eq('id', id);
      } catch (_) {}
    }

    return res.json({
      success: true,
      message: 'Announcement offer updated successfully',
      announcement: updated
    });
  } catch (error) {
    console.error('[Announcements] Error updating announcement:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error updating announcement' });
  }
};

// @desc    Delete an announcement offer
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const diskData = loadDiskAnnouncements();
    const initialLength = diskData.items.length;

    diskData.items = diskData.items.filter(i => i.id !== id);

    if (diskData.items.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Announcement offer not found' });
    }

    saveDiskAnnouncements(diskData);

    if (supabase) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
      } catch (_) {}
    }

    return res.json({
      success: true,
      message: 'Announcement offer deleted successfully'
    });
  } catch (error) {
    console.error('[Announcements] Error deleting announcement:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error deleting announcement' });
  }
};

// @desc    Update ticker settings (speed, pause on hover, global enable)
// @route   PUT /api/announcements/settings
// @access  Private/Admin
export const updateAnnouncementSettings = async (req, res) => {
  try {
    const { isEnabled, speed, pauseOnHover } = req.body;
    const diskData = loadDiskAnnouncements();

    diskData.settings = {
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : diskData.settings.isEnabled,
      speed: speed || diskData.settings.speed || 'normal',
      pauseOnHover: pauseOnHover !== undefined ? Boolean(pauseOnHover) : diskData.settings.pauseOnHover
    };

    saveDiskAnnouncements(diskData);

    return res.json({
      success: true,
      message: 'Announcement bar settings updated successfully',
      settings: diskData.settings
    });
  } catch (error) {
    console.error('[Announcements] Error updating settings:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error updating settings' });
  }
};

// @desc    Upload custom announcement icon image (PNG, SVG, WEBP, etc.)
// @route   POST /api/announcements/upload-icon
// @access  Private/Admin
export const uploadAnnouncementIcon = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file for the icon.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      message: 'Announcement icon uploaded successfully'
    });
  } catch (error) {
    console.error('[Announcements] Error uploading icon:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error uploading icon' });
  }
};

