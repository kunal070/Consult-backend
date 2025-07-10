import { getConnection } from '../config/database';
import { ConsultantService, CreateConsultantServiceRequest, UpdateConsultantServiceRequest, ConsultantServiceFilters } from '../types/consultantService';
import sql from 'mssql';

export class ConsultantServiceService {
  /**
   * Create a new consultant service
   */
  static async createConsultantService(data: CreateConsultantServiceRequest): Promise<ConsultantService> {
    const pool = await getConnection();
    
    // Set created_at to current timestamp if not provided
    const createdAt = data.created_at || new Date().toISOString();
    
    const result = await pool.request()
      .input('consultant_id', sql.Int, data.consultant_id)
      .input('title', sql.NVarChar(255), data.title)
      .input('description', sql.NVarChar(sql.MAX), data.description)
      .input('service_type', sql.NVarChar(100), data.service_type)
      .input('expertise', sql.NVarChar(sql.MAX), data.expertise || '')
      .input('hourly_rate', sql.Decimal(10, 2), data.hourly_rate)
      .input('project_rate', sql.Decimal(10, 2), data.project_rate || null)
      .input('availability', sql.NVarChar(50), data.availability)
      .input('duration', sql.NVarChar(50), data.duration || null)
      .input('experience_years', sql.Int, data.experience_years || null)
      .input('location', sql.NVarChar(100), data.location || null)
      .input('remote', sql.Bit, data.remote !== undefined ? data.remote : true)
      .input('languages', sql.NVarChar(sql.MAX), data.languages || '')
      .input('certifications', sql.NVarChar(sql.MAX), data.certifications || '')
      .input('portfolio', sql.NVarChar(255), data.portfolio || null)
      .input('linkedin', sql.NVarChar(255), data.linkedin || null)
      .input('website', sql.NVarChar(255), data.website || null)
      .input('response_time', sql.NVarChar(50), data.response_time || null)
      .input('min_project_budget', sql.Decimal(10, 2), data.min_project_budget || null)
      .input('created_at', sql.DateTime, createdAt)
      .query(`
        INSERT INTO consultant_services (
          consultant_id, title, description, service_type, expertise, hourly_rate, project_rate,
          availability, duration, experience_years, location, remote, languages, certifications,
          portfolio, linkedin, website, response_time, min_project_budget, created_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @consultant_id, @title, @description, @service_type, @expertise, @hourly_rate, @project_rate,
          @availability, @duration, @experience_years, @location, @remote, @languages, @certifications,
          @portfolio, @linkedin, @website, @response_time, @min_project_budget, @created_at
        )
      `);

    return result.recordset[0] as ConsultantService;
  }

  /**
   * Get all consultant services with optional filtering and pagination
   */
  static async getConsultantServices(filters: ConsultantServiceFilters = {}): Promise<{
    data: ConsultantService[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pool = await getConnection();
    
    // Set default values
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100); // Max 100 items per page
    const offset = (page - 1) * limit;
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'DESC';

    // Build WHERE clause
    let whereConditions: string[] = [];
    const request = pool.request();

    if (filters.consultant_id !== undefined) {
      whereConditions.push('consultant_id = @consultant_id');
      request.input('consultant_id', sql.Int, filters.consultant_id);
    }

    if (filters.service_type) {
      whereConditions.push('service_type LIKE @service_type');
      request.input('service_type', sql.NVarChar, `%${filters.service_type}%`);
    }

    if (filters.location) {
      whereConditions.push('location LIKE @location');
      request.input('location', sql.NVarChar, `%${filters.location}%`);
    }

    if (filters.min_hourly_rate !== undefined) {
      whereConditions.push('hourly_rate >= @min_hourly_rate');
      request.input('min_hourly_rate', sql.Decimal(10, 2), filters.min_hourly_rate);
    }

    if (filters.max_hourly_rate !== undefined) {
      whereConditions.push('hourly_rate <= @max_hourly_rate');
      request.input('max_hourly_rate', sql.Decimal(10, 2), filters.max_hourly_rate);
    }

    if (filters.min_project_rate !== undefined) {
      whereConditions.push('project_rate >= @min_project_rate');
      request.input('min_project_rate', sql.Decimal(10, 2), filters.min_project_rate);
    }

    if (filters.max_project_rate !== undefined) {
      whereConditions.push('project_rate <= @max_project_rate');
      request.input('max_project_rate', sql.Decimal(10, 2), filters.max_project_rate);
    }

    if (filters.min_experience_years !== undefined) {
      whereConditions.push('experience_years >= @min_experience_years');
      request.input('min_experience_years', sql.Int, filters.min_experience_years);
    }

    if (filters.max_experience_years !== undefined) {
      whereConditions.push('experience_years <= @max_experience_years');
      request.input('max_experience_years', sql.Int, filters.max_experience_years);
    }

    if (filters.remote !== undefined) {
      whereConditions.push('remote = @remote');
      request.input('remote', sql.Bit, filters.remote);
    }

    if (filters.availability) {
      whereConditions.push('availability LIKE @availability');
      request.input('availability', sql.NVarChar, `%${filters.availability}%`);
    }

    if (filters.expertise) {
      whereConditions.push('expertise LIKE @expertise');
      request.input('expertise', sql.NVarChar, `%${filters.expertise}%`);
    }

    if (filters.languages) {
      whereConditions.push('languages LIKE @languages');
      request.input('languages', sql.NVarChar, `%${filters.languages}%`);
    }

    if (filters.certifications) {
      whereConditions.push('certifications LIKE @certifications');
      request.input('certifications', sql.NVarChar, `%${filters.certifications}%`);
    }

    if (filters.min_project_budget !== undefined) {
      whereConditions.push('min_project_budget >= @min_project_budget');
      request.input('min_project_budget', sql.Decimal(10, 2), filters.min_project_budget);
    }

    if (filters.max_project_budget !== undefined) {
      whereConditions.push('min_project_budget <= @max_project_budget');
      request.input('max_project_budget', sql.Decimal(10, 2), filters.max_project_budget);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM consultant_services ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Get paginated results
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const dataResult = await request.query(`
      SELECT * FROM consultant_services 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    return {
      data: dataResult.recordset as ConsultantService[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a single consultant service by ID
   */
  static async getConsultantServiceById(id: number): Promise<ConsultantService | null> {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM consultant_services WHERE id = @id');

    return result.recordset.length > 0 ? result.recordset[0] as ConsultantService : null;
  }

  /**
   * Update a consultant service by ID
   */
  static async updateConsultantService(id: number, data: UpdateConsultantServiceRequest): Promise<ConsultantService | null> {
    const pool = await getConnection();
    
    // Build SET clause dynamically based on provided fields
    const setFields: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (data.consultant_id !== undefined) {
      setFields.push('consultant_id = @consultant_id');
      request.input('consultant_id', sql.Int, data.consultant_id);
    }

    if (data.title !== undefined) {
      setFields.push('title = @title');
      request.input('title', sql.NVarChar(255), data.title);
    }

    if (data.description !== undefined) {
      setFields.push('description = @description');
      request.input('description', sql.NVarChar(sql.MAX), data.description);
    }

    if (data.service_type !== undefined) {
      setFields.push('service_type = @service_type');
      request.input('service_type', sql.NVarChar(100), data.service_type);
    }

    if (data.expertise !== undefined) {
      setFields.push('expertise = @expertise');
      request.input('expertise', sql.NVarChar(sql.MAX), data.expertise);
    }

    if (data.hourly_rate !== undefined) {
      setFields.push('hourly_rate = @hourly_rate');
      request.input('hourly_rate', sql.Decimal(10, 2), data.hourly_rate);
    }

    if (data.project_rate !== undefined) {
      setFields.push('project_rate = @project_rate');
      request.input('project_rate', sql.Decimal(10, 2), data.project_rate);
    }

    if (data.availability !== undefined) {
      setFields.push('availability = @availability');
      request.input('availability', sql.NVarChar(50), data.availability);
    }

    if (data.duration !== undefined) {
      setFields.push('duration = @duration');
      request.input('duration', sql.NVarChar(50), data.duration);
    }

    if (data.experience_years !== undefined) {
      setFields.push('experience_years = @experience_years');
      request.input('experience_years', sql.Int, data.experience_years);
    }

    if (data.location !== undefined) {
      setFields.push('location = @location');
      request.input('location', sql.NVarChar(100), data.location);
    }

    if (data.remote !== undefined) {
      setFields.push('remote = @remote');
      request.input('remote', sql.Bit, data.remote);
    }

    if (data.languages !== undefined) {
      setFields.push('languages = @languages');
      request.input('languages', sql.NVarChar(sql.MAX), data.languages);
    }

    if (data.certifications !== undefined) {
      setFields.push('certifications = @certifications');
      request.input('certifications', sql.NVarChar(sql.MAX), data.certifications);
    }

    if (data.portfolio !== undefined) {
      setFields.push('portfolio = @portfolio');
      request.input('portfolio', sql.NVarChar(255), data.portfolio);
    }

    if (data.linkedin !== undefined) {
      setFields.push('linkedin = @linkedin');
      request.input('linkedin', sql.NVarChar(255), data.linkedin);
    }

    if (data.website !== undefined) {
      setFields.push('website = @website');
      request.input('website', sql.NVarChar(255), data.website);
    }

    if (data.response_time !== undefined) {
      setFields.push('response_time = @response_time');
      request.input('response_time', sql.NVarChar(50), data.response_time);
    }

    if (data.min_project_budget !== undefined) {
      setFields.push('min_project_budget = @min_project_budget');
      request.input('min_project_budget', sql.Decimal(10, 2), data.min_project_budget);
    }

    if (data.created_at !== undefined) {
      setFields.push('created_at = @created_at');
      request.input('created_at', sql.DateTime, data.created_at);
    }

    if (setFields.length === 0) {
      // No fields to update, return current record
      return this.getConsultantServiceById(id);
    }

    const result = await request.query(`
      UPDATE consultant_services 
      SET ${setFields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    return result.recordset.length > 0 ? result.recordset[0] as ConsultantService : null;
  }

  /**
   * Delete a consultant service by ID
   */
  static async deleteConsultantService(id: number): Promise<boolean> {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM consultant_services WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }

  /**
   * Get consultant service statistics
   */
  static async getConsultantServiceStats(): Promise<{
    total: number;
    byServiceType: Array<{ service_type: string; count: number }>;
    byLocation: Array<{ location: string; count: number }>;
    byRemote: Array<{ remote: boolean; count: number }>;
    averageHourlyRate: number;
    averageProjectRate: number;
    averageExperienceYears: number;
    totalConsultants: number;
  }> {
    const pool = await getConnection();

    // Get total count
    const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM consultant_services');
    const total = totalResult.recordset[0].total;

    // Get stats by service type
    const serviceTypeResult = await pool.request().query(`
      SELECT service_type, COUNT(*) as count 
      FROM consultant_services 
      GROUP BY service_type 
      ORDER BY count DESC
    `);

    // Get stats by location
    const locationResult = await pool.request().query(`
      SELECT location, COUNT(*) as count 
      FROM consultant_services 
      WHERE location IS NOT NULL
      GROUP BY location 
      ORDER BY count DESC
    `);

    // Get stats by remote
    const remoteResult = await pool.request().query(`
      SELECT remote, COUNT(*) as count 
      FROM consultant_services 
      GROUP BY remote 
      ORDER BY count DESC
    `);

    // Get average rates, experience years, and total consultants
    const avgResult = await pool.request().query(`
      SELECT 
        AVG(hourly_rate) as avg_hourly_rate,
        AVG(project_rate) as avg_project_rate,
        AVG(CAST(experience_years AS FLOAT)) as avg_experience_years,
        COUNT(DISTINCT consultant_id) as total_consultants
      FROM consultant_services
    `);

    return {
      total,
      byServiceType: serviceTypeResult.recordset,
      byLocation: locationResult.recordset,
      byRemote: remoteResult.recordset,
      averageHourlyRate: avgResult.recordset[0].avg_hourly_rate || 0,
      averageProjectRate: avgResult.recordset[0].avg_project_rate || 0,
      averageExperienceYears: avgResult.recordset[0].avg_experience_years || 0,
      totalConsultants: avgResult.recordset[0].total_consultants || 0
    };
  }
}