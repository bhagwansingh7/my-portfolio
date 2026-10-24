
const path = require('path');
const dotenv = require('dotenv');

// Load local .env only outside production.
// Vercel environment variables are provided through process.env.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '../../..', '.env'),
  });
}

// Convert "1d", "12h", "30m", "45s" to milliseconds.
const toMs = (value, fallbackMs) => {
  const m = /^(\d+)\s*([smhd])$/.exec(String(value || '').trim());

  if (!m) return fallbackMs;

  return Number(m[1]) * {
    s: 1e3,
    m: 6e4,
    h: 36e5,
    d: 864e5,
  }[m[2]];
};

const frontendUrl = (
  process.env.FRONTEND_URL || 'http://localhost:5173'
).replace(/\/$/, '');

const jwtExpiry = process.env.JWT_EXPIRY || '1d';

// Use /tmp for temporary uploads on Vercel.
// Use the local uploads directory during development.
const uploadDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.resolve(
      process.env.UPLOAD_DIR ||
      path.join(__dirname, '../../uploads')
    );

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  port: parseInt(process.env.PORT || '5000', 10),

  db: {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'portfolio',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
  },

  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiry,
  cookieMaxAgeMs: toMs(jwtExpiry, 864e5),

  // Cookies should be secure when the application uses HTTPS.
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  frontendUrl,

  corsOrigins: [
    frontendUrl,
    ...(process.env.CORS_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ],

  adminEmail: (process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase(),

  adminPassword: process.env.ADMIN_PASSWORD || '',

  uploadDir,

  maxImageBytes:
    parseInt(process.env.MAX_IMAGE_MB || '5', 10) * 1024 * 1024,

  maxDocBytes:
    parseInt(process.env.MAX_DOC_MB || '10', 10) * 1024 * 1024,
};

// Fail fast if the JWT secret is missing or too short.
if (env.jwtSecret.length < 32) {
  throw new Error(
    'JWT_SECRET must be configured and contain at least 32 characters.'
  );
}

module.exports = env;