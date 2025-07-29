import { getConnection } from '../config/database';
import sql from 'mssql';

export interface ClientProfile {
  clientId: number;
  fullName: string;
  email: string;
  companyName: string;
  companyWebsite?: string;
  industry: string;
  companySize: string;
  location: string;
  role: string;
  useCase: string;
  phoneNumber?: string;
  hearAboutUs?: string;
  acceptTerms: boolean;
  createdAt: Date;
}

export interface ClientListItem {
  clientId: number;
  fullName: string;
  email: string;
  companyName: string;
  industry: string;
  companySize: string;
  location: string;
  role: string;
  useCase: string;
  createdAt: Date;
}

export interface GetClientsOptions {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  role?: string;
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
    industry?: string;
    companySize?: string;
    location?: string;
    role?: string;
  };
}

// Get all clients with pagination and filtering
export const getAllClients = async (
  options: GetClientsOptions = {}
): Promise<PaginatedResponse<ClientListItem>> => {
  const {
    page = 1,
    limit = 10,
    search,
    industry,
    companySize,
    location,
    role,
  } = options;

  const pool = await getConnection();
  
  // Build WHERE clause dynamically
  const conditions: string[] = [];
  const request = pool.request();

  if (search) {
    conditions.push(`(
      FullName LIKE @search 
      OR Email LIKE @search 
      OR CompanyName LIKE @search 
      OR Industry LIKE @search 
      OR Role LIKE @search
      OR UseCase LIKE @search
    )`);
    request.input('search', `%${search}%`);
  }

  if (industry) {
    conditions.push('Industry LIKE @industry');
    request.input('industry', `%${industry}%`);
  }

  if (companySize) {
    conditions.push('CompanySize = @companySize');
    request.input('companySize', companySize);
  }

  if (location) {
    conditions.push('Location LIKE @location');
    request.input('location', `%${location}%`);
  }

  if (role) {
    conditions.push('Role LIKE @role');
    request.input('role', `%${role}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM Clients 
    ${whereClause}
  `;
  
  const countResult = await request.query(countQuery);
  const total = countResult.recordset[0].total;

  // Calculate pagination
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  // Get paginated data - REMOVED UpdatedAt since it might not exist
  request.input('limit', limit);
  request.input('offset', offset);

  const dataQuery = `
    SELECT 
      ClientID as clientId,
      FullName as fullName,
      Email as email,
      CompanyName as companyName,
      Industry as industry,
      CompanySize as companySize,
      Location as location,
      Role as role,
      UseCase as useCase,
      COALESCE(CreatedAt, GETDATE()) as createdAt
    FROM Clients 
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

// Get client by ID with full details - REMOVED UpdatedAt
export const getClientById = async (id: number): Promise<ClientProfile | null> => {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input('id', id)
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
      WHERE ClientID = @id
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  const client = result.recordset[0];
  
  // Convert bit to boolean for acceptTerms
  client.acceptTerms = Boolean(client.acceptTerms);

  return client;
};

// Get client statistics
export const getClientStats = async () => {
  const pool = await getConnection();

  const statsResult = await pool.request().query(`
    SELECT 
      COUNT(*) as totalClients,
      COUNT(DISTINCT Industry) as uniqueIndustries,
      COUNT(DISTINCT CompanySize) as uniqueCompanySizes,
      COUNT(DISTINCT Location) as uniqueLocations,
      COUNT(DISTINCT Role) as uniqueRoles
    FROM Clients
  `);

  const industryResult = await pool.request().query(`
    SELECT 
      Industry as industry,
      COUNT(*) as count
    FROM Clients 
    WHERE Industry IS NOT NULL AND Industry != ''
    GROUP BY Industry
    ORDER BY count DESC
  `);

  const companySizeResult = await pool.request().query(`
    SELECT 
      CompanySize as companySize,
      COUNT(*) as count
    FROM Clients 
    WHERE CompanySize IS NOT NULL AND CompanySize != ''
    GROUP BY CompanySize
    ORDER BY count DESC
  `);

  const locationResult = await pool.request().query(`
    SELECT 
      Location as location,
      COUNT(*) as count
    FROM Clients 
    WHERE Location IS NOT NULL AND Location != ''
    GROUP BY Location
    ORDER BY count DESC
  `);

  const roleResult = await pool.request().query(`
    SELECT 
      Role as role,
      COUNT(*) as count
    FROM Clients 
    WHERE Role IS NOT NULL AND Role != ''
    GROUP BY Role
    ORDER BY count DESC
  `);

  const useCaseResult = await pool.request().query(`
    SELECT 
      UseCase as useCase,
      COUNT(*) as count
    FROM Clients 
    WHERE UseCase IS NOT NULL AND UseCase != ''
    GROUP BY UseCase
    ORDER BY count DESC
  `);

  return {
    overview: statsResult.recordset[0],
    topIndustries: industryResult.recordset,
    topCompanySizes: companySizeResult.recordset,
    topLocations: locationResult.recordset,
    topRoles: roleResult.recordset,
    topUseCases: useCaseResult.recordset,
  };
};