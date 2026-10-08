const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { nullIfEmpty } = require('../utils/sanitize');

const TEXT_FIELDS = ['name', 'headline', 'intro', 'bio', 'profile_image', 'resume_url', 'public_email', 'location', 'developer_focus', 'current_focus'];
const JSON_FIELDS = ['education', 'achievements'];
const COLUMNS = [...TEXT_FIELDS, ...JSON_FIELDS, 'updated_at'].join(', ');

const getSettings = async () => {
  const [rows] = await pool.query('SELECT setting_key AS k, setting_value AS v FROM settings');
  return Object.fromEntries(rows.map((r) => [r.k, r.v]));
};

exports.getSettings = getSettings;

exports.getPortfolio = asyncHandler(async (req, res) => {
  const [[row]] = await pool.query(`SELECT ${COLUMNS} FROM portfolio WHERE id = 1`);
  if (!row) throw new ApiError(404, 'The portfolio has not been set up yet.');
  res.json({ ...row, education: row.education || [], achievements: row.achievements || [], settings: await getSettings() });
});

exports.updatePortfolio = asyncHandler(async (req, res) => {
  const sets = [];
  const values = [];
  TEXT_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`);
      values.push(nullIfEmpty(req.body[f]));
    }
  });
  JSON_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`);
      values.push(JSON.stringify(req.body[f]));
    }
  });
  if (!sets.length) throw new ApiError(400, 'Nothing to update.');
  await pool.execute(`UPDATE portfolio SET ${sets.join(', ')} WHERE id = 1`, values);
  const [[row]] = await pool.query(`SELECT ${COLUMNS} FROM portfolio WHERE id = 1`);
  res.json({ ...row, education: row.education || [], achievements: row.achievements || [], settings: await getSettings() });
});

const SETTING_KEYS = ['site_title', 'meta_description', 'availability_text'];

exports.getPublicSettings = asyncHandler(async (req, res) => res.json(await getSettings()));

exports.updateSettings = asyncHandler(async (req, res) => {
  for (const key of SETTING_KEYS) {
    if (req.body[key] !== undefined) {
      await pool.execute(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, req.body[key] || ''],
      );
    }
  }
  res.json(await getSettings());
});
