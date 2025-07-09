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
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export const getConnection = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    try {
      console.log('🔄 Attempting database connection...');
      console.log('📡 Server:', config.database.server);
      console.log('🗄️  Database:', config.database.database);
      console.log('👤 Username:', config.database.username);
      console.log('🔐 Password length:', config.database.password?.length || 0);
      
      pool = new sql.ConnectionPool(dbConfig);
      await pool.connect();
      console.log('✅ Connected to MSSQL database successfully!');
    } catch (error: any) {
      console.error('❌ Database connection failed with details:');
      console.error('- Error Message:', error.message);
      console.error('- Error Code:', error.code);
      console.error('- Error Number:', error.number);
      console.error('- Server:', error.server);
      console.error('- State:', error.state);
      console.error('- Full Error:', error);
      throw error;
    }
  }
  return pool;
};

export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('🔌 Database connection closed');
  }
};