import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createVerificationTicketSchema = z.object({
  ticketId: z.string(),
  verificationType: z.string().default('ID'),
  initialVerifierId: z.string().optional().nullable(),
  finalVerifierId: z.string().optional().nullable(),
  idReceivedAt: z.string().datetime().optional().nullable(),
  initialVerifiedAt: z.string().datetime().optional().nullable(),
  finalVerifiedAt: z.string().datetime().optional().nullable(),
  reminderCount: z.number().default(0),
  lastReminderAt: z.string().datetime().optional().nullable(),
});

const updateVerificationTicketSchema = z.object({
  initialVerifierId: z.string().optional().nullable(),
  finalVerifierId: z.string().optional().nullable(),
  idReceivedAt: z.string().datetime().optional().nullable(),
  initialVerifiedAt: z.string().datetime().optional().nullable(),
  finalVerifiedAt: z.string().datetime().optional().nullable(),
  reminderCount: z.number().optional(),
  lastReminderAt: z.string().datetime().optional().nullable(),
});

export default async function verificationTicketRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all verification tickets
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { limit?: string; offset?: string };

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [verificationTickets, total] = await Promise.all([
        prisma.verificationTicket.findMany({
          take: limit,
          skip: offset,
          orderBy: { ticket: { createdAt: 'desc' } },
          include: {
            ticket: true,
          },
        }),
        prisma.verificationTicket.count(),
      ]);

      return reply.send({
        verificationTickets,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch verification tickets' });
    }
  });

  // Get verification ticket by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const verificationTicket = await prisma.verificationTicket.findUnique({
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

      if (!verificationTicket) {
        return reply.status(404).send({ error: 'Verification ticket not found' });
      }

      return reply.send(verificationTicket);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch verification ticket' });
    }
  });

  // Get verification ticket by ticket ID
  fastify.get('/ticket/:ticketId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      const verificationTicket = await prisma.verificationTicket.findUnique({
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

      if (!verificationTicket) {
        return reply.status(404).send({ error: 'Verification ticket not found' });
      }

      return reply.send(verificationTicket);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch verification ticket' });
    }
  });

  // Create verification ticket
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createVerificationTicketSchema.parse(request.body);
      const verificationTicket = await prisma.verificationTicket.create({
        data: {
          ...body,
          idReceivedAt: body.idReceivedAt ? new Date(body.idReceivedAt) : null,
          initialVerifiedAt: body.initialVerifiedAt ? new Date(body.initialVerifiedAt) : null,
          finalVerifiedAt: body.finalVerifiedAt ? new Date(body.finalVerifiedAt) : null,
          lastReminderAt: body.lastReminderAt ? new Date(body.lastReminderAt) : null,
        },
        include: {
          ticket: true,
        },
      });

      return reply.status(201).send(verificationTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create verification ticket' });
    }
  });

  // Update verification ticket
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateVerificationTicketSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.initialVerifierId !== undefined) updateData.initialVerifierId = body.initialVerifierId;
      if (body.finalVerifierId !== undefined) updateData.finalVerifierId = body.finalVerifierId;
      if (body.idReceivedAt !== undefined) updateData.idReceivedAt = body.idReceivedAt ? new Date(body.idReceivedAt) : null;
      if (body.initialVerifiedAt !== undefined) updateData.initialVerifiedAt = body.initialVerifiedAt ? new Date(body.initialVerifiedAt) : null;
      if (body.finalVerifiedAt !== undefined) updateData.finalVerifiedAt = body.finalVerifiedAt ? new Date(body.finalVerifiedAt) : null;
      if (body.reminderCount !== undefined) updateData.reminderCount = body.reminderCount;
      if (body.lastReminderAt !== undefined) updateData.lastReminderAt = body.lastReminderAt ? new Date(body.lastReminderAt) : null;

      const verificationTicket = await prisma.verificationTicket.update({
        where: { id: params.id },
        data: updateData,
        include: {
          ticket: true,
        },
      });

      return reply.send(verificationTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update verification ticket' });
    }
  });

  // Delete verification ticket
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.verificationTicket.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete verification ticket' });
    }
  });
}


