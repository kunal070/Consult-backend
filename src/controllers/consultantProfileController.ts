import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  getConsultantProfile, 
  updateConsultantProfile, 
  deleteConsultantProfile,
  getProfileCompletion 
} from '../services/consultantProfileService';
import { validateProfileData, calculateProfileCompletion } from '../schemas/consultantProfileSchemas';

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

// GET /api/consultant/profile - Get consultant's complete profile
export const getProfileHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Use default consultant ID for testing when no authentication is present
    const consultantId = req.user?.consultantId || 15; // Default to consultant ID 15 for testing
    console.log('📋 Getting consultant profile for ID:', consultantId);

    const profile = await getConsultantProfile(consultantId);

    if (!profile) {
      reply.status(404).send(
        createResponse(false, 'Profile not found')
      );
      return;
    }

    // Calculate profile completion
    const completion = calculateProfileCompletion(profile);
    const profileWithCompletion = {
      ...profile,
      profileCompletion: completion
    };

    reply.status(200).send({
      success: true,
      profile: profileWithCompletion
    });

  } catch (error: any) {
    console.error('❌ Error getting consultant profile:', error);
    
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

// PUT /api/consultant/profile - Update consultant's profile
export const updateProfileHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Use default consultant ID for testing when no authentication is present
    const consultantId = req.user?.consultantId || 15; // Default to consultant ID 15 for testing
    console.log('📝 Updating consultant profile for ID:', consultantId);

    // Validate request body
    let validatedData;
    try {
      validatedData = validateProfileData(req.body);
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

    // Update profile
    const updatedProfile = await updateConsultantProfile(consultantId, validatedData);

    // Calculate new completion percentage
    const completion = calculateProfileCompletion(updatedProfile);
    const profileWithCompletion = {
      ...updatedProfile,
      profileCompletion: completion
    };

    reply.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      profile: profileWithCompletion
    });

  } catch (error: any) {
    console.error('❌ Error updating consultant profile:', error);
    
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

// DELETE /api/consultant/profile - Delete consultant's profile (soft delete)
export const deleteProfileHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Use default consultant ID for testing when no authentication is present
    const consultantId = req.user?.consultantId || 15; // Default to consultant ID 15 for testing
    console.log('🗑️ Deleting consultant profile for ID:', consultantId);

    const deleted = await deleteConsultantProfile(consultantId);

    if (!deleted) {
      reply.status(404).send(
        createResponse(false, 'Profile not found')
      );
      return;
    }

    reply.status(200).send(
      createResponse(true, 'Profile deleted successfully')
    );

  } catch (error: any) {
    console.error('❌ Error deleting consultant profile:', error);
    
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

// GET /api/consultant/profile/completion - Get profile completion percentage
export const getProfileCompletionHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Use default consultant ID for testing when no authentication is present
    const consultantId = req.user?.consultantId || 15; // Default to consultant ID 15 for testing
    console.log('📊 Getting profile completion for ID:', consultantId);

    const completion = await getProfileCompletion(consultantId);

    reply.status(200).send({
      success: true,
      completion,
      message: `Profile is ${completion}% complete`
    });

  } catch (error: any) {
    console.error('❌ Error getting profile completion:', error);
    
    reply.status(500).send(
      createResponse(
        false,
        'Failed to get profile completion',
        undefined,
        error.message
      )
    );
  }
};

// POST /api/consultant/profile/avatar - Upload profile avatar
export const uploadAvatarHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Use default consultant ID for testing when no authentication is present
    const consultantId = req.user?.consultantId || 15; // Default to consultant ID 15 for testing
    console.log('📸 Uploading avatar for consultant ID:', consultantId);

    // Handle file upload (implementation depends on your file storage solution)
    const data = await req.file();
    
    if (!data) {
      reply.status(400).send(
        createResponse(false, 'No file uploaded')
      );
      return;
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(data.mimetype)) {
      reply.status(400).send(
        createResponse(false, 'Invalid file type. Only JPEG, PNG, and GIF are allowed')
      );
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (data.file.bytesRead > maxSize) {
      reply.status(400).send(
        createResponse(false, 'File too large. Maximum size is 5MB')
      );
      return;
    }

    // TODO: Implement file upload to storage (AWS S3, local storage, etc.)
    // For now, return success response
    reply.status(200).send({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: '/uploads/avatars/temp-avatar.jpg' // Placeholder
    });

  } catch (error: any) {
    console.error('❌ Error uploading avatar:', error);
    
    reply.status(500).send(
      createResponse(
        false,
        'Failed to upload avatar',
        undefined,
        error.message
      )
    );
  }
};

// DELETE /api/consultant/profile/avatar - Remove profile avatar
export const deleteAvatarHandler = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Use default consultant ID for testing when no authentication is present
    const consultantId = req.user?.consultantId || 15; // Default to consultant ID 15 for testing
    console.log('🗑️ Deleting avatar for consultant ID:', consultantId);

    // TODO: Implement avatar deletion from storage
    // For now, return success response
    reply.status(200).send(
      createResponse(true, 'Avatar deleted successfully')
    );

  } catch (error: any) {
    console.error('❌ Error deleting avatar:', error);
    
    reply.status(500).send(
      createResponse(
        false,
        'Failed to delete avatar',
        undefined,
        error.message
      )
    );
  }
}; 