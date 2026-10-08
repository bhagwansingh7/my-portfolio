const multer = require('multer');

const notFound = (req, res) => res.status(404).json({ message: 'Route not found.' });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const tooLarge = err.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({ message: tooLarge ? 'That file is too large.' : `Upload failed: ${err.message}` });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Malformed JSON body.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ message: 'Origin not allowed.' });
  if (err.status && err.status < 500) return res.status(err.status).json({ message: err.message, errors: err.errors });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That value already exists.' });

  console.error('[error]', err);
  return res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
};

module.exports = { notFound, errorHandler };
