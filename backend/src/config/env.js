const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../..', '.env');

console.log('[env] __dirname:', __dirname);
console.log('[env] envPath:', envPath);
console.log('[env] exists:', fs.existsSync(envPath));

const result = dotenv.config({ path: envPath });

console.log('[env] dotenv error:', result.error || 'none');
console.log('[env] DB_HOST:', process.env.DB_HOST);
console.log('[env] DB_USER:', process.env.DB_USER);

// "1d", "12h", "30m", "45s" -> milliseconds
const toMs = (value, fallbackMs) => {
  const m = /^(\d+)\s*([smhd])$/.exec(String(value || '').trim());
  if (!m) return fallbackMs;
  return Number(m[1]) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2]];
};

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const jwtExpiry = process.env.JWT_EXPIRY || '1d';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  db: {

    host: process.env.DB_HOST ||'',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'portfolio',
    user: process.env.DB_USER || 'BhagwanSingh',
    password: process.env.DB_PASSWORD || '',
  },
 
  jwtSecret: process.env.JWT_SECRET || 'fggdjksljfhjaklkdjaklkdjkadjfjaklljdhfajk',
  jwtExpiry,
  cookieMaxAgeMs: toMs(jwtExpiry, 864e5),
  // Set COOKIE_SECURE=true when the site is served over HTTPS.
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  frontendUrl,
  corsOrigins: [frontendUrl, ...(process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)],
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')),
  maxImageBytes: parseInt(process.env.MAX_IMAGE_MB || '5', 10) * 1024 * 1024,
  maxDocBytes: parseInt(process.env.MAX_DOC_MB || '10', 10) * 1024 * 1024,
};

if (env.jwtSecret.length < 32) {
  console.error('[config] JWT_SECRET must be set and at least 32 characters long. Generate one with: openssl rand -hex 32');
  process.exit(1);
}

module.exports = env;
