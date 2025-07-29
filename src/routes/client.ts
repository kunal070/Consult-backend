import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllClientsHandler,
  getClientByIdHandler,
  getClientStatsHandler,
  getClientIndustriesHandler,
  getClientCompanySizesHandler,
  getClientLocationsHandler,
} from '../controllers/clientController';

export default async function clientRoutes(fastify: FastifyInstance) {
  console.log('🛣️ Registering client routes...');

  // Test route for client endpoints
  fastify.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('📍 Client test route called');
    return {
      message: 'Client routes are working!',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /api/client/ - Get all clients with filtering and pagination',
        'GET /api/client/:id - Get client by ID',
        'GET /api/client/stats - Get client statistics',
        'GET /api/client/industries - Get all industries',
        'GET /api/client/company-sizes - Get all company sizes',
        'GET /api/client/locations - Get all locations',
      ],
    };
  });
  console.log('✅ Client test route registered');

  // GET /api/client/stats - Get client statistics
  fastify.get('/stats', getClientStatsHandler);
  console.log('✅ Client stats route registered');

  // GET /api/client/industries - Get all industries for filters
  fastify.get('/industries', getClientIndustriesHandler);
  console.log('✅ Client industries route registered');

  // GET /api/client/company-sizes - Get all company sizes for filters
  fastify.get('/company-sizes', getClientCompanySizesHandler);
  console.log('✅ Client company sizes route registered');

  // GET /api/client/locations - Get all locations for filters
  fastify.get('/locations', getClientLocationsHandler);
  console.log('✅ Client locations route registered');

  // GET /api/client/:id - Get client by ID (specific route before general)
  fastify.get('/:id', getClientByIdHandler);
  console.log('✅ Client by ID route registered');

  // GET /api/client/ - Get all clients with filtering and pagination
  // This should be last to avoid conflicts with other routes
  fastify.get('/', getAllClientsHandler);
  console.log('✅ Get all clients route registered');

  console.log('✅ All client routes registered successfully');
}