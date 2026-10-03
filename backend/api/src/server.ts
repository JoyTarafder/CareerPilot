import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`[careerpilot-api] listening on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

const shutdown = () => {
  console.log('[careerpilot-api] Gracefully shutting down...');
  server.close(() => {
    console.log('[careerpilot-api] Closed HTTP server.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
