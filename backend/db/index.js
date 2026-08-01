import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({
    path: './.env'
});

const isProd = process.env.NODE_ENV === 'production';

// In production, verify the certificate chain (rejectUnauthorized: true).
// Only disable verification explicitly for local development against a DB
// without a valid cert (e.g. self-signed), never in production.
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
  ? false
  : true;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized
    }
  },
  logging: false
});

// ALTERING the schema automatically on every boot is dangerous in production
// (it can drop/rename columns and destroy data). Use the migrations in
// `backend/migrations/` instead. `sync()` below only creates tables that do
// not exist yet and never touches existing ones.

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    if (!isProd) {
      await sequelize.sync();
      console.log('Database tables ensured (dev). Use migrations in production.');
    } else {
      console.log('Skipping auto-sync in production. Run migrations manually.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { sequelize, connectDB };
