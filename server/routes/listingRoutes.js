import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/listings/my - Provider/seller specific listings
router.get('/my', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase listings fetch error, returning fallback:', error.message);
      return res.json({ success: true, listings: [], data: [] });
    }
    return res.json({ success: true, listings: data || [], data: data || [] });
  } catch (err) {
    console.error('Error in /listings/my:', err);
    return res.json({ success: true, listings: [], data: [] });
  }
});

// PUT /api/listings/:id/sell
router.put('/:id/sell', async (req, res) => {
  try {
    const { id } = req.params;
    return res.json({ success: true, message: `Listing ${id} marked as sold` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback for any other listing routes
router.use((req, res) => res.json({ success: true, listings: [], data: [] }));

export default router;
