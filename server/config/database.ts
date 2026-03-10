import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  isProduction
    ? (process.env.DB_CONNECTION_STRING as string)
    : `postgres://postgres:password@localhost:5432/PROJECT_NAME_dev`,
  {
    logging: false,
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          connectTimeout: 20_000, // 20 seconds to establish initial connection
        }
      : {},
    pool: {
      max: 5,
      min: 1,
      acquire: 30_000,
      idle: 30_000, // Max idle time before releasing (10s → 30s)
      evict: 10_000, // Check for idle connections every 10s
    },
    retry: {
      max: 3, // Retry up to 3 times
      backoffBase: 1000, // Start with 1s delay
      backoffExponent: 1.5, // Exponential backoff (1s, 1.5s, 2.25s)
    },
  }
);

export default sequelize;
