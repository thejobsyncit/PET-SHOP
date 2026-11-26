import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BREEDINGS_FILE = path.join(__dirname, '..', 'data', 'breedings.json');

const getBreedings = () => {
  try {
    if (fs.existsSync(BREEDINGS_FILE)) {
      const content = fs.readFileSync(BREEDINGS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading breedings file:', err);
  }
  return [];
};

const saveBreedings = (data) => {
  try {
    fs.writeFileSync(BREEDINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing breedings file:', err);
  }
};

// GET /api/breeding - Fetch all studs (Super Admin & Public)
router.get('/', async (req, res) => {
  try {
    const diskStuds = getBreedings();
    if (supabase) {
      const { data, error } = await supabase
        .from('breedings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const idSet = new Set(data.map(s => String(s.id || s._id)));
        const merged = [...data, ...diskStuds.filter(s => !idSet.has(String(s.id || s._id)))];
        return res.json({ success: true, studs: merged, data: merged });
      }
    }
    return res.json({ success: true, studs: diskStuds, data: diskStuds });
  } catch (err) {
    console.error('Error in GET /api/breeding:', err);
    const studs = getBreedings();
    return res.json({ success: true, studs, data: studs });
  }
});

// GET /api/breeding/my
router.get('/my', async (req, res) => {
  try {
    const diskStuds = getBreedings();
    if (supabase) {
      const { data, error } = await supabase
        .from('breedings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return res.json({ success: true, studs: data, data: data });
      }
    }
    return res.json({ success: true, studs: diskStuds, data: diskStuds });
  } catch (err) {
    const studs = getBreedings();
    return res.json({ success: true, studs, data: studs });
  }
});

// PUT /api/breeding/:id/verify - Super Admin verify stud KCI certificate
router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const verifiedBool = Boolean(isVerified);

    if (supabase) {
      try {
        await supabase
          .from('breedings')
          .update({ is_verified: verifiedBool, isVerified: verifiedBool })
          .or(`id.eq.${id}`);
      } catch (sbErr) {
        console.warn('Supabase breeding verify update note:', sbErr?.message);
      }
    }

    const studs = getBreedings();
    let updated = null;

    const newStuds = studs.map((s) => {
      if (String(s._id) === String(id) || String(s.id) === String(id)) {
        updated = { ...s, isVerified: verifiedBool, is_verified: verifiedBool };
        return updated;
      }
      return s;
    });

    if (updated) {
      saveBreedings(newStuds);
      return res.json({
        success: true,
        message: `Stud verification set to ${verifiedBool}`,
        stud: updated,
        studs: newStuds
      });
    }

    return res.json({
      success: true,
      message: `Stud verification set to ${verifiedBool}`,
      stud: { id, isVerified: verifiedBool },
      studs: newStuds
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/breeding
router.post('/', async (req, res) => {
  try {
    const newId = 'STUD-' + Date.now().toString().slice(-5);
    const newStud = {
      id: newId,
      _id: newId,
      ...req.body,
      is_verified: false,
      isVerified: false,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('breedings').insert(newStud);
      } catch (sbErr) {
        console.warn('Supabase breeding insert note:', sbErr?.message);
      }
    }

    const studs = getBreedings();
    studs.unshift(newStud);
    saveBreedings(studs);
    return res.json({ success: true, stud: newStud, studs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/breeding/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      try {
        await supabase.from('breedings').delete().or(`id.eq.${id}`);
      } catch (_) {}
    }
    const studs = getBreedings();
    const filtered = studs.filter(s => String(s._id) !== String(id) && String(s.id) !== String(id));
    saveBreedings(filtered);
    return res.json({ success: true, message: 'Stud removed successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback
router.use((req, res) => {
  const studs = getBreedings();
  res.json({ success: true, studs, data: studs });
});

export default router;
