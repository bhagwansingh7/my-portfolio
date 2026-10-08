const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const COLS = 'id, name, category, icon, level, display_order, enabled';
const toRow = (r) => ({ ...r, enabled: Boolean(r.enabled) });
const level = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

exports.list = asyncHandler(async (req, res) => {
  // Disabled skills are only visible to a signed-in admin (?all=1).
  const includeAll = req.query.all === '1' && req.user;
  const [rows] = await pool.query(
    `SELECT ${COLS} FROM skills ${includeAll ? '' : 'WHERE enabled = 1'} ORDER BY display_order ASC, id ASC`,
  );
  res.json(rows.map(toRow));
});

exports.create = asyncHandler(async (req, res) => {
  const b = req.body;
  let order = b.display_order;
  if (order === undefined || order === '' || order === null) {
    const [[m]] = await pool.query('SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM skills');
    order = m.next;
  }
  const [result] = await pool.execute(
    'INSERT INTO skills (name, category, icon, level, display_order, enabled) VALUES (?, ?, ?, ?, ?, ?)',
    [b.name, b.category, b.icon || 'Code2', level(b.level), order, b.enabled === undefined ? 1 : Number(b.enabled)],
  );
  const [[row]] = await pool.execute(`SELECT ${COLS} FROM skills WHERE id = ?`, [result.insertId]);
  res.status(201).json(toRow(row));
});

exports.update = asyncHandler(async (req, res) => {
  const b = req.body;
  const [[existing]] = await pool.execute('SELECT id, display_order, enabled FROM skills WHERE id = ?', [req.params.id]);
  if (!existing) throw new ApiError(404, 'Skill not found.');
  await pool.execute(
    'UPDATE skills SET name = ?, category = ?, icon = ?, level = ?, display_order = ?, enabled = ? WHERE id = ?',
    [
      b.name, b.category, b.icon || 'Code2', level(b.level),
      b.display_order === undefined || b.display_order === '' ? existing.display_order : b.display_order,
      b.enabled === undefined ? existing.enabled : Number(b.enabled),
      req.params.id,
    ],
  );
  const [[row]] = await pool.execute(`SELECT ${COLS} FROM skills WHERE id = ?`, [req.params.id]);
  res.json(toRow(row));
});

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM skills WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new ApiError(404, 'Skill not found.');
  res.status(204).end();
});

/** PUT /api/skills/reorder  { ids: [3, 1, 2] } -> display_order follows array position. */
exports.reorder = asyncHandler(async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || !ids.length || ids.some((i) => !Number.isInteger(i))) throw new ApiError(400, 'ids must be an array of integers.');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (let i = 0; i < ids.length; i += 1) {
      await conn.execute('UPDATE skills SET display_order = ? WHERE id = ?', [i + 1, ids[i]]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  res.json({ message: 'Order saved.' });
});
