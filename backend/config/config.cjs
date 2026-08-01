const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env'))
  ? path.resolve(__dirname, '../.env')
  : './.env';
require('dotenv').config({ path: envPath });

const commonSsl = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : { ssl: { require: true, rejectUnauthorized: true } };

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: commonSsl
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: commonSsl
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: commonSsl
  }
};
