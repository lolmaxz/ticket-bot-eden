import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createTicketLogSchema = z.object({
  ticketId: z.string(),
  action: z.string(),
  staffId: z.string(),
  details: z.record(z.unknown()).optional().nullable(),
});

export default async function ticketLogRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all logs for a ticket
  fastify.get('/ticket/:ticketId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      const query = request.query as { limit?: string; offset?: string };

      const limit = query.limit ? parseInt(query.limit, 10) : 100;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [logs, total] = await Promise.all([
        prisma.ticketLog.findMany({
          where: { ticketId: params.ticketId },
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.ticketLog.count({
          where: { ticketId: params.ticketId },
        }),
      ]);

      return reply.send({
        logs,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch logs' });
    }
  });

  // Get log by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const log = await prisma.ticketLog.findUnique({
        where: { id: params.id },
        include: {
          ticket: true,
        },
      });

      if (!log) {
        return reply.status(404).send({ error: 'Log not found' });
      }

      return reply.send(log);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch log' });
    }
  });

  // Create log
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createTicketLogSchema.parse(request.body);
      const log = await prisma.ticketLog.create({
        data: {
          ticketId: body.ticketId,
          action: body.action,
          staffId: body.staffId,
          details: body.details ? (body.details as never) : undefined,
        },
        include: {
          ticket: true,
        },
      });

      return reply.status(201).send(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create log' });
    }
  });

  // Delete log
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.ticketLog.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete log' });
    }
  });
}


