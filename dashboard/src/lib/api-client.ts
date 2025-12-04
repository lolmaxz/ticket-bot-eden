import axios, { type AxiosError, type AxiosInstance } from "axios";

// Use Next.js API proxy routes instead of calling backend directly
// This ensures authentication and authorization are checked
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const USE_PROXY = !API_URL || API_URL.includes("localhost") || API_URL.includes("127.0.0.1");
const BACKEND_API_URL = API_URL || "http://localhost:3000";

export interface ApiError {
  error: string;
  details?: unknown;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(token?: string) {
    // If using proxy, baseURL should be empty (relative URLs)
    // Otherwise, use the backend API URL
    this.client = axios.create({
      baseURL: USE_PROXY ? "" : BACKEND_API_URL,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Add request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          throw new Error(error.response.data?.error || "API request failed");
        }
        throw error;
      }
    );
  }

  // Tickets
  async getTickets(params?: Record<string, unknown>) {
    const url = USE_PROXY ? "/api/proxy/tickets" : `${BACKEND_API_URL}/api/tickets`;
    // Configure paramsSerializer to handle arrays properly for Fastify
    const response = await this.client.get(url, {
      params,
      paramsSerializer: {
        indexes: null, // Serialize arrays as 'type=value1&type=value2' instead of 'type[]=value1&type[]=value2'
      },
    });
    return response.data;
  }

  private getApiPath(path: string): string {
    return USE_PROXY ? `/api/proxy/${path}` : `/api/${path}`;
  }

  async getTicket(id: string) {
    const response = await this.client.get(this.getApiPath(`tickets/${id}`));
    return response.data;
  }

  async getTicketByDiscordId(discordId: string) {
    const response = await this.client.get(this.getApiPath(`tickets/discord/${discordId}`));
    return response.data;
  }

  async createTicket(data: unknown) {
    const response = await this.client.post(this.getApiPath("tickets"), data);
    return response.data;
  }

  async updateTicket(id: string, data: unknown) {
    const response = await this.client.patch(this.getApiPath(`tickets/${id}`), data);
    return response.data;
  }

  async deleteTicket(id: string) {
    await this.client.delete(this.getApiPath(`tickets/${id}`));
  }

  // Ticket Messages
  async getTicketMessages(ticketId: string, params?: Record<string, unknown>) {
    const response = await this.client.get(this.getApiPath(`ticket-messages/ticket/${ticketId}`), { params });
    return response.data;
  }

  // Ticket Logs
  async getTicketLogs(ticketId: string, params?: Record<string, unknown>) {
    const response = await this.client.get(this.getApiPath(`ticket-logs/ticket/${ticketId}`), { params });
    return response.data;
  }

  // Warnings
  async getWarnings(params?: Record<string, unknown>) {
    const response = await this.client.get(this.getApiPath("warnings"), { params });
    return response.data;
  }

  async getWarning(id: string) {
    const response = await this.client.get(this.getApiPath(`warnings/${id}`));
    return response.data;
  }

  // Verification Tickets
  async getVerificationTickets(params?: Record<string, unknown>) {
    const response = await this.client.get(this.getApiPath("verification-tickets"), { params });
    return response.data;
  }

  async getVerificationTicket(id: string) {
    const response = await this.client.get(this.getApiPath(`verification-tickets/${id}`));
    return response.data;
  }

  // Moderation Actions
  async getModerationActions(params?: Record<string, unknown>) {
    const response = await this.client.get(this.getApiPath("moderation-actions"), { params });
    return response.data;
  }

  // Member Records
  async getMemberRecords(params?: Record<string, unknown>) {
    const response = await this.client.get(this.getApiPath("member-records"), { params });
    return response.data;
  }

  async getMemberRecord(id: string) {
    const response = await this.client.get(this.getApiPath(`member-records/${id}`));
    return response.data;
  }

  async getMemberByDiscordId(discordId: string) {
    const response = await this.client.get(this.getApiPath(`member-records/discord/${discordId}`));
    return response.data;
  }

  // Mod on Call
  async getModOnCall(params?: Record<string, unknown>) {
    const response = await this.client.get(this.getApiPath("mod-on-call"), { params });
    return response.data;
  }

  async getCurrentModOnCall() {
    const response = await this.client.get(this.getApiPath("mod-on-call/current"));
    return response.data;
  }

  async getModOnCallById(id: string) {
    const response = await this.client.get(this.getApiPath(`mod-on-call/${id}`));
    return response.data;
  }

  async getModOnCallByStaff(staffId: string) {
    const response = await this.client.get(this.getApiPath(`mod-on-call/staff/${staffId}`));
    return response.data;
  }

  // User Preferences
  async getUserPreferences(discordId: string) {
    const response = await this.client.get(this.getApiPath(`user-preferences/${discordId}`));
    return response.data;
  }

  async updateUserPreferences(discordId: string, data: { dateFormat?: "absolute" | "relative" }) {
    const response = await this.client.patch(this.getApiPath(`user-preferences/${discordId}`), data);
    return response.data;
  }

  // Discord Users
  async getDiscordUser(discordId: string) {
    const response = await this.client.get(this.getApiPath(`discord-users/${discordId}`));
    return response.data;
  }

  // Health check
  async healthCheck() {
    // Health check doesn't need auth, so call backend directly
    const response = await this.client.get(`${BACKEND_API_URL}/health`);
    return response.data;
  }

  // Admin endpoints
  async getAdminTicketAnalytics(period: "day" | "week" | "month" = "week") {
    const response = await this.client.get(this.getApiPath(`admin/analytics/tickets?period=${period}`));
    return response.data;
  }

  async getAdminStaffAnalytics(period: "day" | "week" | "month" = "week") {
    const response = await this.client.get(this.getApiPath(`admin/analytics/staff?period=${period}`));
    return response.data;
  }

  async getAdminVerificationAnalytics(period: "day" | "week" | "month" = "week") {
    const response = await this.client.get(this.getApiPath(`admin/analytics/verifications?period=${period}`));
    return response.data;
  }
}

export const apiClient = new ApiClient();
