import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware to validate request data using Zod schemas
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'query', 'params')
 */
export function validateRequest(schema: ZodSchema, target: 'body' | 'query' | 'params') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let dataToValidate;
      
      switch (target) {
        case 'body':
          dataToValidate = request.body;
          break;
        case 'query':
          dataToValidate = request.query;
          break;
        case 'params':
          dataToValidate = request.params;
          break;
        default:
          throw new Error(`Invalid validation target: ${target}`);
      }

      // Validate the data using the provided schema
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      switch (target) {
        case 'body':
          request.body = validatedData;
          break;
        case 'query':
          request.query = validatedData;
          break;
        case 'params':
          request.params = validatedData;
          break;
      }
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        reply.status(400).send({
          success: false,
          error: 'Validation Error',
          message: 'Invalid request data',
          details: formattedErrors
        });
        return;
      }

      // Handle other errors
      request.log.error('Validation middleware error:', error);
      reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Validation failed'
      });
    }
  };
}

/**
 * Generic error response formatter
 */
export function formatValidationError(error: ZodError) {
  return {
    success: false,
    error: 'Validation Error',
    message: 'Invalid request data',
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      ...(err as any).received && { received: (err as any).received }
    }))
  };
}

/**
 * Middleware to validate JSON content type for POST/PUT requests
 */
export async function validateContentType(request: FastifyRequest, reply: FastifyReply) {
  const method = request.method;
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      reply.status(400).send({
        success: false,
        error: 'Invalid Content Type',
        message: 'Content-Type must be application/json'
      });
      return;
    }
  }
}

/**
 * Middleware to validate request size
 */
export function validateRequestSize(maxSizeBytes: number = 1024 * 1024) { // Default 1MB
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const contentLength = request.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      reply.status(413).send({
        success: false,
        error: 'Payload Too Large',
        message: `Request size exceeds maximum allowed size of ${maxSizeBytes} bytes`
      });
      return;
    }
  };
}