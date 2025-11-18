import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createStaffTalkTicketSchema = z.object({
  ticketId: z.string(),
  purpose: z.string().optional().nullable(),
  isPunishmentTicket: z.boolean().default(false),
  targetMemberId: z.string().optional().nullable(),
});

const updateStaffTalkTicketSchema = z.object({
  purpose: z.string().optional().nullable(),
  isPunishmentTicket: z.boolean().optional(),
  targetMemberId: z.string().optional().nullable(),
});

export default async function staffTalkTicketRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all staff talk tickets
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        targetMemberId?: string;
        isPunishmentTicket?: string;
        purpose?: string;
        limit?: string;
        offset?: string;
      };

      const where: Record<string, unknown> = {};
      if (query.targetMemberId) {
        where.targetMemberId = query.targetMemberId;
      }
      if (query.isPunishmentTicket !== undefined) {
        where.isPunishmentTicket = query.isPunishmentTicket === 'true';
      }
      if (query.purpose) {
        where.purpose = query.purpose;
      }

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [staffTalkTickets, total] = await Promise.all([
        prisma.staffTalkTicket.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { ticket: { createdAt: 'desc' } },
          include: {
            ticket: true,
          },
        }),
        prisma.staffTalkTicket.count({ where }),
      ]);

      return reply.send({
        staffTalkTickets,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch staff talk tickets' });
    }
  });

  // Get staff talk ticket by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const staffTalkTicket = await prisma.staffTalkTicket.findUnique({
        where: { id: params.id },
        include: {
          ticket: {
            include: {
              messages: true,
              logs: true,
            },
          },
        },
      });

      if (!staffTalkTicket) {
        return reply.status(404).send({ error: 'Staff talk ticket not found' });
      }

      return reply.send(staffTalkTicket);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch staff talk ticket' });
    }
  });

  // Get staff talk ticket by ticket ID
  fastify.get('/ticket/:ticketId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      const staffTalkTicket = await prisma.staffTalkTicket.findUnique({
        where: { ticketId: params.ticketId },
        include: {
          ticket: {
            include: {
              messages: true,
              logs: true,
            },
          },
        },
      });

      if (!staffTalkTicket) {
        return reply.status(404).send({ error: 'Staff talk ticket not found' });
      }

      return reply.send(staffTalkTicket);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch staff talk ticket' });
    }
  });

  // Create staff talk ticket
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createStaffTalkTicketSchema.parse(request.body);
      const staffTalkTicket = await prisma.staffTalkTicket.create({
        data: body,
        include: {
          ticket: true,
        },
      });

      return reply.status(201).send(staffTalkTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create staff talk ticket' });
    }
  });

  // Update staff talk ticket
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateStaffTalkTicketSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.purpose !== undefined) updateData.purpose = body.purpose;
      if (body.isPunishmentTicket !== undefined) updateData.isPunishmentTicket = body.isPunishmentTicket;
      if (body.targetMemberId !== undefined) updateData.targetMemberId = body.targetMemberId;

      const staffTalkTicket = await prisma.staffTalkTicket.update({
        where: { id: params.id },
        data: updateData,
        include: {
          ticket: true,
        },
      });

      return reply.send(staffTalkTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update staff talk ticket' });
    }
  });

  // Delete staff talk ticket
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.staffTalkTicket.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete staff talk ticket' });
    }
  });
}


