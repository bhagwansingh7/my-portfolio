const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { detectSpam } = require('../services/spamFilter');

exports.create = asyncHandler(async (req, res) => {
  const { name, email, subject, message, website } = req.body;
  const spam = detectSpam({ name, email, subject, message, honeypot: website });
  if (spam) {
    // Pretend it worked so bots learn nothing; nothing is stored.
    console.warn(`[contact] discarded submission (${spam})`);
    return res.status(201).json({ message: 'Message sent.' });
  }
  await pool.execute('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message]);
  return res.status(201).json({ message: 'Message sent.' });
});
