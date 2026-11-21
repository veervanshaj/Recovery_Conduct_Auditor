import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Audio file filter (WAV & MP3)
const audioFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.wav', '.mp3'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype.includes('audio') || file.mimetype.includes('wav') || file.mimetype.includes('mpeg')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only WAV and MP3 audio files are permitted.'), false);
  }
};

// CSV file filter
const csvFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || file.mimetype.includes('csv') || file.mimetype.includes('text')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV files are permitted.'), false);
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

export const uploadCSV = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});
