import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  getAllConsultants,
  getConsultantById,
  getConsultantStats,
  GetConsultantsOptions,
} from '../services/consultantService';

// Query parameter schemas for validation
const getConsultantsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  specialization: z.string().optional(),
  location: z.string().optional(),
  workType: z.string().optional(),
  workMode: z.string().optional(),
  minExperience: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  maxExperience: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

const getConsultantByIdSchema = z.object({
  id: z.string().transform(val => parseInt(val)),
});

type GetConsultantsQuery = z.infer<typeof getConsultantsQuerySchema>;
type GetConsultantByIdParams = z.infer<typeof getConsultantByIdSchema>;

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

// Get all consultants with filtering and pagination
export const getAllConsultantsHandler = async (
  req: FastifyRequest<{ Querystring: GetConsultantsQuery }>,
  reply: FastifyReply
) => {
  try {
    console.log('📋 Getting all consultants with filters:', req.query);

    // Validate query parameters
    const validatedQuery = getConsultantsQuerySchema.parse(req.query);
    
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

    // Get consultants from service
    const result = await getAllConsultants(validatedQuery as GetConsultantsOptions);

    reply.status(200).send(
      createResponse(
        true,
        `Retrieved ${result.data.length} consultants`,
        result
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting consultants:', error);
    
    if (error.name === 'ZodError') {
      reply.status(400).send(
        createResponse(false, 'Invalid query parameters', undefined, error.message)
      );
    } else {
      reply.status(500).send(
        createResponse(
          false,
          'Failed to retrieve consultants',
          undefined,
          error.message
        )
      );
    }
  }
};

// Get consultant by ID
export const getConsultantByIdHandler = async (
  req: FastifyRequest<{ Params: GetConsultantByIdParams }>,
  reply: FastifyReply
) => {
  try {
    console.log('👤 Getting consultant by ID:', req.params.id);

    // Validate parameters
    const validatedParams = getConsultantByIdSchema.parse(req.params);

    if (isNaN(validatedParams.id) || validatedParams.id <= 0) {
      reply.status(400).send(
        createResponse(false, 'Invalid consultant ID')
      );
      return;
    }

    // Get consultant from service
    const consultant = await getConsultantById(validatedParams.id);

    if (!consultant) {
      reply.status(404).send(
        createResponse(false, 'Consultant not found')
      );
      return;
    }

    reply.status(200).send(
      createResponse(
        true,
        'Consultant retrieved successfully',
        consultant
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting consultant by ID:', error);
    
    if (error.name === 'ZodError') {
      reply.status(400).send(
        createResponse(false, 'Invalid consultant ID', undefined, error.message)
      );
    } else {
      reply.status(500).send(
        createResponse(
          false,
          'Failed to retrieve consultant',
          undefined,
          error.message
        )
      );
    }
  }
};

// Get consultant statistics
export const getConsultantStatsHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log('📊 Getting consultant statistics');

    const stats = await getConsultantStats();

    reply.status(200).send(
      createResponse(
        true,
        'Consultant statistics retrieved successfully',
        stats
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting consultant stats:', error);
    reply.status(500).send(
      createResponse(
        false,
        'Failed to retrieve consultant statistics',
        undefined,
        error.message
      )
    );
  }
};

// Get consultant specializations (for dropdown/filter options)
export const getConsultantSpecializationsHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log('🎯 Getting consultant specializations');

    // This could be extracted to the service layer
    const { getAllConsultants } = await import('../services/consultantService');
    const { getConnection } = await import('../config/database');
    
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT DISTINCT Specialization as specialization
      FROM Consultants 
      WHERE Specialization IS NOT NULL AND Specialization != ''
      ORDER BY Specialization
    `);

    reply.status(200).send(
      createResponse(
        true,
        'Specializations retrieved successfully',
        result.recordset.map(row => row.specialization)
      )
    );
  } catch (error: any) {
    console.error('❌ Error getting specializations:', error);
    reply.status(500).send(
      createResponse(
        false,
        'Failed to retrieve specializations',
        undefined,
        error.message
      )
    );
  }
};

// Get consultant locations (for dropdown/filter options)
export const getConsultantLocationsHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log('📍 Getting consultant locations');

    const { getConnection } = await import('../config/database');
    
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT DISTINCT Location as location
      FROM Consultants 
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