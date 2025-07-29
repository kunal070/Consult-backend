import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  getAllClients,
  getClientById,
  getClientStats,
  GetClientsOptions,
} from '../services/clientService';

// Query parameter schemas for validation
const getClientsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  role: z.string().optional(),
});

const getClientByIdSchema = z.object({
  id: z.string().transform(val => parseInt(val)),
});

type GetClientsQuery = z.infer<typeof getClientsQuerySchema>;
type GetClientByIdParams = z.infer<typeof getClientByIdSchema>;

// Standard API response format
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Helper function to create standardized responses
const createResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
): ApiResponse<T> => ({
  success,
  message,
  data,
  error,
  timestamp: new Date().toISOString(),
});

// Get all clients with filtering and pagination
export const getAllClientsHandler = async (
  req: FastifyRequest<{ Querystring: GetClientsQuery }>,
  reply: FastifyReply
) => {
  try {
    console.log('📋 Getting all clients with filters:', req.query);

    // Validate query parameters
    const validatedQuery = getClientsQuerySchema.parse(req.query);
    
    // Validate pagination limits
    if (validatedQuery.limit && (validatedQuery.limit < 1 || validatedQuery.limit > 100)) {
      reply.status(400).send(
        createResponse(false, 'Limit must be between 1 and 100')
      );
      return;
    }

    if (validatedQuery.page && validatedQuery.page < 1) {
      reply.status(400).send(
        createResponse(false, 'Page must be greater than 0')
      );
      return;
    }

    // Get clients from service
    const result = await getAllClients(validatedQuery as GetClientsOptions);

    reply.status(200).send(
      createResponse(
        true,
        `Retrieved ${result.data.length} clients`,
        result
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting clients:', error);
    
    if (error.name === 'ZodError') {
      reply.status(400).send(
        createResponse(false, 'Invalid query parameters', undefined, error.message)
      );
    } else {
      reply.status(500).send(
        createResponse(
          false,
          'Failed to retrieve clients',
          undefined,
          error.message
        )
      );
    }
  }
};

// Get client by ID
export const getClientByIdHandler = async (
  req: FastifyRequest<{ Params: GetClientByIdParams }>,
  reply: FastifyReply
) => {
  try {
    console.log('👤 Getting client by ID:', req.params.id);

    // Validate parameters
    const validatedParams = getClientByIdSchema.parse(req.params);

    if (isNaN(validatedParams.id) || validatedParams.id <= 0) {
      reply.status(400).send(
        createResponse(false, 'Invalid client ID')
      );
      return;
    }

    // Get client from service
    const client = await getClientById(validatedParams.id);

    if (!client) {
      reply.status(404).send(
        createResponse(false, 'Client not found')
      );
      return;
    }

    reply.status(200).send(
      createResponse(
        true,
        'Client retrieved successfully',
        client
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting client by ID:', error);
    
    if (error.name === 'ZodError') {
      reply.status(400).send(
        createResponse(false, 'Invalid client ID', undefined, error.message)
      );
    } else {
      reply.status(500).send(
        createResponse(
          false,
          'Failed to retrieve client',
          undefined,
          error.message
        )
      );
    }
  }
};

// Get client statistics
export const getClientStatsHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log('📊 Getting client statistics');

    const stats = await getClientStats();

    reply.status(200).send(
      createResponse(
        true,
        'Client statistics retrieved successfully',
        stats
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting client stats:', error);
    reply.status(500).send(
      createResponse(
        false,
        'Failed to retrieve client statistics',
        undefined,
        error.message
      )
    );
  }
};

// Get client industries (for dropdown/filter options)
export const getClientIndustriesHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log('🏭 Getting client industries');

    const { getConnection } = await import('../config/database');
    
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT DISTINCT Industry as industry
      FROM Clients 
      WHERE Industry IS NOT NULL AND Industry != ''
      ORDER BY Industry
    `);

    reply.status(200).send(
      createResponse(
        true,
        'Industries retrieved successfully',
        result.recordset.map(row => row.industry)
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting industries:', error);
    reply.status(500).send(
      createResponse(
        false,
        'Failed to retrieve industries',
        undefined,
        error.message
      )
    );
  }
};

// Get client company sizes (for dropdown/filter options)
export const getClientCompanySizesHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log('🏢 Getting client company sizes');

    const { getConnection } = await import('../config/database');
    
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT DISTINCT CompanySize as companySize
      FROM Clients 
      WHERE CompanySize IS NOT NULL AND CompanySize != ''
      ORDER BY CompanySize
    `);

    reply.status(200).send(
      createResponse(
        true,
        'Company sizes retrieved successfully',
        result.recordset.map(row => row.companySize)
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting company sizes:', error);
    reply.status(500).send(
      createResponse(
        false,
        'Failed to retrieve company sizes',
        undefined,
        error.message
      )
    );
  }
};

// Get client locations (for dropdown/filter options)
export const getClientLocationsHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log('📍 Getting client locations');

    const { getConnection } = await import('../config/database');
    
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT DISTINCT Location as location
      FROM Clients 
      WHERE Location IS NOT NULL AND Location != ''
      ORDER BY Location
    `);

    reply.status(200).send(
      createResponse(
        true,
        'Locations retrieved successfully',
        result.recordset.map(row => row.location)
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting locations:', error);
    reply.status(500).send(
      createResponse(
        false,
        'Failed to retrieve locations',
        undefined,
        error.message
      )
    );
  }
};