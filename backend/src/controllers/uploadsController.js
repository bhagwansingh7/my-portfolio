const fs = require('fs/promises');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { hasValidSignature } = require('../services/fileSignature');

exports.create = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file received. Send it as multipart field "file".');
  const ok = await hasValidSignature(req.file.path, req.file.mimetype);
  if (!ok) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(415, 'The file contents do not match its type.');
  }
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});
