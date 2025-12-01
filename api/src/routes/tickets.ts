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
  discordId: z.string(),
  guildId: z.string(),
  type: TicketTypeEnum,
  status: TicketStatusEnum.default('OPEN'),
  title: z.string(),
  creatorId: z.string(),
  memberId: z.string().optional(),
  assignedStaffId: z.string().optional(),
});

const updateTicketSchema = z.object({
  status: TicketStatusEnum.optional(),
  title: z.string().optional(),
  memberId: z.string().optional().nullable(),
  assignedStaffId: z.string().optional().nullable(),
  closedAt: z.string().datetime().optional().nullable(),
  closedBy: z.string().optional().nullable(),
  closeReason: z.string().optional().nullable(),
});

export default async function ticketRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all tickets with filters
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        status?: string | string[];
        type?: string | string[];
        'type[]'?: string | string[];
        'status[]'?: string | string[];
        assignedStaffId?: string;
        creatorId?: string;
        memberId?: string;
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
      if (query.assignedStaffId) {
        where.assignedStaffId = query.assignedStaffId;
      }
      if (query.creatorId) {
        where.creatorId = query.creatorId;
      }
      if (query.memberId) {
        where.memberId = query.memberId;
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

      // Fetch creator and assigned staff usernames for all tickets
      const creatorIds = [...new Set(tickets.map((t) => t.creatorId))];
      const assignedStaffIds = [...new Set(tickets.map((t) => t.assignedStaffId).filter(Boolean) as string[])];
      
      const [creators, assignedStaff] = await Promise.all([
        prisma.memberRecord.findMany({
          where: { discordId: { in: creatorIds } },
          select: { discordId: true, discordTag: true },
        }),
        assignedStaffIds.length > 0
          ? prisma.memberRecord.findMany({
              where: { discordId: { in: assignedStaffIds } },
              select: { discordId: true, discordTag: true },
            })
          : [],
      ]);
      
      const creatorMap = new Map(creators.map((c) => [c.discordId, c.discordTag]));
      const assignedStaffMap = new Map(assignedStaff.map((s) => [s.discordId, s.discordTag]));

      // Add usernames to each ticket
      const ticketsWithUsernames = tickets.map((ticket) => ({
        ...ticket,
        creatorUsername: creatorMap.get(ticket.creatorId) || ticket.creatorId,
        assignedStaffUsername: ticket.assignedStaffId
          ? assignedStaffMap.get(ticket.assignedStaffId) || ticket.assignedStaffId
          : null,
      }));

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

      // Fetch creator, assigned staff, and closer usernames
      const [creator, assignedStaff, closer] = await Promise.all([
        prisma.memberRecord.findUnique({
          where: { discordId: ticket.creatorId },
          select: { discordTag: true },
        }),
        ticket.assignedStaffId
          ? prisma.memberRecord.findUnique({
              where: { discordId: ticket.assignedStaffId },
              select: { discordTag: true },
            })
          : null,
        ticket.closedBy
          ? prisma.memberRecord.findUnique({
              where: { discordId: ticket.closedBy },
              select: { discordTag: true },
            })
          : null,
      ]);

      return reply.send({
        ...ticket,
        creatorUsername: creator?.discordTag || ticket.creatorId,
        assignedStaffUsername: assignedStaff?.discordTag || ticket.assignedStaffId || null,
        closedByUsername: closer?.discordTag || ticket.closedBy || null,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch ticket' });
    }
  });

  // Get ticket by Discord ID
  fastify.get('/discord/:discordId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { discordId: string };
      const ticket = await prisma.ticket.findUnique({
        where: { discordId: params.discordId },
        include: {
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

      return reply.send(ticket);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch ticket' });
    }
  });

  // Create ticket
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createTicketSchema.parse(request.body);
      
      // Get the next ticket number
      const lastTicket = await prisma.ticket.findFirst({
        orderBy: { ticketNumber: 'desc' },
        select: { ticketNumber: true },
      });
      const nextTicketNumber = (lastTicket?.ticketNumber || 0) + 1;

      const ticket = await prisma.ticket.create({
        data: {
          ...body,
          ticketNumber: nextTicketNumber,
        },
        include: {
          verification: true,
          eventReport: true,
          staffTalk: true,
        },
      });

      // Fetch creator username
      const creator = await prisma.memberRecord.findUnique({
        where: { discordId: ticket.creatorId },
        select: { discordTag: true },
      });

      return reply.status(201).send({
        ...ticket,
        creatorUsername: creator?.discordTag || ticket.creatorId,
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
      if (body.memberId !== undefined) updateData.memberId = body.memberId;
      if (body.assignedStaffId !== undefined) updateData.assignedStaffId = body.assignedStaffId;
      if (body.closedAt !== undefined) updateData.closedAt = body.closedAt ? new Date(body.closedAt) : null;
      if (body.closedBy !== undefined) updateData.closedBy = body.closedBy;
      if (body.closeReason !== undefined) updateData.closeReason = body.closeReason;

      const ticket = await prisma.ticket.update({
        where: { id: params.id },
        data: updateData,
        include: {
          verification: true,
          eventReport: true,
          staffTalk: true,
        },
      });

      return reply.send(ticket);
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


