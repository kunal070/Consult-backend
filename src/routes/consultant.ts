import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllConsultantsHandler,
  getConsultantByIdHandler,
  getConsultantStatsHandler,
  getConsultantSpecializationsHandler,
  getConsultantLocationsHandler,
} from '../controllers/consultantController';

export default async function consultantRoutes(fastify: FastifyInstance) {
  console.log('🛣️ Registering consultant routes...');

  // Test route for consultant endpoints
  fastify.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('📍 Consultant test route called');
    return {
      message: 'Consultant routes are working!',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /api/consultant/ - Get all consultants with filtering and pagination',
        'GET /api/consultant/:id - Get consultant by ID',
        'GET /api/consultant/stats - Get consultant statistics',
        'GET /api/consultant/specializations - Get all specializations',
        'GET /api/consultant/locations - Get all locations',
      ],
    };
  });
  console.log('✅ Consultant test route registered');

  // GET /api/consultant/stats - Get consultant statistics
  fastify.get('/stats', getConsultantStatsHandler);
  console.log('✅ Consultant stats route registered');

  // GET /api/consultant/specializations - Get all specializations for filters
  fastify.get('/specializations', getConsultantSpecializationsHandler);
  console.log('✅ Consultant specializations route registered');

  // GET /api/consultant/locations - Get all locations for filters
  fastify.get('/locations', getConsultantLocationsHandler);
  console.log('✅ Consultant locations route registered');

  // GET /api/consultant/:id - Get consultant by ID (specific route before general)
  fastify.get('/:id', getConsultantByIdHandler);
  console.log('✅ Consultant by ID route registered');

  // GET /api/consultant/ - Get all consultants with filtering and pagination
  // This should be last to avoid conflicts with other routes
  fastify.get('/', getAllConsultantsHandler);
  console.log('✅ Get all consultants route registered');

  console.log('✅ All consultant routes registered successfully');
}