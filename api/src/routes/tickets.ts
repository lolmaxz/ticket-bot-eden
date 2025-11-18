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
        status?: string;
        type?: string;
        assignedStaffId?: string;
        creatorId?: string;
        memberId?: string;
        guildId?: string;
        limit?: string;
        offset?: string;
      };

      const where: Record<string, unknown> = {};

      if (query.status) {
        where.status = query.status;
      }
      if (query.type) {
        where.type = query.type;
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

      return reply.send({
        tickets,
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

      return reply.send(ticket);
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
      const ticket = await prisma.ticket.create({
        data: body,
        include: {
          verification: true,
          eventReport: true,
          staffTalk: true,
        },
      });

      return reply.status(201).send(ticket);
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


