# Developer Portfolio + Personal CMS

A full-stack portfolio you manage from an admin dashboard — no code edits needed to change your content.

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide, Axios, React Router
- **Backend:** Node.js + Express (CommonJS), MySQL 8, JWT in HTTP-only cookies, bcryptjs, multer, express-validator
- **Infra:** Docker + Docker Compose (nginx serves the frontend and proxies `/api` and `/uploads` to the backend)

## Run it (fresh machine)

Requirements: [Docker](https://docs.docker.com/get-docker/) with Compose v2. Nothing else.

```bash
cp .env.example .env
```

Open `.env` and fill in the blanks:

| Variable | What to put |
| --- | --- |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | Any strong passwords |
| `JWT_SECRET` | `openssl rand -hex 32` (32+ characters) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Your admin login (password 10+ characters) |

Then:

```bash
docker compose up --build
```

First start takes a couple of minutes (image builds + MySQL initialisation). When it settles:

| What | URL |
| --- | --- |
| Public portfolio | http://localhost:5173 |
| Admin login | http://localhost:5173/admin/login |
| API health | http://localhost:5173/api/health |

Stop with `Ctrl+C`; `docker compose down` removes containers but **keeps** your data (MySQL and uploads live in named volumes). `docker compose down -v` wipes everything.

> If you change `DB_*` values after the first run, MySQL keeps the old credentials in its volume. Run `docker compose down -v` to start fresh.

## What to replace (demo content)

Everything below is editable from **/admin/dashboard** — nothing needs a code change.

| Replace | Where |
| --- | --- |
| NAME, headline, intro | Admin → About |
| PROFILE IMAGE | Admin → About → Profile picture |
| BIO, education, achievements, location | Admin → About |
| EMAIL (public) | Admin → About → Public email |
| GITHUB, LINKEDIN, email link | Admin → Social links |
| RESUME (PDF) | Admin → Resume |
| PROJECT INFORMATION (3 demo projects) | Admin → Projects |
| Skills | Admin → Skills |
| Page title, meta description, availability badge | Admin → Settings |

The seed script only fills **empty** tables, so restarting never overwrites your edits. The seeded name is a placeholder (`Bhagwan Singh`) and URLs use `your-username`.

Also update `frontend/public/robots.txt` (the `Sitemap:` line) and `FRONTEND_URL` in `.env` with your real domain when you deploy.

## Local development without Docker

```bash
# 1. MySQL 8 running locally, then load the schema:
mysql -u root -p -e "CREATE DATABASE portfolio CHARACTER SET utf8mb4"
mysql -u root -p portfolio < database/init.sql

# 2. Backend
cd backend
cp ../.env.example .env        # set DB_HOST=localhost, DB_USER, DB_PASSWORD, JWT_SECRET, ADMIN_*, NODE_ENV=development
npm install
npm run seed
npm run dev                    # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                    # http://localhost:5173 (proxies /api and /uploads to :5000)
```

## Project structure

```
portfolio/
├── frontend/                 React + Vite app (served by nginx in Docker)
│   ├── src/
│   │   ├── components/       Hero, About, Skills, Projects, Contact, Modal, admin form widgets…
│   │   ├── pages/            Home, ProjectDetails, NotFound, admin/*
│   │   ├── layouts/          PublicLayout (navbar, transitions), AdminLayout (sidebar CMS shell)
│   │   ├── context/          Auth, Theme, Toast, Portfolio (public data)
│   │   ├── hooks/ services/  useSeo, Axios client
│   │   └── App.jsx
│   ├── nginx.conf  Dockerfile
├── backend/
│   ├── src/
│   │   ├── controllers/ routes/ middleware/ services/ config/ utils/
│   │   └── app.js  server.js
│   ├── seed.js               Idempotent demo data + admin account
│   └── Dockerfile
├── database/init.sql         Schema (runs on first MySQL start)
├── docker-compose.yml  .env.example  .gitignore
```

## Database

`admin_users`, `portfolio` (single About row), `settings`, `skills`, `projects`, `project_technologies`, `project_images`, `contact_messages`, `social_links` — with primary/foreign keys (`ON DELETE CASCADE` for project children), indexes for the common queries, `CHECK` constraints and timestamps. Images are stored as files; MySQL only keeps the path (`/uploads/…`).

View stored contact messages directly:

```bash
docker compose exec mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" portfolio -e "SELECT id,name,email,subject,status,created_at FROM contact_messages ORDER BY id DESC"'
```

## API

Public: `GET /api/portfolio`, `/api/skills`, `/api/projects`, `/api/projects/:idOrSlug`, `/api/social-links`, `/api/settings`, `POST /api/contact`, `GET /sitemap.xml`
Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PUT /api/auth/password`
Admin only (cookie + admin role): `PUT /api/portfolio`, `PUT /api/settings`, `POST|PUT|DELETE /api/skills[/:id]`, `PUT /api/skills/reorder`, `POST|PUT|DELETE /api/projects[/:id]`, `POST|PUT|DELETE /api/social-links[/:id]`, `GET /api/messages`, `PUT /api/messages/:id/{read|unread|archive}`, `DELETE /api/messages/:id`, `POST /api/uploads?kind=image|document`, `GET /api/stats`

## Security notes

- Passwords hashed with bcrypt (cost 12). Login compares against a dummy hash for unknown emails so timing doesn't reveal accounts.
- JWT lives only in an **HTTP-only, SameSite=Lax** cookie — never in `localStorage`. Set `COOKIE_SECURE=true` behind HTTPS.
- Every write/upload route passes `authenticate` + `requireAdmin`. Public disabled skills/links are hidden from visitors.
- All SQL is parameterised. Input is validated (express-validator) and stripped of HTML; React renders everything as text.
- Uploads: MIME allow-list, size limits, magic-byte check, random server-generated filenames; `/uploads` is served with `nosniff` and a sandboxing CSP.
- Rate limits: login (10 / 15 min), contact (5 / hour per IP), general API. Contact has a honeypot field plus a pluggable spam-check list (`backend/src/services/spamFilter.js`) for adding CAPTCHA later.
- Helmet headers, CORS limited to `FRONTEND_URL` (+ `CORS_ORIGINS`), request body size caps, no secrets in the frontend.
- For production, put the stack behind HTTPS (Caddy, Traefik, a cloud load balancer) and swap the upload driver for S3/R2 if you want object storage — the rest of the app only stores the resulting URL/path.

## Troubleshooting

- **`required variable … is missing`** – you skipped a value in `.env`.
- **Backend keeps restarting** – check `docker compose logs backend`. `JWT_SECRET must be at least 32 characters` is the most common cause.
- **Can't log in** – the admin is created only if the email doesn't exist yet. After changing `ADMIN_*`, either change the password in Admin → Settings or `docker compose down -v` to start clean.
- **Port 5173 busy** – change the left side of `5173:80` in `docker-compose.yml`, and `FRONTEND_URL` to match.
