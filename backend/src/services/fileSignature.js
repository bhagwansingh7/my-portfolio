const fs = require('fs/promises');

// Never trust the browser-reported MIME type alone: check the file's magic bytes too.
const matchers = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/gif': (b) => b.slice(0, 4).toString('ascii') === 'GIF8',
  'image/webp': (b) => b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP',
  'application/pdf': (b) => b.slice(0, 5).toString('ascii') === '%PDF-',
};

async function hasValidSignature(filePath, mimetype) {
  const check = matchers[mimetype];
  if (!check) return false;
  const handle = await fs.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    await handle.read(buf, 0, 12, 0);
    return check(buf);
  } finally {
    await handle.close();
  }
}

module.exports = { hasValidSignature };
