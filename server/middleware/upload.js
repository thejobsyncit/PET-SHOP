import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Warning: Could not create uploads directory:', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG) and PDFs are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

export const verifyMagicBytes = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files 
    ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) 
    : [req.file];

  for (const file of files) {
    if (!file || !file.path) continue;

    try {
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // Verify binary magic signatures:
      // JPEG: FF D8 FF
      const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      // PNG: 89 50 4E 47
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      // PDF: 25 50 44 46 (%PDF)
      const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;

      if (!isJpeg && !isPng && !isPdf) {
        // Disguised or executable payload detected - delete immediately
        try { fs.unlinkSync(file.path); } catch (_) {}
        return res.status(400).json({
          success: false,
          message: 'Security validation failed: File content does not match genuine image or PDF binary signature.'
        });
      }
    } catch (err) {
      try { fs.unlinkSync(file.path); } catch (_) {}
      return res.status(500).json({ success: false, message: 'Failed to verify file signature.' });
    }
  }

  next();
};

export default upload;
