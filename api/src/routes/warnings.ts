import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const WarningTypeEnum = z.enum(['WARNING', 'INFORMAL_WARNING', 'WATCHLIST', 'BANNED']);

const createWarningSchema = z.object({
  memberId: z.string(),
  ticketId: z.string().optional().nullable(),
  type: WarningTypeEnum,
  when: z.string().datetime(),
  why: z.string(),
  result: z.string(),
  loggedBy: z.string(),
  evidenceUrls: z.union([z.array(z.string()), z.string()]).default([]).transform((val) => (Array.isArray(val) ? val : [val])),
  isActive: z.boolean().default(true),
  activeUntil: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateWarningSchema = z.object({
  why: z.string().optional(),
  result: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  activeUntil: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export default async function warningRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all warnings with filters
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        memberId?: string;
        type?: string;
        isActive?: string;
        loggedBy?: string;
        limit?: string;
        offset?: string;
      };

      const where: Record<string, unknown> = {};

      if (query.memberId) {
        where.memberId = query.memberId;
      }
      if (query.type) {
        where.type = query.type;
      }
      if (query.isActive !== undefined) {
        where.isActive = query.isActive === 'true';
      }
      if (query.loggedBy) {
        where.loggedBy = query.loggedBy;
      }

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [warnings, total] = await Promise.all([
        prisma.warning.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { when: 'desc' },
          include: {
            member: true,
            moderationAction: true,
          },
        }),
        prisma.warning.count({ where }),
      ]);

      // Fetch staff usernames for all loggedBy IDs
      const loggedByIds = [...new Set(warnings.map((w) => w.loggedBy))];
      const staffMembers = await prisma.memberRecord.findMany({
        where: { discordId: { in: loggedByIds } },
        select: { discordId: true, discordTag: true },
      });
      const staffMap = new Map(staffMembers.map((s) => [s.discordId, s.discordTag]));

      // Add staff usernames to warnings
      const warningsWithUsernames = warnings.map((warning) => ({
        ...warning,
        loggedByUsername: staffMap.get(warning.loggedBy) || warning.loggedBy,
      }));

      return reply.send({
        warnings: warningsWithUsernames,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch warnings' });
    }
  });

  // Get warning by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const warning = await prisma.warning.findUnique({
        where: { id: params.id },
        include: {
          member: true,
          moderationAction: true,
        },
      });

      if (!warning) {
        return reply.status(404).send({ error: 'Warning not found' });
      }

      return reply.send(warning);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch warning' });
    }
  });

  // Get warnings for a member
  fastify.get('/member/:memberId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { memberId: string };
      const query = request.query as { type?: string; isActive?: string };

      const where: Record<string, unknown> = { memberId: params.memberId };

      if (query.type) {
        where.type = query.type;
      }
      if (query.isActive !== undefined) {
        where.isActive = query.isActive === 'true';
      }

      const warnings = await prisma.warning.findMany({
        where,
        orderBy: { when: 'desc' },
        include: {
          moderationAction: true,
        },
      });

      return reply.send(warnings);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch warnings' });
    }
  });

  // Create warning
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createWarningSchema.parse(request.body);
      const warning = await prisma.warning.create({
        data: {
          ...body,
          when: new Date(body.when),
          activeUntil: body.activeUntil ? new Date(body.activeUntil) : null,
        },
        include: {
          member: true,
        },
      });

      return reply.status(201).send(warning);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create warning' });
    }
  });

  // Update warning
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateWarningSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.why !== undefined) updateData.why = body.why;
      if (body.result !== undefined) updateData.result = body.result;
      if (body.evidenceUrls !== undefined) updateData.evidenceUrls = body.evidenceUrls;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.activeUntil !== undefined) updateData.activeUntil = body.activeUntil ? new Date(body.activeUntil) : null;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const warning = await prisma.warning.update({
        where: { id: params.id },
        data: updateData,
        include: {
          member: true,
          moderationAction: true,
        },
      });

      return reply.send(warning);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update warning' });
    }
  });

  // Delete warning
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.warning.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete warning' });
    }
  });
}


