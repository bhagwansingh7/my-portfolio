const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

fs.mkdirSync(env.uploadDir, { recursive: true });

// The extension comes from the validated MIME type, never from the user-supplied filename.
const EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${EXT[file.mimetype]}`),
});

const build = (allowed, maxBytes, label) =>
  multer({
    storage,
    limits: { fileSize: maxBytes, files: 1, fields: 5 },
    fileFilter: (req, file, cb) =>
      allowed.includes(file.mimetype) ? cb(null, true) : cb(new ApiError(415, `Unsupported file type. Allowed: ${label}.`)),
  }).single('file');

const imageUpload = build(['image/jpeg', 'image/png', 'image/webp', 'image/gif'], env.maxImageBytes, 'JPG, PNG, WebP or GIF');
const documentUpload = build(['application/pdf'], env.maxDocBytes, 'PDF');

/** POST /api/uploads?kind=image|document */
const upload = (req, res, next) => (req.query.kind === 'document' ? documentUpload : imageUpload)(req, res, next);

module.exports = { upload, uploadDir: env.uploadDir, path };
