import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:3000";

interface Ticket {
  id: string;
  ticketThreadId: string;
  ticketNumber?: number;
  guildId: string;
  type: string;
  status: string;
  title: string;
  openedById: string; // MemberRecord ID
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date | null;
  closedBy?: string | null;
  closeReason?: string | null;
  // Backward compatibility fields
  discordId?: string; // Maps to ticketThreadId
  creatorId?: string; // Maps to openedBy.discordId
}

/**
 * This class contains API methods that interact with the database via the API service.
 * It is also registered in the container to be used in other pieces and anywhere in the bot.
 */
export class TicketAPI {
  /**
   * Create a new ticket via API
   */
  public async createTicket(data: {
    ticketThreadId: string;
    guildId: string;
    type: string;
    status?: string;
    title: string;
    openedById: string; // MemberRecord ID
  }): Promise<Ticket> {
    try {
      const response = await axios.post(`${API_URL}/api/tickets`, {
        ...data,
        status: data.status || "OPEN",
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create ticket: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get ticket by Discord thread ID
   */
  public async getTicketByThreadId(ticketThreadId: string): Promise<Ticket | null> {
    try {
      const response = await axios.get(`${API_URL}/api/tickets/discord/${ticketThreadId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get ticket: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get ticket by Discord ID (backward compatibility)
   * @deprecated Use getTicketByThreadId instead
   */
  public async getTicketByDiscordId(discordId: string): Promise<Ticket | null> {
    return this.getTicketByThreadId(discordId);
  }

  /**
   * Update ticket status
   */
  public async updateTicket(ticketId: string, data: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await axios.patch(`${API_URL}/api/tickets/${ticketId}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update ticket: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get tickets by status
   */
  public async getTicketsByStatus(status: string, guildId?: string): Promise<Ticket[]> {
    try {
      const params = new URLSearchParams({ status });
      if (guildId) {
        params.append("guildId", guildId);
      }
      const response = await axios.get(`${API_URL}/api/tickets?${params.toString()}`);
      return response.data.tickets;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get tickets: ${error.message}`);
      }
      throw error;
    }
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    ticketAPI: TicketAPI;
  }
}
