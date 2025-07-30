// src/routes/connection.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ConnectionController } from '../controllers/connectionController';

export default async function connectionRoutes(fastify: FastifyInstance) {
  console.log('🛣️ Registering connection routes...');

  // Test route
  fastify.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      message: 'Connection routes are working!',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'POST /api/connections - Send connection request',
        'GET /api/connections - Get user connections',
        'GET /api/connections/pending - Get pending requests',
        'GET /api/connections/stats - Get connection statistics',
        'GET /api/connections/:id - Get connection by ID',
        'PATCH /api/connections/:id - Update connection status',
        'GET /api/connections/status/:userType/:userId - Check connection status',
      ],
    };
  });

  // GET /api/connections/stats
  fastify.get('/stats', ConnectionController.getConnectionStats);

  // GET /api/connections/pending
  fastify.get('/pending', ConnectionController.getPendingRequests);

  // GET /api/connections/status/:userType/:userId
  fastify.get('/status/:userType/:userId', ConnectionController.getConnectionStatus);

  // POST /api/connections
  fastify.post('/', ConnectionController.createConnection);

  // GET /api/connections
  fastify.get('/', ConnectionController.getUserConnections);

  // GET /api/connections/:id
  fastify.get('/:id', ConnectionController.getConnectionById);

  // PATCH /api/connections/:id
  fastify.patch('/:id', ConnectionController.updateConnectionStatus);

  console.log('✅ All connection routes registered successfully');
}