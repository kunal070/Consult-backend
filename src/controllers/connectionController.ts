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
    try {
      console.log('📊 Getting connection statistics');

      const stats = await ConnectionService.getConnectionStats();

      reply.status(200).send(
        createResponse(true, 'Connection statistics retrieved successfully', stats)
      );
    } catch (error: any) {
      console.error('❌ Error getting connection stats:', error);
      reply.status(500).send(
        createResponse(false, 'Failed to retrieve connection statistics', undefined, error.message)
      );
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
}