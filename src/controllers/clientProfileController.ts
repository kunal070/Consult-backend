import { FastifyRequest, FastifyReply } from 'fastify';
import { 
  getClientProfile, 
  updateClientProfile, 
  deleteClientProfile
} from '../services/clientProfileService';
import { 
  validateClientProfileData,
  UpdateClientProfileRequest 
} from '../schemas/clientProfileSchemas';


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

// GET /api/client/profile/:id - Get client's complete profile
export const getClientProfileHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId) || clientId <= 0) {
      reply.status(400).send(
        createResponse(false, 'Invalid client ID')
      );
      return;
    }

    console.log('📋 Getting client profile for ID:', clientId);

    const profile = await getClientProfile(clientId);

    if (!profile) {
      reply.status(404).send(
        createResponse(false, 'Client profile not found')
      );
      return;
    }

    reply.status(200).send({
      success: true,
      profile: profile
    });

  } catch (error: any) {
    console.error('❌ Error getting client profile:', error);
    
    reply.status(500).send(
      createResponse(
        false,
        'Failed to retrieve profile',
        undefined,
        error.message
      )
    );
  }
};

// PATCH /api/client/profile/:id - Update client's profile (partial update)
export const updateClientProfileHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId) || clientId <= 0) {
      reply.status(400).send(
        createResponse(false, 'Invalid client ID')
      );
      return;
    }

    console.log('📝 Updating client profile for ID:', clientId);
    console.log('Request body:', req.body);

    // Validate request body
    let validatedData;
    try {
      validatedData = validateClientProfileData(req.body);
    } catch (validationError: any) {
      console.error('❌ Profile validation error:', validationError);
      
      if (validationError.name === 'ZodError') {
        const errors = validationError.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        reply.status(400).send({
          success: false,
          error: 'Validation Error',
          message: 'Invalid profile data',
          details: errors
        });
        return;
      }
      
      reply.status(400).send(
        createResponse(false, 'Invalid profile data', undefined, validationError.message)
      );
      return;
    }

    // Check if any fields are provided for update
    if (Object.keys(validatedData).length === 0) {
      reply.status(400).send(
        createResponse(false, 'No fields provided for update')
      );
      return;
    }

    // Update profile
    const updatedProfile = await updateClientProfile(clientId, validatedData);

    reply.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
      updatedFields: Object.keys(validatedData)
    });

  } catch (error: any) {
    console.error('❌ Error updating client profile:', error);
    
    if (error.message?.includes('not found')) {
      reply.status(404).send(
        createResponse(false, 'Client not found')
      );
      return;
    }
    
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      reply.status(409).send(
        createResponse(false, 'Profile with this information already exists')
      );
      return;
    }
    
    reply.status(500).send(
      createResponse(
        false,
        'Failed to update profile',
        undefined,
        error.message
      )
    );
  }
};

// DELETE /api/client/profile/:id - Delete client's profile (soft delete)
export const deleteClientProfileHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId) || clientId <= 0) {
      reply.status(400).send(
        createResponse(false, 'Invalid client ID')
      );
      return;
    }

    console.log('🗑️ Deleting client profile for ID:', clientId);

    const deleted = await deleteClientProfile(clientId);

    if (!deleted) {
      reply.status(404).send(
        createResponse(false, 'Client profile not found')
      );
      return;
    }

    reply.status(200).send(
      createResponse(true, 'Profile deleted successfully')
    );

  } catch (error: any) {
    console.error('❌ Error deleting client profile:', error);
    
    reply.status(500).send(
      createResponse(
        false,
        'Failed to delete profile',
        undefined,
        error.message
      )
    );
  }
};

// ADD this new handler (or update existing one)
export const updateClientProfileByIdHandler = async (
  req: FastifyRequest<{ 
    Params: { id: string };
    Body: UpdateClientProfileRequest 
  }>,
  reply: FastifyReply
) => {
  try {
    // Read client ID from URL parameter
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId) || clientId <= 0) {
      reply.status(400).send({
        success: false,
        message: 'Invalid client ID'
      });
      return;
    }

    console.log('📝 Updating client profile for ID:', clientId);
    console.log('📧 Request body:', req.body);

    // Validate request body
    let validatedData;
    try {
      validatedData = validateClientProfileData(req.body);
    } catch (validationError: any) {
      console.error('❌ Profile validation error:', validationError);
      
      if (validationError.name === 'ZodError') {
        const errors = validationError.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        reply.status(400).send({
          success: false,
          error: 'Validation Error',
          message: 'Invalid profile data',
          details: errors
        });
        return;
      }
      
      reply.status(400).send(
        createResponse(false, 'Invalid profile data', undefined, validationError.message)
      );
      return;
    }

    // Check if any fields are provided for update
    if (Object.keys(validatedData).length === 0) {
      reply.status(400).send(
        createResponse(false, 'No fields provided for update')
      );
      return;
    }

    // Update profile
    const updatedProfile = await updateClientProfile(clientId, validatedData);

    // Response with what was actually updated
    const updatedFields = Object.keys(validatedData);
    const isEmailUpdated = updatedFields.includes('email');

    reply.status(200).send({
      success: true,
      message: isEmailUpdated ? 
        'Client profile updated successfully. Email has been changed.' : 
        'Client profile updated successfully.',
      profile: updatedProfile,
      updatedFields,
      emailUpdated: isEmailUpdated
    });

  } catch (error: any) {
    console.error('❌ Error updating client profile:', error);
    
    if (error.message?.includes('not found')) {
      reply.status(404).send(
        createResponse(false, 'Client not found')
      );
      return;
    }
    
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      reply.status(409).send(
        createResponse(false, 'Email already exists for another client')
      );
      return;
    }
    
    reply.status(500).send(
      createResponse(
        false,
        'Failed to update client profile',
        undefined,
        error.message
      )
    );
  }
};