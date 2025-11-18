import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createEventReportTicketSchema = z.object({
  ticketId: z.string(),
  eventName: z.string().optional().nullable(),
  eventDate: z.string().datetime().optional().nullable(),
  eventHostId: z.string().optional().nullable(),
  reportedUserId: z.string().optional().nullable(),
  incidentType: z.string().optional().nullable(),
});

const updateEventReportTicketSchema = z.object({
  eventName: z.string().optional().nullable(),
  eventDate: z.string().datetime().optional().nullable(),
  eventHostId: z.string().optional().nullable(),
  reportedUserId: z.string().optional().nullable(),
  incidentType: z.string().optional().nullable(),
});

export default async function eventReportTicketRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all event report tickets
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        eventHostId?: string;
        reportedUserId?: string;
        limit?: string;
        offset?: string;
      };

      const where: Record<string, unknown> = {};
      if (query.eventHostId) {
        where.eventHostId = query.eventHostId;
      }
      if (query.reportedUserId) {
        where.reportedUserId = query.reportedUserId;
      }

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [eventReportTickets, total] = await Promise.all([
        prisma.eventReportTicket.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { ticket: { createdAt: 'desc' } },
          include: {
            ticket: true,
          },
        }),
        prisma.eventReportTicket.count({ where }),
      ]);

      return reply.send({
        eventReportTickets,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch event report tickets' });
    }
  });

  // Get event report ticket by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const eventReportTicket = await prisma.eventReportTicket.findUnique({
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

      if (!eventReportTicket) {
        return reply.status(404).send({ error: 'Event report ticket not found' });
      }

      return reply.send(eventReportTicket);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch event report ticket' });
    }
  });

  // Get event report ticket by ticket ID
  fastify.get('/ticket/:ticketId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      const eventReportTicket = await prisma.eventReportTicket.findUnique({
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

      if (!eventReportTicket) {
        return reply.status(404).send({ error: 'Event report ticket not found' });
      }

      return reply.send(eventReportTicket);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch event report ticket' });
    }
  });

  // Create event report ticket
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createEventReportTicketSchema.parse(request.body);
      const eventReportTicket = await prisma.eventReportTicket.create({
        data: {
          ...body,
          eventDate: body.eventDate ? new Date(body.eventDate) : null,
        },
        include: {
          ticket: true,
        },
      });

      return reply.status(201).send(eventReportTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create event report ticket' });
    }
  });

  // Update event report ticket
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateEventReportTicketSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.eventName !== undefined) updateData.eventName = body.eventName;
      if (body.eventDate !== undefined) updateData.eventDate = body.eventDate ? new Date(body.eventDate) : null;
      if (body.eventHostId !== undefined) updateData.eventHostId = body.eventHostId;
      if (body.reportedUserId !== undefined) updateData.reportedUserId = body.reportedUserId;
      if (body.incidentType !== undefined) updateData.incidentType = body.incidentType;

      const eventReportTicket = await prisma.eventReportTicket.update({
        where: { id: params.id },
        data: updateData,
        include: {
          ticket: true,
        },
      });

      return reply.send(eventReportTicket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update event report ticket' });
    }
  });

  // Delete event report ticket
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.eventReportTicket.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete event report ticket' });
    }
  });
}


