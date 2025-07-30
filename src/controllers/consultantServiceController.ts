import { FastifyRequest, FastifyReply } from 'fastify';
import { ConsultantServiceService } from '../services/consultantServiceService';
import { CreateConsultantServiceRequest, UpdateConsultantServiceRequest, ConsultantServiceFilters } from '../types/consultantService';

export class ConsultantServiceController {
  /**
   * Create a new consultant service
   * POST /api/consultant-services
   */
  static async createConsultantService(
    request: FastifyRequest<{ Body: CreateConsultantServiceRequest }>,
    reply: FastifyReply
  ) {
    try {
      const consultantService = await ConsultantServiceService.createConsultantService(request.body);
      
      reply.status(201).send({
        success: true,
        message: 'Consultant service created successfully',
        data: consultantService
      });
    } catch (error) {
      request.log.error('Error creating consultant service:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create consultant service'
      });
    }
  }

  /**
   * Get all consultant services with filtering and pagination
   * GET /api/consultant-services
   */
  static async getConsultantServices(
    request: FastifyRequest<{ Querystring: ConsultantServiceFilters }>,
    reply: FastifyReply
  ) {
    try {
      const result = await ConsultantServiceService.getConsultantServices(request.query);
      
      reply.status(200).send({
        success: true,
        message: 'Consultant services retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error('Error fetching consultant services:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch consultant services'
      });
    }
  }

  /**
   * Get a single consultant service by ID
   * GET /api/consultant-services/:id
   */
  static async getConsultantServiceById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id)) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Invalid consultant service ID'
        });
        return;
      }

      const consultantService = await ConsultantServiceService.getConsultantServiceById(id);
      
      if (!consultantService) {
        reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Consultant service not found'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: 'Consultant service retrieved successfully',
        data: consultantService
      });
    } catch (error) {
      request.log.error('Error fetching consultant service:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch consultant service'
      });
    }
  }

  /**
   * Update a consultant service by ID
   * PUT /api/consultant-services/:id
   */
  static async updateConsultantService(
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: UpdateConsultantServiceRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id)) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Invalid consultant service ID'
        });
        return;
      }

      const updatedConsultantService = await ConsultantServiceService.updateConsultantService(id, request.body);
      
      if (!updatedConsultantService) {
        reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Consultant service not found'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: 'Consultant service updated successfully',
        data: updatedConsultantService
      });
    } catch (error) {
      request.log.error('Error updating consultant service:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update consultant service'
      });
    }
  }

  /**
   * Delete a consultant service by ID
   * DELETE /api/consultant-services/:id
   */
  static async deleteConsultantService(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id)) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Invalid consultant service ID'
        });
        return;
      }

      const deleted = await ConsultantServiceService.deleteConsultantService(id);
      
      if (!deleted) {
        reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Consultant service not found'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: 'Consultant service deleted successfully'
      });
    } catch (error) {
      request.log.error('Error deleting consultant service:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete consultant service'
      });
    }
  }

  /**
   * Get consultant service statistics
   * GET /api/consultant-services/stats
   */
  static async getConsultantServiceStats(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const stats = await ConsultantServiceService.getConsultantServiceStats();
      
      reply.status(200).send({
        success: true,
        message: 'Consultant service statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      request.log.error('Error fetching consultant service stats:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch consultant service statistics'
      });
    }
  }

  /**
   * Search consultant services by title, description, or expertise
   * GET /api/consultant-services/search
   */
  static async searchConsultantServices(
    request: FastifyRequest<{ 
      Querystring: { 
        q: string;
        page?: number;
        limit?: number;
      } 
    }>,
    reply: FastifyReply
  ) {
    try {
      const { q: searchQuery, page = 1, limit = 10 } = request.query;
      
      if (!searchQuery || searchQuery.trim().length === 0) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Search query is required'
        });
        return;
      }

      // Use the existing getConsultantServices method with search-like filters
      const filters: ConsultantServiceFilters = {
        page,
        limit: Math.min(limit, 100),
        sort_by: 'created_at',
        sort_order: 'DESC'
      };

      // For now, we'll search in expertise field, but you could extend this to search in title and description
      // Note: This is a simple implementation. For better search, consider using full-text search
      const result = await ConsultantServiceService.getConsultantServices({
        ...filters,
        expertise: searchQuery
      });
      
      reply.status(200).send({
        success: true,
        message: 'Search results retrieved successfully',
        data: result.data,
        pagination: result.pagination,
        searchQuery
      });
    } catch (error) {
      request.log.error('Error searching consultant services:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to search consultant services'
      });
    }
  }

  /**
   * Get consultant services by consultant ID
   * GET /api/consultant-services/consultant/:consultantId
   */
  static async getConsultantServicesByConsultantId(
    request: FastifyRequest<{ Params: { consultantId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const consultantId = parseInt(request.params.consultantId);
      
      if (isNaN(consultantId)) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Invalid consultant ID'
        });
        return;
      }

      const filters: ConsultantServiceFilters = {
        consultant_id: consultantId,
        sort_by: 'created_at',
        sort_order: 'DESC'
      };

      const result = await ConsultantServiceService.getConsultantServices(filters);
      
      reply.status(200).send({
        success: true,
        message: 'Consultant services retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error('Error fetching consultant services by consultant ID:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch consultant services'
      });
    }
  }

  /**
   * Get consultant services by service type
   * GET /api/consultant-services/type/:serviceType
   */
  static async getConsultantServicesByType(
    request: FastifyRequest<{ 
      Params: { serviceType: string };
      Querystring: { page?: number; limit?: number; }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { serviceType } = request.params;
      const { page = 1, limit = 10 } = request.query;
      
      const filters: ConsultantServiceFilters = {
        service_type: serviceType,
        page,
        limit: Math.min(limit, 100),
        sort_by: 'created_at',
        sort_order: 'DESC'
      };

      const result = await ConsultantServiceService.getConsultantServices(filters);
      
      reply.status(200).send({
        success: true,
        message: 'Consultant services retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error('Error fetching consultant services by type:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch consultant services'
      });
    }
  }
}