import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createTicketAssignmentSchema = z.object({
  ticketId: z.string(),
  staffId: z.string(),
});

export default async function ticketAssignmentRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all assignments for a ticket
  fastify.get('/ticket/:ticketId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      const assignments = await prisma.ticketAssignment.findMany({
        where: { ticketId: params.ticketId },
        orderBy: { assignedAt: 'desc' },
        include: {
          ticket: true,
        },
      });

      return reply.send(assignments);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch assignments' });
    }
  });

  // Get all assignments for a staff member
  fastify.get('/staff/:staffId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { staffId: string };
      const query = request.query as { active?: string };

      const where: Record<string, unknown> = { staffId: params.staffId };
      if (query.active === 'true') {
        where.unassignedAt = null;
      }

      const assignments = await prisma.ticketAssignment.findMany({
        where,
        orderBy: { assignedAt: 'desc' },
        include: {
          ticket: true,
        },
      });

      return reply.send(assignments);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch assignments' });
    }
  });

  // Get assignment by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const assignment = await prisma.ticketAssignment.findUnique({
        where: { id: params.id },
        include: {
          ticket: true,
        },
      });

      if (!assignment) {
        return reply.status(404).send({ error: 'Assignment not found' });
      }

      return reply.send(assignment);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch assignment' });
    }
  });

  // Create assignment
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createTicketAssignmentSchema.parse(request.body);
      const assignment = await prisma.ticketAssignment.create({
        data: body,
        include: {
          ticket: true,
        },
      });

      return reply.status(201).send(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create assignment' });
    }
  });

  // Unassign (update unassignedAt)
  fastify.patch('/:id/unassign', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const assignment = await prisma.ticketAssignment.update({
        where: { id: params.id },
        data: {
          unassignedAt: new Date(),
        },
        include: {
          ticket: true,
        },
      });

      return reply.send(assignment);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to unassign' });
    }
  });

  // Delete assignment
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.ticketAssignment.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete assignment' });
    }
  });
}


