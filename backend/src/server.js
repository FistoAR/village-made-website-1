import dns from 'dns';
// Prefer IPv4 DNS resolution over IPv6 to resolve connection issues on IPv4-only cloud networks (e.g. Render)
dns.setDefaultResultOrder('ipv4first');

import { app } from './app.js';
import { env } from './config/env.js';
import { initDb } from './config/initDb.js';

// Initialize Database Tables
await initDb();

const server = app.listen(env.PORT, () => {
  console.log(`\n🚀  Village Made API`);
  console.log(`   ► Environment : ${env.NODE_ENV}`);
  console.log(`   ► Listening on: http://localhost:${env.PORT}`);
  console.log(`   ► API base    : http://localhost:${env.PORT}/api\n`);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('✅  Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('❌  Unhandled Promise Rejection:', reason);
  process.exit(1);
});
