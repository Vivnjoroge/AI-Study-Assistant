import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { createError } from './errorHandler';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename and add timestamp to avoid collisions
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(createError('Only PDF files are allowed', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
