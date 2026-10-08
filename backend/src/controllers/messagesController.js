const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const STATUSES = ['unread', 'read', 'archived'];

exports.list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const [rows] = STATUSES.includes(status)
    ? await pool.execute('SELECT id, name, email, subject, message, status, created_at FROM contact_messages WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 500', [status])
    : await pool.query('SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 500');
  res.json(rows);
});

const setStatus = (status) =>
  asyncHandler(async (req, res) => {
    const [result] = await pool.execute('UPDATE contact_messages SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) throw new ApiError(404, 'Message not found.');
    res.json({ id: Number(req.params.id), status });
  });

exports.markRead = setStatus('read');
exports.markUnread = setStatus('unread');
exports.archive = setStatus('archived');

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new ApiError(404, 'Message not found.');
  res.status(204).end();
});
