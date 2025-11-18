import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiError {
  error: string;
  details?: unknown;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Add request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          throw new Error(error.response.data?.error || 'API request failed');
        }
        throw error;
      }
    );
  }

  // Tickets
  async getTickets(params?: Record<string, unknown>) {
    const response = await this.client.get('/api/tickets', { params });
    return response.data;
  }

  async getTicket(id: string) {
    const response = await this.client.get(`/api/tickets/${id}`);
    return response.data;
  }

  async getTicketByDiscordId(discordId: string) {
    const response = await this.client.get(`/api/tickets/discord/${discordId}`);
    return response.data;
  }

  async createTicket(data: unknown) {
    const response = await this.client.post('/api/tickets', data);
    return response.data;
  }

  async updateTicket(id: string, data: unknown) {
    const response = await this.client.patch(`/api/tickets/${id}`, data);
    return response.data;
  }

  async deleteTicket(id: string) {
    await this.client.delete(`/api/tickets/${id}`);
  }

  // Ticket Messages
  async getTicketMessages(ticketId: string, params?: Record<string, unknown>) {
    const response = await this.client.get(`/api/ticket-messages/ticket/${ticketId}`, { params });
    return response.data;
  }

  // Ticket Logs
  async getTicketLogs(ticketId: string, params?: Record<string, unknown>) {
    const response = await this.client.get(`/api/ticket-logs/ticket/${ticketId}`, { params });
    return response.data;
  }

  // Warnings
  async getWarnings(params?: Record<string, unknown>) {
    const response = await this.client.get('/api/warnings', { params });
    return response.data;
  }

  async getWarning(id: string) {
    const response = await this.client.get(`/api/warnings/${id}`);
    return response.data;
  }

  // Verification Tickets
  async getVerificationTickets(params?: Record<string, unknown>) {
    const response = await this.client.get('/api/verification-tickets', { params });
    return response.data;
  }

  async getVerificationTicket(id: string) {
    const response = await this.client.get(`/api/verification-tickets/${id}`);
    return response.data;
  }

  // Moderation Actions
  async getModerationActions(params?: Record<string, unknown>) {
    const response = await this.client.get('/api/moderation-actions', { params });
    return response.data;
  }

  // Member Records
  async getMemberRecords(params?: Record<string, unknown>) {
    const response = await this.client.get('/api/member-records', { params });
    return response.data;
  }

  async getMemberRecord(id: string) {
    const response = await this.client.get(`/api/member-records/${id}`);
    return response.data;
  }

  async getMemberByDiscordId(discordId: string) {
    const response = await this.client.get(`/api/member-records/discord/${discordId}`);
    return response.data;
  }

  // Mod on Call
  async getModOnCall(params?: Record<string, unknown>) {
    const response = await this.client.get('/api/mod-on-call', { params });
    return response.data;
  }

  async getCurrentModOnCall() {
    const response = await this.client.get('/api/mod-on-call/current');
    return response.data;
  }

  async getModOnCallById(id: string) {
    const response = await this.client.get(`/api/mod-on-call/${id}`);
    return response.data;
  }

  async getModOnCallByStaff(staffId: string) {
    const response = await this.client.get(`/api/mod-on-call/staff/${staffId}`);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();

