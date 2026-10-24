import { supabase } from '../config/supabase.js';

// @desc    Save user cookie consent
// @route   POST /api/cookie-consents
// @access  Public
export const saveConsent = async (req, res) => {
  try {
    const { sessionId, preferences } = req.body;
    
    if (!sessionId || !preferences) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { data: existing, error: checkError } = await supabase.from('cookie_consents').select('*').eq('session_id', sessionId).single();

    if (existing) {
      const { error: updateError } = await supabase.from('cookie_consents').update({
        preferences,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      }).eq('session_id', sessionId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from('cookie_consents').insert([{
        session_id: sessionId,
        preferences,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      }]);
      if (insertError) throw insertError;
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
    const { data: consents, error } = await supabase
      .from('cookie_consents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Normalize for both snake_case and camelCase frontend compatibility
    const normalized = (consents || []).map((c) => ({
      ...c,
      _id: c.id,
      id: c.id,
      sessionId: c.session_id || c.sessionId,
      ip: c.ip_address || c.ip,
      userAgent: c.user_agent || c.userAgent,
      createdAt: c.created_at || c.createdAt
    }));

    res.status(200).json({ success: true, consents: normalized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if consent exists
// @route   GET /api/cookie-consents/check/:sessionId
// @access  Public
export const checkConsent = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { data: consent, error } = await supabase.from('cookie_consents').select('id').eq('session_id', sessionId).single();
    
    res.status(200).json({ success: true, exists: !!consent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a cookie consent log
// @route   DELETE /api/cookie-consents/:id
// @access  Private/Admin
export const deleteConsent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ success: false, message: 'Invalid or undefined consent ID provided' });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let error;

    if (isUuid) {
      const result = await supabase.from('cookie_consents').delete().eq('id', id);
      error = result.error;
    } else {
      const result = await supabase.from('cookie_consents').delete().eq('session_id', id);
      error = result.error;
    }

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Consent log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
