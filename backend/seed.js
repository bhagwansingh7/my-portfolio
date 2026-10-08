/**
 * Idempotent seed script. Safe to run on every container start:
 *  - creates the admin account if it does not exist
 *  - fills empty tables with demo data (never overwrites content you've edited)
 *  - writes placeholder images + a placeholder resume into the uploads folder
 *
 * >>> Replace the demo content from the admin dashboard (/admin/login). <<<
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const env = require('./src/config/env');
const { pool, waitForDatabase } = require('./src/config/db');

// ---------- placeholder assets ----------
const svgWrap = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">` +
  `<defs><pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#2a3441" stroke-width="1"/></pattern>` +
  `<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2431"/><stop offset="1" stop-color="#0f141b"/></linearGradient></defs>` +
  `<rect width="${w}" height="${h}" fill="url(#a)"/><rect width="${w}" height="${h}" fill="url(#g)" opacity=".7"/>${inner}</svg>`;

const profileSvg = (initials) =>
  svgWrap(800, 1000, `<circle cx="400" cy="400" r="190" fill="#162029" stroke="#5eb0d6" stroke-width="3"/>` +
    `<text x="400" y="440" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="140" font-weight="700" fill="#e8ecf2">${initials}</text>` +
    `<text x="400" y="780" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#8c98a8">Replace this image from Admin → About</text>`);

const box = (x, y, w, h, label, accent) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#161d27" stroke="${accent ? '#5eb0d6' : '#3a4656'}" stroke-width="2"/>` +
  `<text x="${x + w / 2}" y="${y + h / 2 + 8}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#e8ecf2">${label}</text>`;
const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#5eb0d6" stroke-width="2" stroke-dasharray="6 6" opacity=".8"/>`;

const coverSvg = (title, nodes) =>
  svgWrap(1600, 900,
    `<text x="90" y="150" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#e8ecf2">${title}</text>` +
    `<text x="90" y="205" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#8c98a8">Demo cover — replace in Admin → Projects</text>` +
    nodes);

const COVERS = {
  'seed-supportflow.svg': coverSvg('SupportFlow',
    line(400, 520, 640, 520) + line(960, 520, 1200, 520) + line(800, 560, 800, 660) +
    box(140, 470, 260, 100, 'React app') + box(640, 470, 320, 100, 'Express API', true) + box(1200, 470, 260, 100, 'AI assistant') + box(640, 660, 320, 100, 'MySQL')),
  'seed-agrosathi.svg': coverSvg('AgroSathi',
    line(400, 520, 640, 520) + line(960, 520, 1200, 400) + line(960, 520, 1200, 640) + line(800, 560, 800, 660) +
    box(140, 470, 260, 100, 'React PWA') + box(640, 470, 320, 100, 'Express API', true) + box(1200, 350, 260, 100, 'RAG pipeline') + box(1200, 590, 260, 100, 'Weather API') + box(640, 660, 320, 100, 'MySQL + Redis')),
  'seed-cineopt.svg': coverSvg('CineOpt',
    line(400, 520, 640, 520) + line(960, 520, 1200, 520) + line(800, 560, 800, 660) +
    box(140, 470, 260, 100, 'React UI') + box(640, 470, 320, 100, 'Express API', true) + box(1200, 470, 260, 100, 'FastAPI engine') + box(640, 660, 320, 100, 'MySQL')),
};

// Minimal valid one-page PDF so the "Resume" button works on first launch.
const placeholderPdf = () => {
  const stream = 'BT /F1 22 Tf 72 720 Td (Replace this placeholder resume) Tj 0 -30 Td /F1 12 Tf (Upload your own PDF from Admin > Resume.) Tj ET';
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return out;
};

function writeAssets() {
  fs.mkdirSync(env.uploadDir, { recursive: true });
  const files = { 'seed-profile.svg': profileSvg('BS'), ...COVERS, 'seed-resume.pdf': placeholderPdf() };
  Object.entries(files).forEach(([name, content]) => {
    const target = path.join(env.uploadDir, name);
    if (!fs.existsSync(target)) fs.writeFileSync(target, content);
  });
}

// ---------- demo data ----------
const SKILLS = {
  Languages: [['Java', 'Coffee'], ['JavaScript', 'Braces'], ['SQL', 'Database']],
  Backend: [['Node.js', 'Server'], ['Express.js', 'Route'], ['REST APIs', 'Webhook'], ['Authentication', 'KeyRound'], ['Authorization', 'ShieldCheck']],
  Frontend: [['React', 'Atom'], ['HTML', 'Code2'], ['CSS', 'Palette'], ['Tailwind CSS', 'Wind']],
  Database: [['MySQL', 'Database'], ['Database Design', 'Table2'], ['Indexing', 'Gauge'], ['Transactions', 'ArrowLeftRight']],
  'DevOps & Tools': [['Docker', 'Container'], ['Docker Compose', 'Layers'], ['Git', 'GitBranch'], ['GitHub', 'Github'], ['GitHub Actions', 'Workflow']],
  'CS Fundamentals': [['Data Structures & Algorithms', 'Binary'], ['DBMS', 'Database'], ['OOP', 'Boxes'], ['Operating Systems', 'Cpu'], ['Computer Networks', 'Network']],
};

const PROJECTS = [
  {
    name: 'SupportFlow', cover: 'seed-supportflow.svg', year: 2025, featured: 1,
    short: 'AI-assisted customer support platform that triages tickets, drafts replies and keeps every conversation in one place.',
    description: 'SupportFlow gives small teams a shared inbox with an AI assistant that classifies incoming tickets, suggests replies from past conversations and escalates the ones that need a human.',
    problem: 'Support requests arrive from many channels, get answered inconsistently and repeat the same questions. Small teams lose hours to triage instead of solving problems.',
    solution: 'A single ticket pipeline with role-based access, automatic categorisation and priority scoring, and reply suggestions grounded in previous resolved tickets.',
    architecture: 'React SPA → Express REST API (JWT in HTTP-only cookies) → MySQL. A service layer isolates the AI provider so it can be swapped or disabled. Everything runs through Docker Compose.',
    challenges: 'Keeping ticket state consistent when several agents act at once, and keeping AI suggestions fast without blocking the request cycle.',
    decisions: 'Used row-level status transitions inside transactions to avoid double assignment, indexed on (status, priority, created_at) for the inbox query, and kept AI calls behind a timeout with a graceful fallback.',
    github: 'https://github.com/your-username/supportflow', live: null,
    techs: ['React', 'Express', 'MySQL', 'JWT', 'Docker', 'REST APIs'],
    features: ['Role-based access for admins and agents', 'Ticket lifecycle with assignment and priorities', 'AI reply suggestions with agent approval', 'Searchable conversation history'],
    highlights: ['Transactional ticket assignment', 'Composite indexes for inbox queries', 'Provider-agnostic AI service layer'],
  },
  {
    name: 'AgroSathi', cover: 'seed-agrosathi.svg', year: 2025, featured: 1,
    short: 'Farmer assistance platform combining crop guidance, weather data and an AI assistant grounded in agricultural knowledge.',
    description: 'AgroSathi helps farmers ask questions about crops, pests and weather and get answers grounded in a curated knowledge base, with live weather and real-time support chat.',
    problem: 'Farmers often lack quick access to trustworthy, localised advice, and generic chatbots answer confidently even when they are wrong.',
    solution: 'A retrieval-augmented assistant that answers from vetted documents, cites its sources, and sits next to weather forecasts and a support channel.',
    architecture: 'React/Vite client, Express API, MySQL for data, Redis for caching and rate limits, Socket.IO for live chat, and a RAG pipeline for question answering. Docker Compose wires the services together.',
    challenges: 'Keeping answers grounded rather than invented, and serving weather data quickly without exhausting upstream API limits.',
    decisions: 'Cached weather responses in Redis with short TTLs, retrieved context before every model call, and returned the sources alongside each answer.',
    github: 'https://github.com/your-username/agrosathi', live: null,
    techs: ['React', 'Express', 'MySQL', 'Redis', 'Socket.IO', 'JWT', 'AI / RAG', 'Docker'],
    features: ['Grounded AI answers with sources', 'Weather forecasts for the farmer’s region', 'Real-time support chat', 'Secure accounts with JWT'],
    highlights: ['Retrieval-augmented generation', 'Redis caching for upstream APIs', 'WebSocket-based live support'],
  },
  {
    name: 'CineOpt', cover: 'seed-cineopt.svg', year: 2024, featured: 0,
    short: 'Cinema seating optimiser that assigns groups to seats to maximise occupancy while respecting spacing rules.',
    description: 'CineOpt takes a screening’s seat map and the booked groups, then computes an arrangement that keeps groups together, honours spacing constraints and fills the hall efficiently.',
    problem: 'Manual seat assignment wastes capacity and breaks down when spacing rules or group sizes change.',
    solution: 'A dedicated algorithm engine scores candidate layouts and returns the best arrangement through a simple API consumed by the booking app.',
    architecture: 'React front end and Express API with MySQL for screenings and bookings. A separate Python FastAPI service runs the optimisation algorithm. GitHub Actions builds and tests each change.',
    challenges: 'The search space grows quickly with hall size, so the engine needed pruning to stay interactive.',
    decisions: 'Split the algorithm into its own service so it can scale and be tested independently, and used greedy placement with local improvement instead of exhaustive search.',
    github: 'https://github.com/your-username/cineopt', live: null,
    techs: ['React', 'Express', 'MySQL', 'Python', 'FastAPI', 'Docker', 'GitHub Actions'],
    features: ['Interactive seat map', 'Group-aware seat assignment', 'Configurable spacing rules', 'Occupancy statistics per screening'],
    highlights: ['Separate algorithm microservice', 'Heuristic search with pruning', 'CI pipeline with automated tests'],
  },
];

const empty = async (table) => (await pool.query(`SELECT COUNT(*) AS n FROM ${table}`))[0][0].n === 0;

async function seed() {
  await waitForDatabase();
  writeAssets();

  // Admin account
  if (!env.adminEmail || env.adminPassword.length < 10) {
    console.warn('[seed] ADMIN_EMAIL / ADMIN_PASSWORD (min 10 chars) not set — skipping admin creation.');
  } else {
    const [rows] = await pool.execute('SELECT id FROM admin_users WHERE email = ?', [env.adminEmail]);
    if (!rows.length) {
      const hash = await bcrypt.hash(env.adminPassword, 12);
      await pool.execute('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)', [env.adminEmail, hash]);
      console.log(`[seed] admin account created for ${env.adminEmail}`);
    }
  }

  // About
  if (await empty('portfolio')) {
    await pool.execute(
      `INSERT INTO portfolio (id, name, headline, intro, bio, profile_image, resume_url, public_email, location, developer_focus, current_focus, education, achievements)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Bhagwan Singh',
        'Full-Stack Developer building scalable and reliable web applications.',
        'I design and build web products end to end — from the database schema and API to the interface people use.',
        'I’m a software developer who enjoys the full path of a feature: modelling the data, designing a clean API, and shaping an interface that feels fast and clear.\n\nMy projects lean on real engineering problems — authentication, relational design, background processing and containerised deployment — and I care about code that is easy to read, test and change.\n\n(Placeholder text — edit this from Admin → About.)',
        '/uploads/seed-profile.svg',
        '/uploads/seed-resume.pdf',
        'you@example.com',
        'India',
        'Backend-leaning full-stack work: REST API design, relational databases, secure authentication and clean architecture, with React on the front end.',
        'Deepening system design and database performance, and shipping more of my work with automated CI/CD.',
        JSON.stringify([{ degree: 'B.Tech in Computer Science', institution: 'Your University', period: '2022 – 2026', details: 'Replace with your degree, institution and relevant coursework.' }]),
        JSON.stringify(['Built and deployed three full-stack projects with Docker', 'Solved 300+ data structures and algorithms problems']),
      ],
    );
  }

  // Settings (INSERT IGNORE keeps anything you already changed)
  const settings = {
    site_title: 'Bhagwan Singh — Full-Stack Developer',
    meta_description: 'Portfolio of a full-stack developer: projects, skills and ways to get in touch.',
    availability_text: 'Open to internships and junior roles',
  };
  for (const [k, val] of Object.entries(settings)) {
    await pool.execute('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)', [k, val]);
  }

  // Skills
  if (await empty('skills')) {
    let order = 1;
    for (const [category, list] of Object.entries(SKILLS)) {
      for (const [name, icon] of list) {
        await pool.execute('INSERT INTO skills (name, category, icon, display_order) VALUES (?, ?, ?, ?)', [name, category, icon, order++]);
      }
    }
  }

  // Projects
  if (await empty('projects')) {
    let order = 1;
    for (const p of PROJECTS) {
      const slug = p.name.toLowerCase();
      const [r] = await pool.execute(
        `INSERT INTO projects (slug, name, short_description, description, problem, solution, architecture, challenges, engineering_decisions,
           cover_image, github_url, live_url, featured, display_order, year, features, highlights)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, p.name, p.short, p.description, p.problem, p.solution, p.architecture, p.challenges, p.decisions,
          `/uploads/${p.cover}`, p.github, p.live, p.featured, order++, p.year, JSON.stringify(p.features), JSON.stringify(p.highlights)],
      );
      for (let i = 0; i < p.techs.length; i += 1) {
        await pool.execute('INSERT INTO project_technologies (project_id, name, position) VALUES (?, ?, ?)', [r.insertId, p.techs[i], i]);
      }
      await pool.execute('INSERT INTO project_images (project_id, url, caption, position) VALUES (?, ?, ?, 0)', [r.insertId, `/uploads/${p.cover}`, `${p.name} architecture overview`]);
    }
  }

  // Social links
  if (await empty('social_links')) {
    const links = [
      ['github', 'GitHub', 'https://github.com/your-username'],
      ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/your-username'],
      ['email', 'Email', 'mailto:you@example.com'],
    ];
    for (let i = 0; i < links.length; i += 1) {
      await pool.execute('INSERT INTO social_links (platform, label, url, display_order) VALUES (?, ?, ?, ?)', [...links[i], i + 1]);
    }
  }

  console.log('[seed] done');
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('[seed] failed', err);
    process.exit(1);
  });
