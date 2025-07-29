import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { config } from './config/config';
import { getConnection, closeConnection } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import consultantRoutes from './routes/consultant';
import clientRoutes from './routes/client';

// Create Fastify instance with simpler logging to avoid encoding issues
const fastify = Fastify({
  logger: {
    level: 'info',
    // Simplified logging to avoid encoding issues
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
});

const start = async () => {
  try {
    console.log('🚀 Starting ConsultMatch Backend Server...');
    
    // Register security plugins
    console.log('🔒 Registering security plugins...');
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // Disable CSP for API
    });
    console.log('✅ Helmet registered');

    // Register CORS
    console.log('🌐 Registering CORS...');
    await fastify.register(cors, {
      origin: [config.frontend.url, 'http://localhost:5000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    console.log('✅ CORS registered');

    // Register multipart for file uploads
    console.log('📁 Registering multipart...');
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    });
    console.log('✅ Multipart registered');

    // Test database connection on startup (non-blocking)
    console.log('🗄️ Testing database connection...');
    try {
      const pool = await getConnection();
      // Simple test query
      await pool.request().query('SELECT 1 as test');
      console.log('✅ Database connection and query test successful');
    } catch (dbError: any) {
      console.warn('⚠️ Database connection failed, but server will continue:');
      console.warn('Error details:', {
        message: dbError.message,
        code: dbError.code,
        number: dbError.number,
        state: dbError.state,
        server: dbError.server
      });
      // Don't throw - let server start anyway
    }

    // Health check route
    console.log('🏥 Registering health check route...');
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
      } catch (error: any) {
        reply.status(503);
        return {
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: 'Database connection failed',
          details: error.message,
        };
      }
    });
    console.log('✅ Health check route registered');

    // API Info route
    console.log('📋 Registering API info route...');
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
    console.log('✅ API info route registered');

    // Register route modules
    console.log('🛣️ Registering auth routes...');
    try {
      await fastify.register(authRoutes, { prefix: '/api/auth' });
      console.log('✅ Auth routes registered successfully');
    } catch (routeError: any) {
      console.error('❌ Failed to register auth routes:', {
        message: routeError.message,
        stack: routeError.stack,
        name: routeError.name
      });
      throw routeError;
    }
    
    console.log('🛣️ Registering consultant routes...');
    try {
      await fastify.register(consultantRoutes, { prefix: '/api/consultant' });
      console.log('✅ Consultant routes registered successfully');
    } catch (routeError: any) {
      console.error('❌ Failed to register consultant routes:', {
        message: routeError.message,
        stack: routeError.stack,
        name: routeError.name
      });
      throw routeError;
    }

    console.log('🛣️ Registering client routes...');
    try {
      await fastify.register(clientRoutes, { prefix: '/api/client' });
      console.log('✅ Client routes registered successfully');
    } catch (routeError: any) {
      console.error('❌ Failed to register client routes:', {
        message: routeError.message,
        stack: routeError.stack,
        name: routeError.name
      });
      throw routeError;
    }

    // Global error handler
    console.log('🛡️ Setting up error handlers...');
    fastify.setErrorHandler((error, request, reply) => {
      console.error('❌ Global error handler triggered:', {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        validation: error.validation,
        code: error.code,
        name: error.name
      });

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
          'GET /api/consultant/',
          'GET /api/consultant/:id',
          'GET /api/consultant/stats',
          'GET /api/client/',
          'GET /api/client/:id',
          'GET /api/client/stats',
        ],
      });
    });
    console.log('✅ Error handlers set up');

    // Start the server
    console.log('🚀 Starting server listener...');
    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    });

    console.log('🎉 ConsultMatch Backend Server Started Successfully!');
    console.log(`📡 Server running on: http://localhost:${config.server.port}`);
    console.log(`💚 Health check: http://localhost:${config.server.port}/health`);
    console.log(`📋 API info: http://localhost:${config.server.port}/api`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);

  } catch (err: any) {
    console.error('❌ Server startup failed with detailed error:');
    console.error('Error message:', err.message);
    console.error('Error name:', err.name);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    
    // Additional debug info
    if (err.cause) {
      console.error('Error cause:', err.cause);
    }
    
    // Check if it's a specific type of error
    if (err.validation) {
      console.error('Validation errors:', err.validation);
    }
    
    if (err.statusCode) {
      console.error('Status code:', err.statusCode);
    }
    
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
  } catch (err: any) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
start();