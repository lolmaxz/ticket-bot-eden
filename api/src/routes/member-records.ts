import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createMemberRecordSchema = z.object({
  discordId: z.string(),
  discordTag: z.string(),
});

const updateMemberRecordSchema = z.object({
  discordTag: z.string().optional(),
});

export default async function memberRecordRoutes(fastify: FastifyInstance): Promise<void> {
  // Authorization is handled by the Next.js proxy route
  // Get all member records
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { limit?: string; offset?: string; search?: string };

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const where: Record<string, unknown> = {};
      if (query.search) {
        where.OR = [
          { discordId: { contains: query.search } },
          { discordTag: { contains: query.search } },
        ];
      }

      const [members, total] = await Promise.all([
        prisma.memberRecord.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            warnings: {
              take: 5,
              orderBy: { when: 'desc' },
            },
            moderationActions: {
              take: 5,
              orderBy: { when: 'desc' },
            },
          },
        }),
        prisma.memberRecord.count({ where }),
      ]);

      return reply.send({
        members,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch member records' });
    }
  });

  // Get member by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const member = await prisma.memberRecord.findUnique({
        where: { id: params.id },
        include: {
          warnings: {
            orderBy: { when: 'desc' },
          },
          moderationActions: {
            orderBy: { when: 'desc' },
          },
        },
      });

      if (!member) {
        return reply.status(404).send({ error: 'Member record not found' });
      }

      return reply.send(member);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch member record' });
    }
  });

  // Get member by Discord ID
  fastify.get('/discord/:discordId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { discordId: string };
      const member = await prisma.memberRecord.findUnique({
        where: { discordId: params.discordId },
        include: {
          warnings: {
            orderBy: { when: 'desc' },
          },
          moderationActions: {
            orderBy: { when: 'desc' },
          },
        },
      });

      if (!member) {
        return reply.status(404).send({ error: 'Member record not found' });
      }

      return reply.send(member);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch member record' });
    }
  });

  // Create member record
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createMemberRecordSchema.parse(request.body);
      const member = await prisma.memberRecord.create({
        data: body,
      });

      return reply.status(201).send(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create member record' });
    }
  });

  // Update member record
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateMemberRecordSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.discordTag !== undefined) updateData.discordTag = body.discordTag;

      const member = await prisma.memberRecord.update({
        where: { id: params.id },
        data: updateData,
      });

      return reply.send(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update member record' });
    }
  });

  // Delete member record
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.memberRecord.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete member record' });
    }
  });
}


