import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

// Verify the certificate chain by default. Only disable explicitly for local
// dev against a DB without a valid cert (e.g. self-signed).
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
  ? false
  : true;

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized }
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { prisma, connectDB };
