const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { pool } = require('../config/db');
const { COOKIE_NAME, cookieOptions } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [[user]] = await pool.execute('SELECT id, email, password_hash, role FROM admin_users WHERE email = ?', [email]);
  const valid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !valid) throw new ApiError(401, 'Incorrect email or password.');

  const token = jwt.sign({ email: user.email, role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiry,
    algorithm: 'HS256',
  });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: env.cookieMaxAgeMs });
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ message: 'Signed out.' });
};

exports.me = asyncHandler(async (req, res) => {
  const [[user]] = await pool.execute('SELECT id, email, role FROM admin_users WHERE id = ?', [req.user.id]);
  if (!user) throw new ApiError(401, 'Account no longer exists.');
  res.json({ user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [[user]] = await pool.execute('SELECT id, password_hash FROM admin_users WHERE id = ?', [req.user.id]);
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    throw new ApiError(422, 'Please correct the highlighted fields.', { currentPassword: 'Current password is incorrect.' });
  }
  const hash = await bcrypt.hash(newPassword, 12);
  await pool.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, user.id]);
  res.json({ message: 'Password updated.' });
});
