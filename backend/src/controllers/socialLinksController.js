const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const COLS = 'id, platform, label, url, display_order, enabled';
const toRow = (r) => ({ ...r, enabled: Boolean(r.enabled) });

exports.list = asyncHandler(async (req, res) => {
  const includeAll = req.query.all === '1' && req.user;
  const [rows] = await pool.query(`SELECT ${COLS} FROM social_links ${includeAll ? '' : 'WHERE enabled = 1'} ORDER BY display_order ASC, id ASC`);
  res.json(rows.map(toRow));
});

exports.create = asyncHandler(async (req, res) => {
  const b = req.body;
  const [[m]] = await pool.query('SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM social_links');
  const [result] = await pool.execute(
    'INSERT INTO social_links (platform, label, url, display_order, enabled) VALUES (?, ?, ?, ?, ?)',
    [b.platform.toLowerCase(), b.label, b.url, b.display_order ?? m.next, b.enabled === undefined ? 1 : Number(b.enabled)],
  );
  const [[row]] = await pool.execute(`SELECT ${COLS} FROM social_links WHERE id = ?`, [result.insertId]);
  res.status(201).json(toRow(row));
});

exports.update = asyncHandler(async (req, res) => {
  const b = req.body;
  const [[existing]] = await pool.execute('SELECT id, display_order, enabled FROM social_links WHERE id = ?', [req.params.id]);
  if (!existing) throw new ApiError(404, 'Link not found.');
  await pool.execute(
    'UPDATE social_links SET platform = ?, label = ?, url = ?, display_order = ?, enabled = ? WHERE id = ?',
    [b.platform.toLowerCase(), b.label, b.url, b.display_order ?? existing.display_order, b.enabled === undefined ? existing.enabled : Number(b.enabled), req.params.id],
  );
  const [[row]] = await pool.execute(`SELECT ${COLS} FROM social_links WHERE id = ?`, [req.params.id]);
  res.json(toRow(row));
});

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM social_links WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new ApiError(404, 'Link not found.');
  res.status(204).end();
});
