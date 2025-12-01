import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createModOnCallSchema = z.object({
  staffId: z.string(),
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
  isActive: z.boolean().default(true),
  ticketsClosed: z.number().default(0),
  recordsLogged: z.number().default(0),
});

const updateModOnCallSchema = z.object({
  isActive: z.boolean().optional(),
  ticketsClosed: z.number().optional(),
  recordsLogged: z.number().optional(),
});

export default async function modOnCallRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all mod on call records
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { isActive?: string; limit?: string; offset?: string };

      const where: Record<string, unknown> = {};
      if (query.isActive !== undefined) {
        where.isActive = query.isActive === 'true';
      }

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [records, total] = await Promise.all([
        prisma.modOnCall.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { weekStart: 'desc' },
        }),
        prisma.modOnCall.count({ where }),
      ]);

      // Fetch staff usernames for all staff IDs
      const staffIds = [...new Set(records.map((r) => r.staffId))];
      const staffMembers = await prisma.memberRecord.findMany({
        where: { discordId: { in: staffIds } },
        select: { discordId: true, discordTag: true },
      });
      const staffMap = new Map(staffMembers.map((s) => [s.discordId, s.discordTag]));

      // Add staff usernames to records
      const recordsWithUsernames = records.map((record) => ({
        ...record,
        staffUsername: staffMap.get(record.staffId) || record.staffId,
      }));

      return reply.send({
        records: recordsWithUsernames,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch mod on call records' });
    }
  });

  // Get current active mod on call
  fastify.get('/current', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const current = await prisma.modOnCall.findFirst({
        where: { isActive: true },
        orderBy: { weekStart: 'desc' },
      });

      if (!current) {
        return reply.status(404).send({ error: 'No active mod on call found' });
      }

      // Fetch staff username
      const staffMember = await prisma.memberRecord.findUnique({
        where: { discordId: current.staffId },
        select: { discordTag: true },
      });

      return reply.send({
        ...current,
        staffUsername: staffMember?.discordTag || current.staffId,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch current mod on call' });
    }
  });

  // Get mod on call by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const record = await prisma.modOnCall.findUnique({
        where: { id: params.id },
      });

      if (!record) {
        return reply.status(404).send({ error: 'Mod on call record not found' });
      }

      return reply.send(record);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch mod on call record' });
    }
  });

  // Get mod on call records for a staff member
  fastify.get('/staff/:staffId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { staffId: string };
      const records = await prisma.modOnCall.findMany({
        where: { staffId: params.staffId },
        orderBy: { weekStart: 'desc' },
      });

      return reply.send(records);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch mod on call records' });
    }
  });

  // Create mod on call record
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createModOnCallSchema.parse(request.body);
      const record = await prisma.modOnCall.create({
        data: {
          ...body,
          weekStart: new Date(body.weekStart),
          weekEnd: new Date(body.weekEnd),
        },
      });

      return reply.status(201).send(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create mod on call record' });
    }
  });

  // Update mod on call record
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateModOnCallSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.ticketsClosed !== undefined) updateData.ticketsClosed = body.ticketsClosed;
      if (body.recordsLogged !== undefined) updateData.recordsLogged = body.recordsLogged;

      const record = await prisma.modOnCall.update({
        where: { id: params.id },
        data: updateData,
      });

      return reply.send(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update mod on call record' });
    }
  });

  // Delete mod on call record
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.modOnCall.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete mod on call record' });
    }
  });
}


