const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');
const { nullIfEmpty } = require('../utils/sanitize');

const LIST_COLS = 'id, slug, name, short_description, cover_image, github_url, live_url, featured, display_order, year';
const TEXT_COLS = ['short_description', 'description', 'problem', 'solution', 'architecture', 'challenges', 'engineering_decisions', 'cover_image', 'github_url', 'live_url'];

const normalize = (p) => ({ ...p, featured: Boolean(p.featured), features: p.features || [], highlights: p.highlights || [] });

async function attach(projects, { withImages = false } = {}) {
  if (!projects.length) return projects;
  const ids = projects.map((p) => p.id);
  const [techs] = await pool.query('SELECT project_id, name FROM project_technologies WHERE project_id IN (?) ORDER BY position ASC, id ASC', [ids]);
  let images = [];
  if (withImages) {
    [images] = await pool.query('SELECT id, project_id, url, caption FROM project_images WHERE project_id IN (?) ORDER BY position ASC, id ASC', [ids]);
  }
  return projects.map((p) => ({
    ...normalize(p),
    technologies: techs.filter((t) => t.project_id === p.id).map((t) => t.name),
    ...(withImages ? { images: images.filter((i) => i.project_id === p.id).map(({ id, url, caption }) => ({ id, url, caption })) } : {}),
  }));
}

exports.list = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${LIST_COLS} FROM projects ORDER BY display_order ASC, year DESC, id DESC`);
  res.json(await attach(rows));
});

exports.getOne = asyncHandler(async (req, res) => {
  const key = req.params.id;
  const [rows] = /^\d+$/.test(key)
    ? await pool.execute('SELECT * FROM projects WHERE id = ?', [key])
    : await pool.execute('SELECT * FROM projects WHERE slug = ?', [key]);
  if (!rows.length) throw new ApiError(404, 'Project not found.');
  const [project] = await attach(rows, { withImages: true });
  res.json(project);
});

async function uniqueSlug(conn, base, ignoreId = 0) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while ((await conn.execute('SELECT id FROM projects WHERE slug = ? AND id <> ?', [slug, ignoreId]))[0].length) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

async function replaceChildren(conn, projectId, body) {
  if (body.technologies !== undefined) {
    await conn.execute('DELETE FROM project_technologies WHERE project_id = ?', [projectId]);
    const unique = [...new Set(body.technologies)];
    for (let i = 0; i < unique.length; i += 1) {
      await conn.execute('INSERT INTO project_technologies (project_id, name, position) VALUES (?, ?, ?)', [projectId, unique[i], i]);
    }
  }
  if (body.images !== undefined) {
    await conn.execute('DELETE FROM project_images WHERE project_id = ?', [projectId]);
    for (let i = 0; i < body.images.length; i += 1) {
      await conn.execute('INSERT INTO project_images (project_id, url, caption, position) VALUES (?, ?, ?, ?)', [projectId, body.images[i].url, nullIfEmpty(body.images[i].caption), i]);
    }
  }
}

const scalarValues = (b) => [
  ...TEXT_COLS.map((c) => nullIfEmpty(b[c])),
  b.featured ? 1 : 0,
  b.display_order === undefined || b.display_order === '' ? 0 : b.display_order,
  nullIfEmpty(b.year),
  JSON.stringify(b.features || []),
  JSON.stringify(b.highlights || []),
];

exports.create = asyncHandler(async (req, res) => {
  const b = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const slug = await uniqueSlug(conn, slugify(b.slug || b.name));
    const [result] = await conn.execute(
      `INSERT INTO projects (slug, name, ${TEXT_COLS.join(', ')}, featured, display_order, year, features, highlights)
       VALUES (?, ?, ${TEXT_COLS.map(() => '?').join(', ')}, ?, ?, ?, ?, ?)`,
      [slug, b.name, ...scalarValues(b)],
    );
    await replaceChildren(conn, result.insertId, b);
    await conn.commit();
    req.params.id = String(result.insertId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  res.status(201);
  return exports.getOne(req, res, (e) => { throw e; });
});

exports.update = asyncHandler(async (req, res) => {
  const b = req.body;
  const id = Number(req.params.id);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[existing]] = await conn.execute('SELECT id, slug FROM projects WHERE id = ? FOR UPDATE', [id]);
    if (!existing) throw new ApiError(404, 'Project not found.');
    const slug = b.slug ? await uniqueSlug(conn, slugify(b.slug), id) : existing.slug;
    await conn.execute(
      `UPDATE projects SET slug = ?, name = ?, ${TEXT_COLS.map((c) => `${c} = ?`).join(', ')},
       featured = ?, display_order = ?, year = ?, features = ?, highlights = ? WHERE id = ?`,
      [slug, b.name, ...scalarValues(b), id],
    );
    await replaceChildren(conn, id, b);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return exports.getOne(req, res, (e) => { throw e; });
});

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new ApiError(404, 'Project not found.');
  res.status(204).end();
});
