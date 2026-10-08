const { pool } = require('../config/db');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

exports.sitemap = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT slug, updated_at FROM projects ORDER BY id ASC');
  const urls = [`<url><loc>${env.frontendUrl}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`];
  rows.forEach((r) => {
    urls.push(`<url><loc>${env.frontendUrl}/projects/${encodeURIComponent(r.slug)}</loc><lastmod>${new Date(r.updated_at).toISOString().slice(0, 10)}</lastmod><priority>0.8</priority></url>`);
  });
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
});
