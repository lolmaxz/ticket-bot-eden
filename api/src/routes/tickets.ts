import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const TicketTypeEnum = z.enum([
  'VERIFICATION_ID',
  'STAFF_TALK',
  'EVENT_REPORT',
  'UNSOLICITED_DM',
  'FRIEND_REQUEST',
  'DRAMA',
  'OTHER',
]);

const TicketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'CLOSED', 'ARCHIVED']);

const createTicketSchema = z.object({
  ticketThreadId: z.string(),
  guildId: z.string(),
  type: TicketTypeEnum,
  status: TicketStatusEnum.default('OPEN'),
  title: z.string(),
  openedById: z.string(), // MemberRecord ID
});

const updateTicketSchema = z.object({
  status: TicketStatusEnum.optional(),
  title: z.string().optional(),
  closedAt: z.string().datetime().optional().nullable(),
  closedBy: z.string().optional().nullable(),
  closeReason: z.string().optional().nullable(),
});

export default async function ticketRoutes(fastify: FastifyInstance): Promise<void> {
  // Authorization is handled by the Next.js proxy route
  // Get all tickets with filters
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        status?: string | string[];
        type?: string | string[];
        'type[]'?: string | string[];
        'status[]'?: string | string[];
        openedById?: string;
        guildId?: string;
        limit?: string;
        offset?: string;
      };

      // Debug logging (can be removed in production)
      // fastify.log.info({ query }, 'Query received');

      const where: Record<string, unknown> = {};

      // Handle status filter - check both 'status' and 'status[]'
      // Fastify may parse repeated params as arrays or as 'status[]' key
      const statusValue = query['status[]'] || query.status;
      if (statusValue) {
        // Support both single value and array
        if (Array.isArray(statusValue)) {
          where.status = { in: statusValue };
        } else if (typeof statusValue === 'string' && statusValue.includes(',')) {
          // Handle comma-separated values
          where.status = { in: statusValue.split(',').map((s) => s.trim()) };
        } else {
          where.status = statusValue;
        }
      }

      // Handle type filter - check both 'type' and 'type[]'
      // Fastify may parse repeated params as arrays or as 'type[]' key
      const typeValue = query['type[]'] || query.type;
      if (typeValue) {
        // Support both single value and array
        if (Array.isArray(typeValue)) {
          where.type = { in: typeValue };
        } else if (typeof typeValue === 'string' && typeValue.includes(',')) {
          // Handle comma-separated values
          where.type = { in: typeValue.split(',').map((t) => t.trim()) };
        } else {
          where.type = typeValue;
        }
      }
      if (query.openedById) {
        where.openedById = query.openedById;
      }
      if (query.guildId) {
        where.guildId = query.guildId;
      }

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      // Debug logging (can be removed in production)
      // fastify.log.info({ where }, 'Where clause');

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            openedBy: {
              select: { discordId: true, discordTag: true, displayName: true },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            assignments: {
              take: 1,
              orderBy: { assignedAt: 'desc' },
            },
          },
        }),
        prisma.ticket.count({ where }),
      ]);

      // Fetch closer usernames for all tickets
      const closedByIds = [...new Set(tickets.map((t) => t.closedBy).filter(Boolean) as string[])];
      
      const closers = closedByIds.length > 0
        ? await prisma.memberRecord.findMany({
            where: { discordId: { in: closedByIds } },
            select: { discordId: true, discordTag: true, displayName: true },
          })
        : [];
      
      const closerMap = new Map(closers.map((c) => [c.discordId, { username: c.discordTag, displayName: c.displayName }]));

      // Add usernames and lastInteraction to each ticket
      const ticketsWithUsernames = tickets.map((ticket) => {
        // Get last interaction from latest message or use updatedAt
        const lastMessage = ticket.messages && ticket.messages.length > 0 ? ticket.messages[0] : null;
        const lastInteraction = lastMessage?.createdAt || ticket.updatedAt;
        
        const closedByInfo = ticket.closedBy ? closerMap.get(ticket.closedBy) : null;
        return {
          ...ticket,
          creatorUsername: ticket.openedBy?.discordTag || null,
          creatorDisplayName: ticket.openedBy?.displayName || null,
          creatorId: ticket.openedBy?.discordId || null, // Keep for backward compatibility
          closedByUsername: closedByInfo?.username || ticket.closedBy || null,
          closedByDisplayName: closedByInfo?.displayName || null,
          closedAt: ticket.closedAt ? new Date(ticket.closedAt).toISOString() : null,
          lastInteraction: lastInteraction ? new Date(lastInteraction).toISOString() : undefined,
        };
      });

      return reply.send({
        tickets: ticketsWithUsernames,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch tickets' });
    }
  });

  // Get ticket by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const ticket = await prisma.ticket.findUnique({
        where: { id: params.id },
        include: {
          openedBy: {
            select: { discordId: true, discordTag: true, displayName: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          logs: {
            orderBy: { createdAt: 'asc' },
          },
          assignments: {
            orderBy: { assignedAt: 'desc' },
          },
          verification: true,
          eventReport: true,
          staffTalk: true,
        },
      });

      if (!ticket) {
        return reply.status(404).send({ error: 'Ticket not found' });
      }

      // Fetch closer username
      const closer = ticket.closedBy
        ? await prisma.memberRecord.findUnique({
            where: { discordId: ticket.closedBy },
            select: { discordTag: true, displayName: true },
          })
        : null;

      return reply.send({
        ...ticket,
        creatorUsername: ticket.openedBy?.discordTag || null,
        creatorDisplayName: ticket.openedBy?.displayName || null,
        creatorId: ticket.openedBy?.discordId || null, // Keep for backward compatibility
        closedByUsername: closer?.discordTag || ticket.closedBy || null,
        closedByDisplayName: closer?.displayName || null,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch ticket' });
    }
  });

  // Get ticket by Discord thread ID
  fastify.get('/discord/:ticketThreadId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketThreadId: string };
      const ticket = await prisma.ticket.findUnique({
        where: { ticketThreadId: params.ticketThreadId },
        include: {
          openedBy: {
            select: { discordId: true, discordTag: true, displayName: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          logs: {
            orderBy: { createdAt: 'asc' },
          },
          assignments: {
            orderBy: { assignedAt: 'desc' },
          },
          verification: true,
          eventReport: true,
          staffTalk: true,
        },
      });

      if (!ticket) {
        return reply.status(404).send({ error: 'Ticket not found' });
      }

      return reply.send({
        ...ticket,
        creatorUsername: ticket.openedBy?.discordTag || null,
        creatorDisplayName: ticket.openedBy?.displayName || null,
        creatorId: ticket.openedBy?.discordId || null, // Keep for backward compatibility
        discordId: ticket.ticketThreadId, // Keep for backward compatibility
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch ticket' });
    }
  });

  // Create ticket
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createTicketSchema.parse(request.body);
      
      // Ticket number is now auto-increment, so we don't need to calculate it
      const ticket = await prisma.ticket.create({
        data: {
          ticketThreadId: body.ticketThreadId,
          guildId: body.guildId,
          type: body.type,
          status: body.status,
          title: body.title,
          openedById: body.openedById,
        },
        include: {
          openedBy: {
            select: { discordId: true, discordTag: true, displayName: true },
          },
          verification: true,
          eventReport: true,
          staffTalk: true,
        },
      });

      return reply.status(201).send({
        ...ticket,
        creatorUsername: ticket.openedBy?.discordTag || null,
        creatorDisplayName: ticket.openedBy?.displayName || null,
        creatorId: ticket.openedBy?.discordId || null, // Keep for backward compatibility
        discordId: ticket.ticketThreadId, // Keep for backward compatibility
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create ticket' });
    }
  });

  // Update ticket
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateTicketSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.status !== undefined) updateData.status = body.status;
      if (body.title !== undefined) updateData.title = body.title;
      if (body.closedAt !== undefined) updateData.closedAt = body.closedAt ? new Date(body.closedAt) : null;
      if (body.closedBy !== undefined) updateData.closedBy = body.closedBy;
      if (body.closeReason !== undefined) updateData.closeReason = body.closeReason;

      const ticket = await prisma.ticket.update({
        where: { id: params.id },
        data: updateData,
        include: {
          openedBy: {
            select: { discordId: true, discordTag: true, displayName: true },
          },
          verification: true,
          eventReport: true,
          staffTalk: true,
        },
      });

      return reply.send({
        ...ticket,
        creatorUsername: ticket.openedBy?.discordTag || null,
        creatorDisplayName: ticket.openedBy?.displayName || null,
        creatorId: ticket.openedBy?.discordId || null, // Keep for backward compatibility
        discordId: ticket.ticketThreadId, // Keep for backward compatibility
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update ticket' });
    }
  });

  // Delete ticket
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.ticket.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete ticket' });
    }
  });
}


