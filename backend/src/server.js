const env = require('./config/env');
const { waitForDatabase } = require('./config/db');
const app = require('./app');

(async () => {
  await waitForDatabase();
  const server = app.listen(env.port, () => console.log(`[server] API listening on :${env.port} (${env.nodeEnv})`));

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
