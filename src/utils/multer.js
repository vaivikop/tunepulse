import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set upload destination folder
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Create unique filename
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File upload limit and other configuration
const upload = multer({
  storage,
  limits: { fileSize: 300000 }, // 300KB limit
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('File type is not allowed'), false);
    } else {
      cb(null, true);
    }
  },
});

export default upload;
