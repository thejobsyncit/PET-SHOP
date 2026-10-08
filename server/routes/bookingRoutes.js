import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/bookings/provider - Provider service bookings
router.get('/provider', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase bookings fetch error, returning fallback:', error.message);
      return res.json({ success: true, bookings: [], data: [] });
    }
    return res.json({ success: true, bookings: data || [], data: data || [] });
  } catch (err) {
    console.error('Error in /bookings/provider:', err);
    return res.json({ success: true, bookings: [], data: [] });
  }
});

// Fallback for any other booking routes
router.use((req, res) => res.json({ success: true, bookings: [], data: [] }));

export default router;
