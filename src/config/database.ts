import sql from 'mssql';
import { config } from './config';

const dbConfig: sql.config = {
  server: config.database.server,
  database: config.database.database,
  user: config.database.username,
  password: config.database.password,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export const getConnection = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connected to MSSQL database');
  }
  return pool;
};

export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Database connection closed');
  }
};