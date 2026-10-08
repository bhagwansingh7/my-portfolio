const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { sitemap } = require('./controllers/sitemapController');

const app = express();

app.set('trust proxy', 1); // behind nginx / a load balancer: needed for correct client IPs in rate limiting
app.disable('x-powered-by');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, cb) => (!origin || env.corsOrigins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Uploaded files: served as static, inert content (CSP sandbox + nosniff via helmet).
app.use(
  '/uploads',
  (req, res, next) => {
    res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.set('Cache-Control', 'public, max-age=604800, immutable');
    next();
  },
  express.static(env.uploadDir, { index: false, dotfiles: 'deny' }),
);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/sitemap.xml', sitemap);
app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
