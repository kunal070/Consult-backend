import { getConnection } from '../config/database';
import sql from 'mssql';

export interface ConsultantProfile {
  consultantId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  preferredWorkType: string;
  preferredWorkMode: string;
  specialization: string;
  yearsOfExperience: number;
  primarySkills: string;
  availableServices: string;
  preferredWorkingHours: string;
  consultingMode: string;
  pricingStructure: string;
  paymentPreferences: string;
  briefBio: string;
  createdAt: Date;
  // Related data
  languagesSpoken: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  professionalExperience: Array<{
    role: string;
    company: string;
    years: string;
  }>;
  certificates: Array<{
    name: string;
  }>;
}

export interface ConsultantListItem {
  consultantId: number;
  fullName: string;
  email: string;
  location: string;
  specialization: string;
  yearsOfExperience: number;
  primarySkills: string;
  preferredWorkType: string;
  preferredWorkMode: string;
  consultingMode: string;
  briefBio: string;
  createdAt: Date;
}

export interface GetConsultantsOptions {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  location?: string;
  workType?: string;
  workMode?: string;
  minExperience?: number;
  maxExperience?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    search?: string;
    specialization?: string;
    location?: string;
    workType?: string;
    workMode?: string;
    minExperience?: number;
    maxExperience?: number;
  };
}

// Get all consultants with pagination and filtering
export const getAllConsultants = async (
  options: GetConsultantsOptions = {}
): Promise<PaginatedResponse<ConsultantListItem>> => {
  const {
    page = 1,
    limit = 10,
    search,
    specialization,
    location,
    workType,
    workMode,
    minExperience,
    maxExperience,
  } = options;

  const pool = await getConnection();
  
  // Build WHERE clause dynamically
  const conditions: string[] = [];
  const request = pool.request();

  if (search) {
    conditions.push(`(
      FullName LIKE @search 
      OR Email LIKE @search 
      OR Specialization LIKE @search 
      OR PrimarySkills LIKE @search 
      OR BriefBio LIKE @search
    )`);
    request.input('search', `%${search}%`);
  }

  if (specialization) {
    conditions.push('Specialization LIKE @specialization');
    request.input('specialization', `%${specialization}%`);
  }

  if (location) {
    conditions.push('Location LIKE @location');
    request.input('location', `%${location}%`);
  }

  if (workType) {
    conditions.push('PreferredWorkType LIKE @workType');
    request.input('workType', `%${workType}%`);
  }

  if (workMode) {
    conditions.push('PreferredWorkMode LIKE @workMode');
    request.input('workMode', `%${workMode}%`);
  }

  if (minExperience !== undefined) {
    conditions.push('YearsOfExperience >= @minExperience');
    request.input('minExperience', minExperience);
  }

  if (maxExperience !== undefined) {
    conditions.push('YearsOfExperience <= @maxExperience');
    request.input('maxExperience', maxExperience);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM Consultants 
    ${whereClause}
  `;
  
  const countResult = await request.query(countQuery);
  const total = countResult.recordset[0].total;

  // Calculate pagination
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  // Get paginated data - REMOVED UpdatedAt since it doesn't exist
  request.input('limit', limit);
  request.input('offset', offset);

  const dataQuery = `
    SELECT 
      ConsultantID as consultantId,
      FullName as fullName,
      Email as email,
      Location as location,
      Specialization as specialization,
      YearsOfExperience as yearsOfExperience,
      PrimarySkills as primarySkills,
      PreferredWorkType as preferredWorkType,
      PreferredWorkMode as preferredWorkMode,
      ConsultingMode as consultingMode,
      BriefBio as briefBio,
      COALESCE(CreatedAt, GETDATE()) as createdAt
    FROM Consultants 
    ${whereClause}
    ORDER BY COALESCE(CreatedAt, GETDATE()) DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const dataResult = await request.query(dataQuery);

  return {
    data: dataResult.recordset,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: options,
  };
};

// Get consultant by ID with full details - REMOVED UpdatedAt
export const getConsultantById = async (id: number): Promise<ConsultantProfile | null> => {
  const pool = await getConnection();

  // Get main consultant data - REMOVED UpdatedAt
  const consultantResult = await pool
    .request()
    .input('id', id)
    .query(`
      SELECT 
        ConsultantID as consultantId,
        FullName as fullName,
        Email as email,
        COALESCE(PhoneNumber, '') as phoneNumber,
        COALESCE(Location, '') as location,
        COALESCE(PreferredWorkType, '') as preferredWorkType,
        COALESCE(PreferredWorkMode, '') as preferredWorkMode,
        COALESCE(Specialization, '') as specialization,
        COALESCE(YearsOfExperience, 0) as yearsOfExperience,
        COALESCE(PrimarySkills, '') as primarySkills,
        COALESCE(AvailableServices, '') as availableServices,
        COALESCE(PreferredWorkingHours, '') as preferredWorkingHours,
        COALESCE(ConsultingMode, '') as consultingMode,
        COALESCE(PricingStructure, '') as pricingStructure,
        COALESCE(PaymentPreferences, '') as paymentPreferences,
        COALESCE(BriefBio, '') as briefBio,
        COALESCE(CreatedAt, GETDATE()) as createdAt
      FROM Consultants 
      WHERE ConsultantID = @id
    `);

  if (consultantResult.recordset.length === 0) {
    return null;
  }

  const consultant = consultantResult.recordset[0];

  try {
    // Get languages spoken - handle if table doesn't exist
    const languagesResult = await pool
      .request()
      .input('id', id)
      .query('SELECT Language FROM LanguagesSpoken WHERE ConsultantID = @id');

    // Get education - handle if table doesn't exist
    const educationResult = await pool
      .request()
      .input('id', id)
      .query(`
        SELECT 
          COALESCE(Degree, '') as degree, 
          COALESCE(Institution, '') as institution, 
          COALESCE(Year, '') as year 
        FROM Education 
        WHERE ConsultantID = @id
      `);

    // Get professional experience - handle if table doesn't exist
    const experienceResult = await pool
      .request()
      .input('id', id)
      .query(`
        SELECT 
          COALESCE(Role, '') as role, 
          COALESCE(Company, '') as company, 
          COALESCE(Years, '') as years 
        FROM ProfessionalExperience 
        WHERE ConsultantID = @id
      `);

    // Get certificates - handle if table doesn't exist
    const certificatesResult = await pool
      .request()
      .input('id', id)
      .query(`
        SELECT 
          COALESCE(Name, '') as name 
        FROM Certificates 
        WHERE ConsultantID = @id
      `);

    return {
      ...consultant,
      languagesSpoken: languagesResult.recordset.map(row => row.Language),
      education: educationResult.recordset,
      professionalExperience: experienceResult.recordset,
      certificates: certificatesResult.recordset,
    };

  } catch (relatedDataError: any) {
    console.warn('⚠️ Warning: Could not fetch related data for consultant:', relatedDataError.message);
    
    // Return consultant data without related tables if they don't exist
    return {
      ...consultant,
      languagesSpoken: [],
      education: [],
      professionalExperience: [],
      certificates: [],
    };
  }
};

// Get consultant statistics
export const getConsultantStats = async () => {
  const pool = await getConnection();

  const statsResult = await pool.request().query(`
    SELECT 
      COUNT(*) as totalConsultants,
      COUNT(DISTINCT Specialization) as uniqueSpecializations,
      COUNT(DISTINCT Location) as uniqueLocations,
      AVG(CAST(YearsOfExperience AS FLOAT)) as avgExperience,
      MAX(YearsOfExperience) as maxExperience,
      MIN(YearsOfExperience) as minExperience
    FROM Consultants
  `);

  const specializationResult = await pool.request().query(`
    SELECT 
      Specialization as specialization,
      COUNT(*) as count
    FROM Consultants 
    WHERE Specialization IS NOT NULL AND Specialization != ''
    GROUP BY Specialization
    ORDER BY count DESC
  `);

  const locationResult = await pool.request().query(`
    SELECT 
      Location as location,
      COUNT(*) as count
    FROM Consultants 
    WHERE Location IS NOT NULL AND Location != ''
    GROUP BY Location
    ORDER BY count DESC
  `);

  return {
    overview: statsResult.recordset[0],
    topSpecializations: specializationResult.recordset,
    topLocations: locationResult.recordset,
  };
};