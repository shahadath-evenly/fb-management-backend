import app from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase, verifyDatabaseConnection } from './config/database.js';

const server = app.listen(env.port, async () => {
  console.log(`Backend server running on port ${env.port} [${env.nodeEnv}]`);

  const isConnected = await verifyDatabaseConnection();
  if (isConnected) {
    console.log('Database connection verified.');
  } else {
    console.warn('Database connection could not be verified. The server will keep running.');
  }
});

async function shutdown() {
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
