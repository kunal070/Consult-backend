// src/types/connection.ts

export interface Connection {
  connectionId: number;
  requesterId: number;
  requesterType: 'consultant' | 'client';
  receiverId: number;
  receiverType: 'consultant' | 'client';
  status: 'pending' | 'accepted' | 'rejected' | 'removed';
  requestDate: Date;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConnectionRequest {
  receiverId: number;
  receiverType: 'consultant' | 'client';
}

export interface UpdateConnectionRequest {
  status: 'accepted' | 'rejected' | 'removed';
}

export interface ConnectionFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'removed';
  requesterType?: 'consultant' | 'client';
  receiverType?: 'consultant' | 'client';
  page?: number;
  limit?: number;
  sort_by?: 'requestDate' | 'responseDate' | 'status';
  sort_order?: 'ASC' | 'DESC';
}

export interface ConnectionWithUserInfo extends Connection {
  requesterInfo: {
    id: number;
    name: string;
    email: string;
    type: 'consultant' | 'client';
    location?: string;
    specialization?: string;
    companyName?: string;
    industry?: string;
  };
  receiverInfo: {
    id: number;
    name: string;
    email: string;
    type: 'consultant' | 'client';
    location?: string;
    specialization?: string;
    companyName?: string;
    industry?: string;
  };
}

export interface ConnectionStats {
  totalConnections: number;
  pendingRequests: number;
  acceptedConnections: number;
  rejectedRequests: number;
  removedConnections: number;
  byType: {
    consultantToClient: number;
    clientToConsultant: number;
    consultantToConsultant: number;
    clientToClient: number;
  };
}

export interface PaginatedConnectionResponse {
  data: ConnectionWithUserInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: ConnectionFilters;
}