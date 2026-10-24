import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// GET /api/breeding
router.get('/', (req, res) => {
  const studs = getBreedings();
  return res.json({ success: true, studs, data: studs });
});

// GET /api/breeding/my
router.get('/my', (req, res) => {
  const studs = getBreedings();
  return res.json({ success: true, studs, data: studs });
});

// PUT /api/breeding/:id/verify
router.put('/:id/verify', (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const studs = getBreedings();
    let updated = null;

    const newStuds = studs.map((s) => {
      if (String(s._id) === String(id) || String(s.id) === String(id)) {
        updated = { ...s, isVerified: Boolean(isVerified) };
        return updated;
      }
      return s;
    });

    if (updated) {
      saveBreedings(newStuds);
      return res.json({
        success: true,
        message: `Stud verification set to ${isVerified}`,
        stud: updated,
        studs: newStuds
      });
    }

    return res.status(404).json({ success: false, message: 'Stud listing not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/breeding
router.post('/', (req, res) => {
  try {
    const studs = getBreedings();
    const newStud = {
      _id: 'STUD-' + Date.now().toString().slice(-5),
      ...req.body,
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    studs.unshift(newStud);
    saveBreedings(studs);
    return res.json({ success: true, stud: newStud, studs });
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
