import { getConnection } from '../config/database';
import { ClientProfile, UpdateClientProfileRequest } from '../schemas/clientProfileSchemas';

// Interface for complete client profile data
export interface CompleteClientProfile extends ClientProfile {
  clientId: number;
  acceptTerms: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get client profile by ID
export const getClientProfile = async (clientId: number): Promise<CompleteClientProfile | null> => {
  const pool = await getConnection();
  
  try {
    const result = await pool
      .request()
      .input('clientId', clientId)
      .query(`
        SELECT 
          ClientID as clientId,
          FullName as fullName,
          Email as email,
          CompanyName as companyName,
          CompanyWebsite as companyWebsite,
          Industry as industry,
          CompanySize as companySize,
          Location as location,
          Role as role,
          UseCase as useCase,
          PhoneNumber as phoneNumber,
          HearAboutUs as hearAboutUs,
          AcceptTerms as acceptTerms,
          COALESCE(CreatedAt, GETDATE()) as createdAt
        FROM Clients 
        WHERE ClientID = @clientId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const client = result.recordset[0];
    
    // Convert bit to boolean for acceptTerms
    client.acceptTerms = Boolean(client.acceptTerms);

    return client;

  } catch (error) {
    console.error('❌ Error getting client profile:', error);
    throw error;
  }
};

// Update client profile (only provided fields)
export const updateClientProfile = async (
  clientId: number, 
  profileData: UpdateClientProfileRequest
): Promise<CompleteClientProfile> => {
  const pool = await getConnection();
  
  try {
    // Check if client exists
    const existingClient = await getClientProfile(clientId);
    if (!existingClient) {
      throw new Error('Client not found');
    }

    // Build update query dynamically for only provided fields
    const updateFields = [];
    const inputs: any = { clientId };

    if (profileData.fullName !== undefined) {
      updateFields.push('FullName = @fullName');
      inputs.fullName = profileData.fullName;
    }
    
    if (profileData.email !== undefined) {
      updateFields.push('Email = @email');
      inputs.email = profileData.email;
    }
    
    if (profileData.companyName !== undefined) {
      updateFields.push('CompanyName = @companyName');
      inputs.companyName = profileData.companyName;
    }
    
    if (profileData.companyWebsite !== undefined) {
      updateFields.push('CompanyWebsite = @companyWebsite');
      inputs.companyWebsite = profileData.companyWebsite;
    }
    
    if (profileData.industry !== undefined) {
      updateFields.push('Industry = @industry');
      inputs.industry = profileData.industry;
    }
    
    if (profileData.companySize !== undefined) {
      updateFields.push('CompanySize = @companySize');
      inputs.companySize = profileData.companySize;
    }
    
    if (profileData.location !== undefined) {
      updateFields.push('Location = @location');
      inputs.location = profileData.location;
    }
    
    if (profileData.role !== undefined) {
      updateFields.push('Role = @role');
      inputs.role = profileData.role;
    }
    
    if (profileData.useCase !== undefined) {
      updateFields.push('UseCase = @useCase');
      inputs.useCase = profileData.useCase;
    }
    
    if (profileData.phoneNumber !== undefined) {
      updateFields.push('PhoneNumber = @phoneNumber');
      inputs.phoneNumber = profileData.phoneNumber;
    }
    
    if (profileData.hearAboutUs !== undefined) {
      updateFields.push('HearAboutUs = @hearAboutUs');
      inputs.hearAboutUs = profileData.hearAboutUs;
    }

    // Only update if there are fields to update
    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE Clients 
        SET ${updateFields.join(', ')}
        WHERE ClientID = @clientId
      `;

      const request = pool.request().input('clientId', inputs.clientId);
      
      // Add all inputs to the request
      Object.keys(inputs).forEach(key => {
        if (key !== 'clientId') {
          request.input(key, inputs[key]);
        }
      });

      await request.query(updateQuery);
    }

    // Return updated profile
    const updatedProfile = await getClientProfile(clientId);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }

    return updatedProfile;

  } catch (error) {
    console.error('❌ Error updating client profile:', error);
    throw error;
  }
};

// Delete client profile (soft delete)
export const deleteClientProfile = async (clientId: number): Promise<boolean> => {
  const pool = await getConnection();
  
  try {
    const result = await pool
      .request()
      .input('clientId', clientId)
      .query('UPDATE Clients SET IsDeleted = 1 WHERE ClientID = @clientId');

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('❌ Error deleting client profile:', error);
    throw error;
  }
};