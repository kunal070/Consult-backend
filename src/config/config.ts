import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '5000'),
    host: '0.0.0.0',
  },
  database: {
    server: process.env.AZURE_SQL_SERVER!,
    database: process.env.AZURE_SQL_DATABASE!,
    username: process.env.AZURE_SQL_USERNAME!,
    password: process.env.AZURE_SQL_PASSWORD!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  email: {
    user: process.env.GMAIL_USER!,
    password: process.env.GMAIL_APP_PASSWORD!,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'AZURE_SQL_SERVER',
  'AZURE_SQL_DATABASE', 
  'AZURE_SQL_USERNAME',
  'AZURE_SQL_PASSWORD',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}