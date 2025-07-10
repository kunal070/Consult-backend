import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { config } from './config/config';
import { getConnection, closeConnection } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import jobPostingRoutes from './routes/jobPosting';
import consultantServiceRoutes from './routes/consultantService';
// import consultantRoutes from './routes/consultant';
// import clientRoutes from './routes/client';

// Create Fastify instance WITHOUT ZodTypeProvider
const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

const start = async () => {
  try {
    // Register security plugins
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // Disable CSP for API
    });

    // Register CORS
    await fastify.register(cors, {
      origin: [config.frontend.url, 'http://localhost:5000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Register multipart for file uploads
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    });

    // Test database connection on startup (non-blocking)
    try {
      await getConnection();
      fastify.log.info('✅ Database connection established');
    } catch (dbError) {
      fastify.log.warn('⚠️  Database connection failed, but server will continue:', dbError);
      // Don't throw - let server start anyway
    }

    // Health check route
    fastify.get('/health', async (request, reply) => {
      try {
        // Test database connection
        const pool = await getConnection();
        await pool.request().query('SELECT 1 as test');
        
        return {
          status: 'OK',
          timestamp: new Date().toISOString(),
          database: 'connected',
          server: 'running',
        };
      } catch (error) {
        reply.status(503);
        return {
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: 'Database connection failed',
        };
      }
    });

    // API Info route
    fastify.get('/api', async (request, reply) => {
      return {
        name: 'ConsultMatch API',
        version: '1.0.0',
        description: 'Backend API for ConsultMatch platform',
        endpoints: {
          health: '/health',
          auth: '/api/auth/*',
          jobs: '/api/jobs/*',
          consultantServices: '/api/consultant-services/*',
          consultant: '/api/consultant/*',
          client: '/api/client/*',
        },
        timestamp: new Date().toISOString(),
      };
    });

    // Register route modules
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(jobPostingRoutes, { prefix: '/api/jobs' });
    await fastify.register(consultantServiceRoutes, { prefix: '/api/consultant-services' });

    // await fastify.register(consultantRoutes, { prefix: '/api/consultant' });
    // await fastify.register(clientRoutes, { prefix: '/api/client' });

    // Global error handler
    fastify.setErrorHandler((error, request, reply) => {
      fastify.log.error(error);

      // Validation errors
      if (error.validation) {
        reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.validation,
        });
        return;
      }

      // Database errors
      if (error.code === 'ELOGIN') {
        reply.status(401).send({
          error: 'Database Authentication Failed',
          message: 'Unable to connect to database',
        });
        return;
      }

      if (error.code === 'ESOCKET') {
        reply.status(503).send({
          error: 'Database Connection Failed',
          message: 'Database server unavailable',
        });
        return;
      }

      // Default error response
      const statusCode = error.statusCode || 500;
      reply.status(statusCode).send({
        error: error.name || 'Internal Server Error',
        message: error.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    });

    // 404 handler
    fastify.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
        availableRoutes: [
          'GET /health',
          'GET /api',
          'POST /api/auth/login-client',
          'POST /api/auth/login-consultant',
          'POST /api/auth/register-client',
          'POST /api/auth/register-consultant',
          'GET /api/jobs',
          'POST /api/jobs',
          'GET /api/jobs/:id',
          'PUT /api/jobs/:id',
          'DELETE /api/jobs/:id',
          'GET /api/jobs/stats',
          'GET /api/jobs/search',
          'GET /api/consultant-services',
          'POST /api/consultant-services',
          'GET /api/consultant-services/:id',
          'PUT /api/consultant-services/:id',
          'DELETE /api/consultant-services/:id',
          'GET /api/consultant-services/stats',
          'GET /api/consultant-services/search',
          'GET /api/consultant-services/consultant/:consultantId',
          'GET /api/consultant-services/type/:serviceType',
        ],
      });
    });

    // Start the server
    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    });

    console.log('🚀 ConsultMatch Backend Server Started!');
    console.log(`📡 Server running on: http://localhost:${config.server.port}`);
    console.log(`💚 Health check: http://localhost:${config.server.port}/health`);
    console.log(`📋 API info: http://localhost:${config.server.port}/api`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);

  } catch (err) {
    fastify.log.error('❌ Server startup failed:', err);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    await fastify.close();
    await closeConnection();
    console.log('✅ Server closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
start();