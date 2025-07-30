import { getConnection } from '../config/database';
import { ConsultantProfile, UpdateProfileRequest, calculateProfileCompletion } from '../schemas/consultantProfileSchemas';


// Interface for complete profile data
export interface CompleteConsultantProfile extends ConsultantProfile {
  consultantId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get consultant profile by ID
export const getConsultantProfile = async (consultantId: number): Promise<CompleteConsultantProfile | null> => {
  const pool = await getConnection();
  
  try {
    // Get main consultant data
    const mainResult = await pool
      .request()
      .input('consultantId', consultantId)
      .query(`
        SELECT 
          ConsultantID,
          FullName,
          Email,
          PhoneNumber,
          Location,
          PreferredWorkType,
          PreferredWorkMode,
          Specialization,
          YearsOfExperience,
          PrimarySkills,
          AvailableServices,
          PreferredWorkingHours,
          ConsultingMode,
          PricingStructure,
          PaymentPreferences,
          BriefBio
        FROM Consultants 
        WHERE ConsultantID = @consultantId
      `);

    if (mainResult.recordset.length === 0) {
      return null;
    }

    const consultant = mainResult.recordset[0];

    // Get languages spoken
    const languagesResult = await pool
      .request()
      .input('consultantId', consultantId)
      .query('SELECT Language FROM LanguagesSpoken WHERE ConsultantID = @consultantId');

    // Get education
    const educationResult = await pool
      .request()
      .input('consultantId', consultantId)
      .query('SELECT Degree, Institution, Year FROM Education WHERE ConsultantID = @consultantId');

    // Get professional experience
    const experienceResult = await pool
      .request()
      .input('consultantId', consultantId)
      .query('SELECT Role, Company, Years FROM ProfessionalExperience WHERE ConsultantID = @consultantId');

    // Get certificates
    const certificatesResult = await pool
      .request()
      .input('consultantId', consultantId)
      .query('SELECT Name FROM Certificates WHERE ConsultantID = @consultantId');

    // Parse fields (PrimarySkills is stored as comma-separated string)
    const primarySkills = consultant.PrimarySkills ? consultant.PrimarySkills.split(', ').filter((skill: string) => skill.trim()) : [];
    const availableServices = consultant.AvailableServices ? consultant.AvailableServices.split(', ').filter((service: string) => service.trim()) : [];

    return {
      consultantId: consultant.ConsultantID,
      fullName: consultant.FullName,
      email: consultant.Email,
      phoneNumber: consultant.PhoneNumber,
      location: consultant.Location,
      preferredWorkType: consultant.PreferredWorkType,
      preferredWorkMode: consultant.PreferredWorkMode,
      languagesSpoken: languagesResult.recordset.map(row => row.Language),
      specialization: consultant.Specialization,
      yearsOfExperience: consultant.YearsOfExperience,
      education: educationResult.recordset.map(row => ({
        degree: row.Degree,
        institution: row.Institution,
        year: row.Year
      })),
      certificates: certificatesResult.recordset.map(row => ({
        name: row.Name
      })),
      professionalExperience: experienceResult.recordset.map(row => ({
        role: row.Role,
        company: row.Company,
        years: row.Years
      })),
      primarySkills,
      availableServices,
      preferredWorkingHours: consultant.PreferredWorkingHours,
      consultingMode: consultant.ConsultingMode,
      pricingStructure: consultant.PricingStructure,
      paymentPreferences: consultant.PaymentPreferences,
      briefBio: consultant.BriefBio,

    };

  } catch (error) {
    console.error('❌ Error getting consultant profile:', error);
    throw error;
  }
};


// Delete consultant profile (soft delete)
export const deleteConsultantProfile = async (consultantId: number): Promise<boolean> => {
  const pool = await getConnection();
  
  try {
    const result = await pool
      .request()
      .input('consultantId', consultantId)
      .query('UPDATE Consultants SET IsDeleted = 1 WHERE ConsultantID = @consultantId');

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('❌ Error deleting consultant profile:', error);
    throw error;
  }
};

// Get profile completion percentage
export const getProfileCompletion = async (consultantId: number): Promise<number> => {
  const profile = await getConsultantProfile(consultantId);
  if (!profile) {
    return 0;
  }
  
  return calculateProfileCompletion(profile);
}; 

export const updateConsultantProfile = async (
  consultantId: number, 
  profileData: Partial<UpdateProfileRequest>
): Promise<CompleteConsultantProfile> => {
  const pool = await getConnection();
  
  try {
    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Check if consultant exists
      const existingResult = await transaction.request()
        .input('consultantId', consultantId)
        .query('SELECT ConsultantID FROM Consultants WHERE ConsultantID = @consultantId');

      if (existingResult.recordset.length === 0) {
        throw new Error('Consultant not found');
      }

      // Build update query - ONLY for fields that are provided
      const updateFields = [];
      const request = transaction.request().input('consultantId', consultantId);

      // Only update fields that are actually provided (not undefined)
      if (profileData.fullName !== undefined) {
        updateFields.push('FullName = @fullName');
        request.input('fullName', profileData.fullName);
      }
      if (profileData.email !== undefined) {
        updateFields.push('Email = @email');
        request.input('email', profileData.email);
      }
      if (profileData.phoneNumber !== undefined) {
        updateFields.push('PhoneNumber = @phoneNumber');
        request.input('phoneNumber', profileData.phoneNumber);
      }
      if (profileData.location !== undefined) {
        updateFields.push('Location = @location');
        request.input('location', profileData.location);
      }
      if (profileData.preferredWorkType !== undefined) {
        updateFields.push('PreferredWorkType = @preferredWorkType');
        request.input('preferredWorkType', profileData.preferredWorkType);
      }
      if (profileData.preferredWorkMode !== undefined) {
        updateFields.push('PreferredWorkMode = @preferredWorkMode');
        request.input('preferredWorkMode', profileData.preferredWorkMode);
      }
      if (profileData.specialization !== undefined) {
        updateFields.push('Specialization = @specialization');
        request.input('specialization', profileData.specialization);
      }
      if (profileData.yearsOfExperience !== undefined) {
        updateFields.push('YearsOfExperience = @yearsOfExperience');
        request.input('yearsOfExperience', profileData.yearsOfExperience);
      }
      if (profileData.primarySkills !== undefined) {
        updateFields.push('PrimarySkills = @primarySkills');
        request.input('primarySkills', profileData.primarySkills.join(', '));
      }
      if (profileData.availableServices !== undefined) {
        updateFields.push('AvailableServices = @availableServices');
        request.input('availableServices', profileData.availableServices.join(', '));
      }
      if (profileData.preferredWorkingHours !== undefined) {
        updateFields.push('PreferredWorkingHours = @preferredWorkingHours');
        request.input('preferredWorkingHours', profileData.preferredWorkingHours);
      }
      if (profileData.consultingMode !== undefined) {
        updateFields.push('ConsultingMode = @consultingMode');
        request.input('consultingMode', profileData.consultingMode);
      }
      if (profileData.pricingStructure !== undefined) {
        updateFields.push('PricingStructure = @pricingStructure');
        request.input('pricingStructure', profileData.pricingStructure);
      }
      if (profileData.paymentPreferences !== undefined) {
        updateFields.push('PaymentPreferences = @paymentPreferences');
        request.input('paymentPreferences', profileData.paymentPreferences);
      }
      if (profileData.briefBio !== undefined) {
        updateFields.push('BriefBio = @briefBio');
        request.input('briefBio', profileData.briefBio);
      }

      // Execute main table update only if there are fields to update
      if (updateFields.length > 0) {
        const updateQuery = `
          UPDATE Consultants 
          SET ${updateFields.join(', ')}
          WHERE ConsultantID = @consultantId
        `;
        await request.query(updateQuery);
      }

      // Handle related tables - ONLY if data is provided
      if (profileData.languagesSpoken !== undefined) {
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM LanguagesSpoken WHERE ConsultantID = @consultantId');

        for (const language of profileData.languagesSpoken) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('language', language)
            .query('INSERT INTO LanguagesSpoken (ConsultantID, Language) VALUES (@consultantId, @language)');
        }
      }

      if (profileData.education !== undefined) {
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM Education WHERE ConsultantID = @consultantId');

        for (const edu of profileData.education) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('degree', edu.degree)
            .input('institution', edu.institution)
            .input('year', edu.year)
            .query('INSERT INTO Education (ConsultantID, Degree, Institution, Year) VALUES (@consultantId, @degree, @institution, @year)');
        }
      }

      if (profileData.professionalExperience !== undefined) {
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM ProfessionalExperience WHERE ConsultantID = @consultantId');

        for (const exp of profileData.professionalExperience) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('role', exp.role)
            .input('company', exp.company)
            .input('years', exp.years)
            .query('INSERT INTO ProfessionalExperience (ConsultantID, Role, Company, Years) VALUES (@consultantId, @role, @company, @years)');
        }
      }

      if (profileData.certificates !== undefined) {
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM Certificates WHERE ConsultantID = @consultantId');

        for (const cert of profileData.certificates) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('name', cert.name)
            .query('INSERT INTO Certificates (ConsultantID, Name) VALUES (@consultantId, @name)');
        }
      }

      await transaction.commit();

      // Return updated profile using existing function
      const updatedProfile = await getConsultantProfile(consultantId);
      if (!updatedProfile) {
        throw new Error('Failed to retrieve updated profile');
      }

      return updatedProfile;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error updating consultant profile:', error);
    throw error;
  }
};