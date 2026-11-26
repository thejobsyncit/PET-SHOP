import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LISTINGS_FILE = path.join(__dirname, '..', 'data', 'listings.json');

const loadDiskListings = () => {
  try {
    if (fs.existsSync(LISTINGS_FILE)) {
      const content = fs.readFileSync(LISTINGS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Listings] Error reading listings.json:', err?.message);
  }
  return [];
};

const saveDiskListings = (listings) => {
  try {
    const dir = path.dirname(LISTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(listings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Listings] Error saving listings.json:', err?.message);
  }
};

const normalizeListing = (l) => {
  if (!l) return l;
  let user = l.user;
  if (typeof user === 'string' && user.trim().startsWith('{')) {
    try {
      user = JSON.parse(user);
    } catch (_) {}
  }
  return { ...l, user };
};

// GET /api/listings - All classified listings (Super Admin / Public)
router.get('/', async (req, res) => {
  try {
    const diskListings = loadDiskListings().map(normalizeListing);
    if (supabase) {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const normalizedData = data.map(normalizeListing);
        const idSet = new Set(normalizedData.map(l => String(l.id || l._id)));
        const merged = [...normalizedData, ...diskListings.filter(l => !idSet.has(String(l.id || l._id)))];
        return res.json({ success: true, listings: merged, data: merged });
      }
    }
    return res.json({ success: true, listings: diskListings, data: diskListings });
  } catch (err) {
    console.error('Error in GET /api/listings:', err);
    const fallback = loadDiskListings().map(normalizeListing);
    return res.json({ success: true, listings: fallback, data: fallback });
  }
});

// GET /api/listings/my - Provider/seller specific listings
router.get('/my', async (req, res) => {
  try {
    const diskListings = loadDiskListings();
    if (supabase) {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return res.json({ success: true, listings: data, data: data });
      }
    }
    return res.json({ success: true, listings: diskListings, data: diskListings });
  } catch (err) {
    console.error('Error in /listings/my:', err);
    return res.json({ success: true, listings: loadDiskListings(), data: loadDiskListings() });
  }
});

// PUT /api/listings/:id/verify - Super Admin moderation toggle
router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const verifiedBool = Boolean(isVerified);

    if (supabase) {
      try {
        await supabase
          .from('listings')
          .update({ is_verified: verifiedBool, isVerified: verifiedBool })
          .or(`id.eq.${id}`);
      } catch (sbErr) {
        console.warn('Supabase listing verify update note:', sbErr?.message);
      }
    }

    // Also update disk listings cache
    const diskListings = loadDiskListings();
    let updated = null;
    const updatedList = diskListings.map(l => {
      if (String(l.id) === String(id) || String(l._id) === String(id)) {
        updated = { ...l, isVerified: verifiedBool, is_verified: verifiedBool };
        return updated;
      }
      return l;
    });
    if (updated) {
      saveDiskListings(updatedList);
    }

    return res.json({ 
      success: true, 
      message: `Listing verification set to ${verifiedBool}`,
      isVerified: verifiedBool 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/listings/:id - Super Admin delete listing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      try {
        await supabase
          .from('listings')
          .delete()
          .or(`id.eq.${id}`);
      } catch (sbErr) {
        console.warn('Supabase listing delete note:', sbErr?.message);
      }
    }

    const diskListings = loadDiskListings();
    const filtered = diskListings.filter(l => String(l.id) !== String(id) && String(l._id) !== String(id));
    saveDiskListings(filtered);

    return res.json({ success: true, message: 'Classified listing removed successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/listings/:id/sell
router.put('/:id/sell', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      try {
        await supabase
          .from('listings')
          .update({ status: 'Sold' })
          .or(`id.eq.${id}`);
      } catch (_) {}
    }
    return res.json({ success: true, message: `Listing ${id} marked as sold` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback for any other listing routes
router.use((req, res) => {
  const fallback = loadDiskListings();
  res.json({ success: true, listings: fallback, data: fallback });
});

export default router;
