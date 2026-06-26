import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const ALLOWED = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED.has(ext) && ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'));
  }
}

export const uploadSalarySlip = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('salarySlip');
