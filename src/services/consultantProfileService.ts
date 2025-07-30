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

// Update consultant profile
export const updateConsultantProfile = async (
  consultantId: number, 
  profileData: UpdateProfileRequest
): Promise<CompleteConsultantProfile> => {
  const pool = await getConnection();
  
  try {
    // Start transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Update main consultant data
      const updateFields = [];
      const inputs: any = { consultantId };

      if (profileData.fullName) {
        updateFields.push('FullName = @fullName');
        inputs.fullName = profileData.fullName;
      }
      if (profileData.email) {
        updateFields.push('Email = @email');
        inputs.email = profileData.email;
      }
      if (profileData.phoneNumber) {
        updateFields.push('PhoneNumber = @phoneNumber');
        inputs.phoneNumber = profileData.phoneNumber;
      }
      if (profileData.location) {
        updateFields.push('Location = @location');
        inputs.location = profileData.location;
      }
      if (profileData.preferredWorkType) {
        updateFields.push('PreferredWorkType = @preferredWorkType');
        inputs.preferredWorkType = profileData.preferredWorkType;
      }
      if (profileData.preferredWorkMode) {
        updateFields.push('PreferredWorkMode = @preferredWorkMode');
        inputs.preferredWorkMode = profileData.preferredWorkMode;
      }
      if (profileData.specialization) {
        updateFields.push('Specialization = @specialization');
        inputs.specialization = profileData.specialization;
      }
      if (profileData.yearsOfExperience) {
        updateFields.push('YearsOfExperience = @yearsOfExperience');
        inputs.yearsOfExperience = profileData.yearsOfExperience;
      }
      if (profileData.primarySkills) {
        updateFields.push('PrimarySkills = @primarySkills');
        inputs.primarySkills = profileData.primarySkills.join(', ');
      }
      if (profileData.availableServices) {
        updateFields.push('AvailableServices = @availableServices');
        inputs.availableServices = profileData.availableServices.join(', ');
      }
      if (profileData.preferredWorkingHours) {
        updateFields.push('PreferredWorkingHours = @preferredWorkingHours');
        inputs.preferredWorkingHours = profileData.preferredWorkingHours;
      }
      if (profileData.consultingMode) {
        updateFields.push('ConsultingMode = @consultingMode');
        inputs.consultingMode = profileData.consultingMode;
      }
      if (profileData.pricingStructure) {
        updateFields.push('PricingStructure = @pricingStructure');
        inputs.pricingStructure = profileData.pricingStructure;
      }
      if (profileData.paymentPreferences) {
        updateFields.push('PaymentPreferences = @paymentPreferences');
        inputs.paymentPreferences = profileData.paymentPreferences;
      }
      if (profileData.briefBio) {
        updateFields.push('BriefBio = @briefBio');
        inputs.briefBio = profileData.briefBio;
      }



      if (updateFields.length > 0) {
        const updateQuery = `
          UPDATE Consultants 
          SET ${updateFields.join(', ')}
          WHERE ConsultantID = @consultantId
        `;

        await transaction.request()
          .input('consultantId', inputs.consultantId)
          .input('fullName', inputs.fullName)
          .input('email', inputs.email)
          .input('phoneNumber', inputs.phoneNumber)
          .input('location', inputs.location)
          .input('preferredWorkType', inputs.preferredWorkType)
          .input('preferredWorkMode', inputs.preferredWorkMode)
          .input('specialization', inputs.specialization)
          .input('yearsOfExperience', inputs.yearsOfExperience)
          .input('primarySkills', inputs.primarySkills)
          .input('availableServices', inputs.availableServices)
          .input('preferredWorkingHours', inputs.preferredWorkingHours)
          .input('consultingMode', inputs.consultingMode)
          .input('pricingStructure', inputs.pricingStructure)
          .input('paymentPreferences', inputs.paymentPreferences)
          .input('briefBio', inputs.briefBio)
          .query(updateQuery);
      }

      // Update languages if provided
      if (profileData.languagesSpoken) {
        // Delete existing languages
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM LanguagesSpoken WHERE ConsultantID = @consultantId');

        // Insert new languages
        for (const language of profileData.languagesSpoken) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('language', language)
            .query('INSERT INTO LanguagesSpoken (ConsultantID, Language) VALUES (@consultantId, @language)');
        }
      }

      // Update education if provided
      if (profileData.education) {
        // Delete existing education
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM Education WHERE ConsultantID = @consultantId');

        // Insert new education
        for (const edu of profileData.education) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('degree', edu.degree)
            .input('institution', edu.institution)
            .input('year', edu.year)
            .query('INSERT INTO Education (ConsultantID, Degree, Institution, Year) VALUES (@consultantId, @degree, @institution, @year)');
        }
      }

      // Update professional experience if provided
      if (profileData.professionalExperience) {
        // Delete existing experience
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM ProfessionalExperience WHERE ConsultantID = @consultantId');

        // Insert new experience
        for (const exp of profileData.professionalExperience) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('role', exp.role)
            .input('company', exp.company)
            .input('years', exp.years)
            .query('INSERT INTO ProfessionalExperience (ConsultantID, Role, Company, Years) VALUES (@consultantId, @role, @company, @years)');
        }
      }

      // Update certificates if provided
      if (profileData.certificates) {
        // Delete existing certificates
        await transaction.request()
          .input('consultantId', consultantId)
          .query('DELETE FROM Certificates WHERE ConsultantID = @consultantId');

        // Insert new certificates
        for (const cert of profileData.certificates) {
          await transaction.request()
            .input('consultantId', consultantId)
            .input('name', cert.name)
            .query('INSERT INTO Certificates (ConsultantID, Name) VALUES (@consultantId, @name)');
        }
      }



      // Commit transaction
      await transaction.commit();

      // Return updated profile
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