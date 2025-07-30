// src/services/connectionService.ts - FIXED VERSION

import { getConnection } from '../config/database';
import sql from 'mssql';
import { 
  Connection, 
  ConnectionWithUserInfo, 
  CreateConnectionRequest, 
  UpdateConnectionRequest, 
  ConnectionFilters,
  PaginatedConnectionResponse,
  ConnectionStats 
} from '../types/connection';

export class ConnectionService {
  /**
   * Create a new connection request
   */
  static async createConnection(
    requesterId: number, 
    requesterType: 'consultant' | 'client',
    data: CreateConnectionRequest
  ): Promise<Connection> {
    const pool = await getConnection();
    
    try {
      // Check if users exist
      await this.validateUserExists(data.receiverId, data.receiverType);
      await this.validateUserExists(requesterId, requesterType);
      
      // Check for self-connection
      if (requesterId === data.receiverId && requesterType === data.receiverType) {
        throw new Error('Cannot connect to yourself');
      }
      
      // Check for existing active connection
      const existingConnection = await this.getExistingConnection(
        requesterId, requesterType, data.receiverId, data.receiverType
      );
      
      if (existingConnection) {
        if (existingConnection.status === 'pending') {
          throw new Error('Connection request already pending');
        }
        if (existingConnection.status === 'accepted') {
          throw new Error('Users are already connected');
        }
        // If rejected or removed, we can create a new request
      }
      
      const result = await pool.request()
        .input('requesterId', sql.Int, requesterId)
        .input('requesterType', sql.NVarChar(20), requesterType)
        .input('receiverId', sql.Int, data.receiverId)
        .input('receiverType', sql.NVarChar(20), data.receiverType)
        .input('status', sql.NVarChar(20), 'pending')
        .input('requestDate', sql.DateTime, new Date())
        .input('createdAt', sql.DateTime, new Date())
        .input('updatedAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO Connections (
            RequesterID, RequesterType, ReceiverID, ReceiverType, 
            Status, RequestDate, CreatedAt, UpdatedAt
          )
          OUTPUT INSERTED.*
          VALUES (
            @requesterId, @requesterType, @receiverId, @receiverType,
            @status, @requestDate, @createdAt, @updatedAt
          )
        `);

      return this.mapConnectionFromDb(result.recordset[0]);
    } catch (error) {
      console.error('❌ Error in createConnection:', error);
      throw error;
    }
  }

  /**
   * Update connection status (accept/reject/remove)
   */
  static async updateConnectionStatus(
    connectionId: number,
    userId: number,
    userType: 'consultant' | 'client',
    data: UpdateConnectionRequest
  ): Promise<Connection> {
    const pool = await getConnection();
    
    try {
      // Get the connection and verify user has permission to update
      const connection = await this.getConnectionById(connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }
      
      // Check if user is involved in this connection
      const isReceiver = connection.receiverId === userId && connection.receiverType === userType;
      const isRequester = connection.requesterId === userId && connection.requesterType === userType;
      
      if (!isReceiver && !isRequester) {
        throw new Error('Unauthorized to update this connection');
      }
      
      // Validate status transitions
      this.validateStatusTransition(connection.status, data.status, isRequester, isReceiver);
      
      const now = new Date();
      const responseDate = connection.status === 'pending' ? now : connection.responseDate;
      
      const result = await pool.request()
        .input('connectionId', sql.Int, connectionId)
        .input('status', sql.NVarChar(20), data.status)
        .input('responseDate', sql.DateTime, responseDate)
        .input('updatedAt', sql.DateTime, now)
        .query(`
          UPDATE Connections 
          SET Status = @status, ResponseDate = @responseDate, UpdatedAt = @updatedAt
          OUTPUT INSERTED.*
          WHERE ConnectionID = @connectionId
        `);

      return this.mapConnectionFromDb(result.recordset[0]);
    } catch (error) {
      console.error('❌ Error in updateConnectionStatus:', error);
      throw error;
    }
  }

  /**
   * Get connections for a user with pagination and filtering
   */
  static async getUserConnections(
    userId: number,
    userType: 'consultant' | 'client',
    filters: ConnectionFilters = {}
  ): Promise<PaginatedConnectionResponse> {
    const pool = await getConnection();
    
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 10, 100);
      const offset = (page - 1) * limit;
      const sortBy = filters.sort_by || 'requestDate';
      const sortOrder = filters.sort_order || 'DESC';

      // Build WHERE clause
      let whereConditions: string[] = [
        '((RequesterID = @userId AND RequesterType = @userType) OR (ReceiverID = @userId AND ReceiverType = @userType))'
      ];
      const request = pool.request()
        .input('userId', sql.Int, userId)
        .input('userType', sql.NVarChar(20), userType);

      if (filters.status) {
        whereConditions.push('Status = @status');
        request.input('status', sql.NVarChar(20), filters.status);
      }

      if (filters.requesterType) {
        whereConditions.push('RequesterType = @requesterType');
        request.input('requesterType', sql.NVarChar(20), filters.requesterType);
      }

      if (filters.receiverType) {
        whereConditions.push('ReceiverType = @receiverType');
        request.input('receiverType', sql.NVarChar(20), filters.receiverType);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

      // Get total count
      const countResult = await request.query(`
        SELECT COUNT(*) as total FROM Connections ${whereClause}
      `);
      const total = countResult.recordset[0].total;

      // Get paginated data with user info
      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, limit);

      const dataResult = await request.query(`
        SELECT 
          c.*,
          -- Requester info
          CASE 
            WHEN c.RequesterType = 'consultant' THEN cons1.FullName
            WHEN c.RequesterType = 'client' THEN client1.FullName
          END as RequesterName,
          CASE 
            WHEN c.RequesterType = 'consultant' THEN cons1.Email
            WHEN c.RequesterType = 'client' THEN client1.Email
          END as RequesterEmail,
          CASE 
            WHEN c.RequesterType = 'consultant' THEN cons1.Location
            WHEN c.RequesterType = 'client' THEN client1.Location
          END as RequesterLocation,
          cons1.Specialization as RequesterSpecialization,
          client1.CompanyName as RequesterCompanyName,
          client1.Industry as RequesterIndustry,
          -- Receiver info
          CASE 
            WHEN c.ReceiverType = 'consultant' THEN cons2.FullName
            WHEN c.ReceiverType = 'client' THEN client2.FullName
          END as ReceiverName,
          CASE 
            WHEN c.ReceiverType = 'consultant' THEN cons2.Email
            WHEN c.ReceiverType = 'client' THEN client2.Email
          END as ReceiverEmail,
          CASE 
            WHEN c.ReceiverType = 'consultant' THEN cons2.Location
            WHEN c.ReceiverType = 'client' THEN client2.Location
          END as ReceiverLocation,
          cons2.Specialization as ReceiverSpecialization,
          client2.CompanyName as ReceiverCompanyName,
          client2.Industry as ReceiverIndustry
        FROM Connections c
        LEFT JOIN Consultants cons1 ON c.RequesterID = cons1.ConsultantID AND c.RequesterType = 'consultant'
        LEFT JOIN Clients client1 ON c.RequesterID = client1.ClientID AND c.RequesterType = 'client'
        LEFT JOIN Consultants cons2 ON c.ReceiverID = cons2.ConsultantID AND c.ReceiverType = 'consultant'
        LEFT JOIN Clients client2 ON c.ReceiverID = client2.ClientID AND c.ReceiverType = 'client'
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

      const connectionsWithInfo = dataResult.recordset.map(row => this.mapConnectionWithUserInfoFromDb(row));

      return {
        data: connectionsWithInfo,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        filters
      };
    } catch (error) {
      console.error('❌ Error in getUserConnections:', error);
      throw error;
    }
  }

  /**
   * Get connection by ID
   */
  static async getConnectionById(connectionId: number): Promise<Connection | null> {
    const pool = await getConnection();
    
    try {
      const result = await pool.request()
        .input('connectionId', sql.Int, connectionId)
        .query('SELECT * FROM Connections WHERE ConnectionID = @connectionId');

      return result.recordset.length > 0 ? this.mapConnectionFromDb(result.recordset[0]) : null;
    } catch (error) {
      console.error('❌ Error in getConnectionById:', error);
      throw error;
    }
  }

  /**
   * Check connection status between two users
   */
  static async getConnectionStatus(
    user1Id: number,
    user1Type: 'consultant' | 'client',
    user2Id: number,
    user2Type: 'consultant' | 'client'
  ): Promise<{ status: string; canConnect: boolean; connection?: Connection }> {
    try {
      const connection = await this.getExistingConnection(user1Id, user1Type, user2Id, user2Type);
      
      if (!connection) {
        return { status: 'none', canConnect: true };
      }

      const canConnect = connection.status === 'rejected' || connection.status === 'removed';

      return {
        status: connection.status,
        canConnect,
        connection
      };
    } catch (error) {
      console.error('❌ Error in getConnectionStatus:', error);
      throw error;
    }
  }

  /**
   * Get connection statistics - FIXED VERSION
   */
  static async getConnectionStats(): Promise<ConnectionStats> {
    try {
      console.log('🔄 Getting fresh database connection for stats...');
      const pool = await getConnection();
      
      console.log('📊 Executing connection stats query...');
      const result = await pool.request().query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN Status = 'accepted' THEN 1 ELSE 0 END) as accepted,
          SUM(CASE WHEN Status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN Status = 'removed' THEN 1 ELSE 0 END) as removed,
          SUM(CASE WHEN RequesterType = 'consultant' AND ReceiverType = 'client' THEN 1 ELSE 0 END) as consultantToClient,
          SUM(CASE WHEN RequesterType = 'client' AND ReceiverType = 'consultant' THEN 1 ELSE 0 END) as clientToConsultant,
          SUM(CASE WHEN RequesterType = 'consultant' AND ReceiverType = 'consultant' THEN 1 ELSE 0 END) as consultantToConsultant,
          SUM(CASE WHEN RequesterType = 'client' AND ReceiverType = 'client' THEN 1 ELSE 0 END) as clientToClient
        FROM Connections
      `);

      const stats = result.recordset[0];
      console.log('✅ Stats query successful:', stats);

      return {
        totalConnections: stats.total || 0,
        pendingRequests: stats.pending || 0,
        acceptedConnections: stats.accepted || 0,
        rejectedRequests: stats.rejected || 0,
        removedConnections: stats.removed || 0,
        byType: {
          consultantToClient: stats.consultantToClient || 0,
          clientToConsultant: stats.clientToConsultant || 0,
          consultantToConsultant: stats.consultantToConsultant || 0,
          clientToClient: stats.clientToClient || 0
        }
      };
    } catch (error) {
      console.error('❌ Error in getConnectionStats:', error);
      throw error;
    }
  }

  // Helper methods
  private static async validateUserExists(userId: number, userType: 'consultant' | 'client'): Promise<void> {
    const pool = await getConnection();
    
    try {
      const table = userType === 'consultant' ? 'Consultants' : 'Clients';
      const idField = userType === 'consultant' ? 'ConsultantID' : 'ClientID';
      
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT 1 FROM ${table} WHERE ${idField} = @userId`);
      
      if (result.recordset.length === 0) {
        throw new Error(`${userType} not found`);
      }
    } catch (error) {
      console.error(`❌ Error validating ${userType} ${userId}:`, error);
      throw error;
    }
  }

  private static async getExistingConnection(
    user1Id: number,
    user1Type: 'consultant' | 'client',
    user2Id: number,
    user2Type: 'consultant' | 'client'
  ): Promise<Connection | null> {
    const pool = await getConnection();
    
    try {
      const result = await pool.request()
        .input('user1Id', sql.Int, user1Id)
        .input('user1Type', sql.NVarChar(20), user1Type)
        .input('user2Id', sql.Int, user2Id)
        .input('user2Type', sql.NVarChar(20), user2Type)
        .query(`
          SELECT TOP 1 * FROM Connections 
          WHERE 
            ((RequesterID = @user1Id AND RequesterType = @user1Type AND ReceiverID = @user2Id AND ReceiverType = @user2Type)
            OR (RequesterID = @user2Id AND RequesterType = @user2Type AND ReceiverID = @user1Id AND ReceiverType = @user1Type))
            AND Status IN ('pending', 'accepted')
          ORDER BY CreatedAt DESC
        `);

      return result.recordset.length > 0 ? this.mapConnectionFromDb(result.recordset[0]) : null;
    } catch (error) {
      console.error('❌ Error in getExistingConnection:', error);
      throw error;
    }
  }

  private static validateStatusTransition(
    currentStatus: string,
    newStatus: string,
    isRequester: boolean,
    isReceiver: boolean
  ): void {
    // Only receiver can accept/reject pending requests
    if (currentStatus === 'pending' && (newStatus === 'accepted' || newStatus === 'rejected')) {
      if (!isReceiver) {
        throw new Error('Only the receiver can accept or reject a connection request');
      }
      return;
    }
    
    // Both parties can remove an accepted connection
    if (currentStatus === 'accepted' && newStatus === 'removed') {
      return;
    }
    
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  private static mapConnectionFromDb(row: any): Connection {
    return {
      connectionId: row.ConnectionID,
      requesterId: row.RequesterID,
      requesterType: row.RequesterType,
      receiverId: row.ReceiverID,
      receiverType: row.ReceiverType,
      status: row.Status,
      requestDate: row.RequestDate,
      responseDate: row.ResponseDate,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }

  private static mapConnectionWithUserInfoFromDb(row: any): ConnectionWithUserInfo {
    const connection = this.mapConnectionFromDb(row);
    
    return {
      ...connection,
      requesterInfo: {
        id: connection.requesterId,
        name: row.RequesterName || '',
        email: row.RequesterEmail || '',
        type: connection.requesterType,
        location: row.RequesterLocation || '',
        specialization: row.RequesterSpecialization || undefined,
        companyName: row.RequesterCompanyName || undefined,
        industry: row.RequesterIndustry || undefined
      },
      receiverInfo: {
        id: connection.receiverId,
        name: row.ReceiverName || '',
        email: row.ReceiverEmail || '',
        type: connection.receiverType,
        location: row.ReceiverLocation || '',
        specialization: row.ReceiverSpecialization || undefined,
        companyName: row.ReceiverCompanyName || undefined,
        industry: row.ReceiverIndustry || undefined
      }
    };
  }
}