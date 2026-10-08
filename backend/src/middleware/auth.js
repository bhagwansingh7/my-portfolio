const jwt = require('jsonwebtoken');
const env = require('../config/env');

const COOKIE_NAME = 'portfolio_token';

const cookieOptions = {
  httpOnly: true, // not readable from JavaScript, so XSS cannot steal the session
  secure: env.cookieSecure,
  sameSite: 'lax',
  path: '/',
};

const readUser = (req) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return null;
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  return { id: Number(payload.sub), email: payload.email, role: payload.role };
};

/** Requires a valid session cookie. */
function authenticate(req, res, next) {
  try {
    const user = readUser(req);
    if (!user) return res.status(401).json({ message: 'Authentication required.' });
    req.user = user;
    return next();
  } catch (err) {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

/** Attaches req.user when a valid cookie exists, but never blocks the request. */
function optionalAuth(req, res, next) {
  try {
    req.user = readUser(req) || undefined;
  } catch (err) {
    req.user = undefined;
  }
  next();
}

/** Authorization: only the admin role may continue. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You do not have permission to do that.' });
  }
  return next();
}

const protect = [authenticate, requireAdmin];

module.exports = { COOKIE_NAME, cookieOptions, authenticate, optionalAuth, requireAdmin, protect };
