const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

exports.get = asyncHandler(async (req, res) => {
  const [[row]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM projects) AS projects,
      (SELECT COUNT(*) FROM projects WHERE featured = 1) AS featured_projects,
      (SELECT COUNT(*) FROM skills) AS skills,
      (SELECT COUNT(*) FROM contact_messages) AS messages,
      (SELECT COUNT(*) FROM contact_messages WHERE status = 'unread') AS unread_messages
  `);
  res.json(row);
});
