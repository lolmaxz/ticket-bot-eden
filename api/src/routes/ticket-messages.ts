import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createTicketMessageSchema = z.object({
  ticketId: z.string(),
  messageId: z.string(),
  authorId: z.string(),
  content: z.string(),
  attachments: z.union([z.array(z.string()), z.string()]).default([]).transform((val) => (Array.isArray(val) ? val : [val])),
  createdAt: z.string().datetime(),
});

const updateTicketMessageSchema = z.object({
  content: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export default async function ticketMessageRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all messages for a ticket
  fastify.get('/ticket/:ticketId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      const query = request.query as { limit?: string; offset?: string };

      const limit = query.limit ? parseInt(query.limit, 10) : 100;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [messages, total] = await Promise.all([
        prisma.ticketMessage.findMany({
          where: { ticketId: params.ticketId },
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'asc' },
        }),
        prisma.ticketMessage.count({
          where: { ticketId: params.ticketId },
        }),
      ]);

      return reply.send({
        messages,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch messages' });
    }
  });

  // Get message by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const message = await prisma.ticketMessage.findUnique({
        where: { id: params.id },
        include: {
          ticket: true,
        },
      });

      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.send(message);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch message' });
    }
  });

  // Get message by Discord message ID
  fastify.get('/discord/:messageId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { messageId: string };
      const message = await prisma.ticketMessage.findUnique({
        where: { messageId: params.messageId },
        include: {
          ticket: true,
        },
      });

      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.send(message);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch message' });
    }
  });

  // Create message
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createTicketMessageSchema.parse(request.body);
      const message = await prisma.ticketMessage.create({
        data: {
          ...body,
          createdAt: new Date(body.createdAt),
        },
        include: {
          ticket: true,
        },
      });

      return reply.status(201).send(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create message' });
    }
  });

  // Update message
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateTicketMessageSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.content !== undefined) updateData.content = body.content;
      if (body.attachments !== undefined) updateData.attachments = body.attachments;

      const message = await prisma.ticketMessage.update({
        where: { id: params.id },
        data: updateData,
        include: {
          ticket: true,
        },
      });

      return reply.send(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update message' });
    }
  });

  // Delete message
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.ticketMessage.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete message' });
    }
  });
}


