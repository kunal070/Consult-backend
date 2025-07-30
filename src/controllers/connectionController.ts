// src/controllers/connectionController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { ConnectionService } from '../services/connectionService';
import { 
  CreateConnectionRequest, 
  UpdateConnectionRequest, 
  ConnectionFilters 
} from '../types/connection';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

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

export class ConnectionController {
  static async createConnection(
    request: FastifyRequest<{ Body: CreateConnectionRequest }>,
    reply: FastifyReply
  ) {
    try {
      const requesterId = 1; 
      const requesterType: 'consultant' | 'client' = 'consultant'; 

      const connection = await ConnectionService.createConnection(
        requesterId,
        requesterType,
        request.body
      );

      reply.status(201).send(
        createResponse(true, 'Connection request sent successfully', connection)
      );
    } catch (error: any) {
      console.error('❌ Error creating connection:', error);
      
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('already') ? 409 :
                        error.message.includes('Cannot connect') ? 400 : 500;

      reply.status(statusCode).send(
        createResponse(false, 'Failed to create connection request', undefined, error.message)
      );
    }
  }

  static async updateConnectionStatus(
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: UpdateConnectionRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const connectionId = parseInt(request.params.id);
      
      if (isNaN(connectionId) || connectionId <= 0) {
        reply.status(400).send(createResponse(false, 'Invalid connection ID'));
        return;
      }

      const userId = 2; 
      const userType: 'consultant' | 'client' = 'client'; 

      const connection = await ConnectionService.updateConnectionStatus(
        connectionId,
        userId,
        userType,
        request.body
      );

      const actionMessage = {
        accepted: 'Connection request accepted',
        rejected: 'Connection request rejected', 
        removed: 'Connection removed'
      }[request.body.status];

      reply.status(200).send(createResponse(true, actionMessage, connection));
    } catch (error: any) {
      console.error('❌ Error updating connection status:', error);
      
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Unauthorized') ? 403 :
                        error.message.includes('Invalid') ? 400 : 500;

      reply.status(statusCode).send(
        createResponse(false, 'Failed to update connection status', undefined, error.message)
      );
    }
  }

  static async getUserConnections(
    request: FastifyRequest<{ Querystring: ConnectionFilters }>,
    reply: FastifyReply
  ) {
    try {
      const userId = 1; 
      const userType: 'consultant' | 'client' = 'consultant'; 

      const result = await ConnectionService.getUserConnections(
        userId,
        userType,
        request.query
      );

      reply.status(200).send(
        createResponse(true, `Retrieved ${result.data.length} connections`, result)
      );
    } catch (error: any) {
      console.error('❌ Error getting user connections:', error);
      reply.status(500).send(
        createResponse(false, 'Failed to retrieve connections', undefined, error.message)
      );
    }
  }

  static async getConnectionById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const connectionId = parseInt(request.params.id);
      
      if (isNaN(connectionId) || connectionId <= 0) {
        reply.status(400).send(createResponse(false, 'Invalid connection ID'));
        return;
      }

      const connection = await ConnectionService.getConnectionById(connectionId);

      if (!connection) {
        reply.status(404).send(createResponse(false, 'Connection not found'));
        return;
      }

      reply.status(200).send(
        createResponse(true, 'Connection retrieved successfully', connection)
      );
    } catch (error: any) {
      console.error('❌ Error getting connection by ID:', error);
      reply.status(500).send(
        createResponse(false, 'Failed to retrieve connection', undefined, error.message)
      );
    }
  }

  static async getConnectionStatus(
    request: FastifyRequest<{ 
      Params: { 
        userType: 'consultant' | 'client';
        userId: string;
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const otherUserId = parseInt(request.params.userId);
      const otherUserType = request.params.userType;
      
      if (isNaN(otherUserId) || otherUserId <= 0) {
        reply.status(400).send(createResponse(false, 'Invalid user ID'));
        return;
      }

      const currentUserId = 1; 
      const currentUserType: 'consultant' | 'client' = 'consultant'; 

      const status = await ConnectionService.getConnectionStatus(
        currentUserId,
        currentUserType,
        otherUserId,
        otherUserType
      );

      reply.status(200).send(
        createResponse(true, 'Connection status retrieved successfully', status)
      );
    } catch (error: any) {
      console.error('❌ Error getting connection status:', error);
      reply.status(500).send(
        createResponse(false, 'Failed to check connection status', undefined, error.message)
      );
    }
  }

static async getConnectionStats(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Import at the top of the method to avoid import issues
  const sql = require('mssql');
  
  try {
    console.log('📊 Getting connection statistics with fresh connection approach');

    // Get config
    const { config } = await import('../config/config');

    // Create completely fresh connection (no pooling)
    const freshConfig = {
      server: config.database.server,
      database: config.database.database,
      user: config.database.username,
      password: config.database.password,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
      connectionTimeout: 30000,
      requestTimeout: 30000,
    };

    console.log('🔄 Connecting to database...');
    console.log('📡 Server:', freshConfig.server);
    console.log('🗄️ Database:', freshConfig.database);

    // Create single-use connection
    const connection = new sql.ConnectionPool(freshConfig);
    await connection.connect();
    console.log('✅ Fresh connection established');

    // Execute query immediately
    const result = await connection.request().query(`
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

    console.log('✅ Query executed successfully');

    // Close connection immediately
    await connection.close();
    console.log('🔌 Connection closed');

    // Process results
    const stats = result.recordset[0];
    const responseData = {
      totalConnections: Number(stats.total) || 0,
      pendingRequests: Number(stats.pending) || 0,
      acceptedConnections: Number(stats.accepted) || 0,
      rejectedRequests: Number(stats.rejected) || 0,
      removedConnections: Number(stats.removed) || 0,
      byType: {
        consultantToClient: Number(stats.consultantToClient) || 0,
        clientToConsultant: Number(stats.clientToConsultant) || 0,
        consultantToConsultant: Number(stats.consultantToConsultant) || 0,
        clientToClient: Number(stats.clientToClient) || 0
      }
    };

    console.log('📊 Final stats:', responseData);

    reply.status(200).send({
      success: true,
      message: 'Connection statistics retrieved successfully',
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      originalError: error.originalError,
      number: error.number,
      state: error.state,
      class: error.class,
      serverName: error.serverName,
      procName: error.procName,
      lineNumber: error.lineNumber
    });

    reply.status(500).send({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      details: {
        code: error.code,
        name: error.name,
        number: error.number
      },
      timestamp: new Date().toISOString()
    });
  }
}

  static async getPendingRequests(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const userId = 1; 
      const userType: 'consultant' | 'client' = 'consultant'; 

      const result = await ConnectionService.getUserConnections(
        userId,
        userType,
        { status: 'pending' }
      );

      reply.status(200).send(
        createResponse(true, `Retrieved ${result.data.length} pending requests`, result)
      );
    } catch (error: any) {
      console.error('❌ Error getting pending requests:', error);
      reply.status(500).send(
        createResponse(false, 'Failed to retrieve pending requests', undefined, error.message)
      );
    }
  }

static async debugConnectionsTable(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log('🔍 Starting connections table debug...');
    
    const { getConnection } = await import('../config/database');
    const pool = await getConnection();
    
    // Test 1: Check if table exists
    console.log('📋 Test 1: Checking if table exists...');
    const tableExistsResult = await pool.request().query(`
      SELECT COUNT(*) as tableCount, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Connections', 'connections')
    `);
    
    console.log('📋 Table exists result:', tableExistsResult.recordset);
    
    // Test 2: List all tables
    console.log('📋 Test 2: Listing all tables...');
    const allTablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 All tables:', allTablesResult.recordset);
    
    let connectionStats = null;
    let tableStructure = null;
    let sampleData = null;
    
    // Test 3: If table exists, check structure
    if (tableExistsResult.recordset.length > 0 && tableExistsResult.recordset[0].tableCount > 0) {
      const actualTableName = tableExistsResult.recordset[0].TABLE_NAME || 'Connections';
      
      console.log('📋 Test 3: Checking table structure...');
      const structureResult = await pool.request().query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${actualTableName}'
        ORDER BY ORDINAL_POSITION
      `);
      
      tableStructure = structureResult.recordset;
      console.log('📋 Table structure:', tableStructure);
      
      // Test 4: Try to get sample data
      console.log('📋 Test 4: Getting sample data...');
      try {
        const sampleResult = await pool.request().query(`
          SELECT TOP 5 * FROM ${actualTableName}
        `);
        sampleData = sampleResult.recordset;
        console.log('📋 Sample data:', sampleData);
      } catch (sampleError) {
        const sampleErrorMessage = (sampleError && typeof sampleError === 'object' && 'message' in sampleError)
          ? (sampleError as { message: string }).message
          : String(sampleError);
        console.log('⚠️ Could not get sample data:', sampleErrorMessage);
      }
      
      // Test 5: Try to get stats
      console.log('📋 Test 5: Getting stats...');
      try {
        const statsResult = await pool.request().query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN Status = 'accepted' THEN 1 ELSE 0 END) as accepted,
            SUM(CASE WHEN Status = 'rejected' THEN 1 ELSE 0 END) as rejected,
            SUM(CASE WHEN Status = 'removed' THEN 1 ELSE 0 END) as removed
          FROM ${actualTableName}
        `);
        connectionStats = statsResult.recordset[0];
        console.log('📋 Connection stats:', connectionStats);
      } catch (statsError) {
        const statsErrorMessage = (statsError && typeof statsError === 'object' && 'message' in statsError)
          ? (statsError as { message: string }).message
          : String(statsError);
        console.log('⚠️ Could not get stats:', statsErrorMessage);
        connectionStats = { error: statsErrorMessage };
      }
    }
    
    // Test 6: Check related tables
    console.log('📋 Test 6: Checking related tables...');
    const relatedTablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('Consultants', 'Clients', 'consultants', 'clients')
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 Related tables:', relatedTablesResult.recordset);
    
    reply.status(200).send({
      success: true,
      debug: {
        tableExists: tableExistsResult.recordset,
        allTables: allTablesResult.recordset,
        tableStructure,
        sampleData,
        connectionStats,
        relatedTables: relatedTablesResult.recordset,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    reply.status(500).send({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        number: error.number,
        state: error.state,
        class: error.class,
        serverName: error.serverName,
        procName: error.procName,
        lineNumber: error.lineNumber
      },
      timestamp: new Date().toISOString()
    });
  }
}
}