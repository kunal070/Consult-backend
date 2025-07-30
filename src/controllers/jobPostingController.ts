import { FastifyRequest, FastifyReply } from 'fastify';
import { JobPostingService } from '../services/jobPostingService';
import { CreateJobPostingRequest, UpdateJobPostingRequest, JobPostingFilters } from '../types/jobPosting';

export class JobPostingController {
  /**
   * Create a new job posting
   * POST /api/jobs
   */
  static async createJobPosting(
    request: FastifyRequest<{ Body: CreateJobPostingRequest }>,
    reply: FastifyReply
  ) {
    try {
      const jobPosting = await JobPostingService.createJobPosting(request.body);
      
      reply.status(201).send({
        success: true,
        message: 'Job posting created successfully',
        data: jobPosting
      });
    } catch (error) {
      request.log.error('Error creating job posting:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create job posting'
      });
    }
  }

  /**
   * Get all job postings with filtering and pagination
   * GET /api/jobs
   */
  static async getJobPostings(
    request: FastifyRequest<{ Querystring: JobPostingFilters }>,
    reply: FastifyReply
  ) {
    try {
      const result = await JobPostingService.getJobPostings(request.query);
      
      reply.status(200).send({
        success: true,
        message: 'Job postings retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      request.log.error('Error fetching job postings:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch job postings'
      });
    }
  }

  /**
   * Get a single job posting by ID
   * GET /api/jobs/:id
   */
  static async getJobPostingById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id)) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Invalid job posting ID'
        });
        return;
      }

      const jobPosting = await JobPostingService.getJobPostingById(id);
      
      if (!jobPosting) {
        reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Job posting not found'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: 'Job posting retrieved successfully',
        data: jobPosting
      });
    } catch (error) {
      request.log.error('Error fetching job posting:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch job posting'
      });
    }
  }

  /**
   * Update a job posting by ID
   * PUT /api/jobs/:id
   */
  static async updateJobPosting(
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: UpdateJobPostingRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id)) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Invalid job posting ID'
        });
        return;
      }

      const updatedJobPosting = await JobPostingService.updateJobPosting(id, request.body);
      
      if (!updatedJobPosting) {
        reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Job posting not found'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: 'Job posting updated successfully',
        data: updatedJobPosting
      });
    } catch (error) {
      request.log.error('Error updating job posting:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update job posting'
      });
    }
  }

  /**
   * Delete a job posting by ID
   * DELETE /api/jobs/:id
   */
  static async deleteJobPosting(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt(request.params.id);
      
      if (isNaN(id)) {
        reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Invalid job posting ID'
        });
        return;
      }

      const deleted = await JobPostingService.deleteJobPosting(id);
      
      if (!deleted) {
        reply.status(404).send({
          success: false,
          error: 'Not Found',
          message: 'Job posting not found'
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: 'Job posting deleted successfully'
      });
    } catch (error) {
      request.log.error('Error deleting job posting:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete job posting'
      });
    }
  }

  /**
   * Get job posting statistics
   * GET /api/jobs/stats
   */
  static async getJobPostingStats(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const stats = await JobPostingService.getJobPostingStats();
      
      reply.status(200).send({
        success: true,
        message: 'Job posting statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      request.log.error('Error fetching job posting stats:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch job posting statistics'
      });
    }
  }

  /**
   * Search job postings by title or description
   * GET /api/jobs/search
   */
  static async searchJobPostings(
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

      // Use the existing getJobPostings method with search-like filters
      const filters: JobPostingFilters = {
        page,
        limit: Math.min(limit, 100),
        sort_by: 'posted_time',
        sort_order: 'DESC'
      };

      // For now, we'll search in tags field, but you could extend this to search in title and description
      // Note: This is a simple implementation. For better search, consider using full-text search
      const result = await JobPostingService.getJobPostings({
        ...filters,
        tags: searchQuery
      });
      
      reply.status(200).send({
        success: true,
        message: 'Search results retrieved successfully',
        data: result.data,
        pagination: result.pagination,
        searchQuery
      });
    } catch (error) {
      request.log.error('Error searching job postings:', error);
      
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to search job postings'
      });
    }
  }
}