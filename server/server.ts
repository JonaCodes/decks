import express from 'express';
import path from 'path';
import helmet from 'helmet';
import { exec } from 'child_process';
import util from 'util';
import { fileURLToPath } from 'url';
import sequelize from './config/database';
import logger from './logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// TODO: If scaling to multiple instances, this per-process flag is fine since
// each instance runs its own migrations. However, consider a distributed lock
// (e.g., Postgres advisory lock) to prevent concurrent migration execution.
let serverReady = false;

// Trust Render's proxy so middleware can use the client IP.
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        scriptSrc: [
          "'self'",
          "'unsafe-eval'",
          "'unsafe-inline'",
          'blob:',
          'https://cdn.jsdelivr.net',
        ],
        workerSrc: ["'self'", 'blob:'],
        connectSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://*.supabase.co',
          'wss://*.supabase.co',
          'https://pypi.org',
          'https://files.pythonhosted.org',
        ],
        imgSrc: ["'self'", 'https:', 'data:', 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  })
);

app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => {
  if (serverReady) {
    return res.json({ ok: true });
  }
  return res.status(503).json({ ok: false, message: 'Starting up' });
});

app.get('/auth/callback', (_req, res) => {
  const filePath = path.resolve(__dirname, '../../public/dist/index.html');
  return res.sendFile(filePath);
});

app.get('/db-health', async (_req, res) => {
  const start = Date.now();
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, duration: Date.now() - start });
  } catch (err) {
    logger.error(err, 'DB health failed');
    return res.status(500).json({ ok: false, error: JSON.stringify(err) });
  }
});

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../../public/dist');
  app.use(express.static(buildPath));
  app.get('*', (_req, res) => {
    return res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const execPromise = util.promisify(exec);

const runMigrations = async (): Promise<void> => {
  try {
    const { stdout } = await execPromise('pnpm run migrate');
    logger.info({ stdout }, 'Migration output');
  } catch (error) {
    logger.error(error, 'Error running migrations');
    throw error;
  }
};

const monitorDBPool = (): void => {
  if (process.env.NODE_ENV !== 'production') return;

  const pool = (sequelize as any).connectionManager?.pool;
  if (!pool) return;

  setInterval(() => {
    logger.info(
      {
        size: pool.size,
        available: pool.available,
        using: pool.using,
        waiting: pool.waiting,
      },
      'DB pool status'
    );
  }, 60_000).unref();
};

const outputDBStartupConfig = (): void => {
  if (process.env.NODE_ENV !== 'production') return;

  let dbHost = 'unknown';
  let dbPort = 'unknown';

  if (process.env.DB_CONNECTION_STRING) {
    const dbUrl = new URL(process.env.DB_CONNECTION_STRING);
    dbHost = dbUrl.hostname;
    dbPort = dbUrl.port;
  }

  logger.info(
    {
      nodeEnv: process.env.NODE_ENV,
      dbHost,
      dbPort,
      pool: (sequelize as any).options.pool,
    },
    'DB config at startup'
  );
};

(async () => {
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server is running');
  });
  server.requestTimeout = 60_000;

  try {
    await runMigrations();
    await sequelize.authenticate();
    logger.info('Database connected');

    serverReady = true;
    outputDBStartupConfig();
    monitorDBPool();
  } catch (error) {
    logger.error(error, 'Unable to connect to the database');
    process.exit(1);
  }
})();
