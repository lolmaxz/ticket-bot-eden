import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const ModerationActionTypeEnum = z.enum([
  'WARNING_ISSUED',
  'INFORMAL_WARNING_ISSUED',
  'TIMEOUT',
  'KICK',
  'BAN',
  'UNBAN',
  'WATCHLIST_ADDED',
  'WATCHLIST_REMOVED',
  'MESSAGE_DELETED',
  'ROLE_ADDED',
  'ROLE_REMOVED',
  'VERIFICATION_REVOKED',
  'VERIFICATION_GRANTED',
  'OTHER',
]);

const createModerationActionSchema = z.object({
  memberId: z.string(),
  staffId: z.string(),
  ticketId: z.string().optional().nullable(),
  warningId: z.string().optional().nullable(),
  actionType: ModerationActionTypeEnum,
  when: z.string().datetime(),
  reason: z.string(),
  duration: z.string().optional().nullable(),
  channelId: z.string().optional().nullable(),
  messageId: z.string().optional().nullable(),
  evidenceUrls: z.union([z.array(z.string()), z.string()]).default([]).transform((val) => (Array.isArray(val) ? val : [val])),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateModerationActionSchema = z.object({
  reason: z.string().optional(),
  duration: z.string().optional().nullable(),
  evidenceUrls: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export default async function moderationActionRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all moderation actions with filters
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        memberId?: string;
        staffId?: string;
        actionType?: string;
        isActive?: string;
        ticketId?: string;
        limit?: string;
        offset?: string;
      };

      const where: Record<string, unknown> = {};

      if (query.memberId) {
        where.memberId = query.memberId;
      }
      if (query.staffId) {
        where.staffId = query.staffId;
      }
      if (query.actionType) {
        where.actionType = query.actionType;
      }
      if (query.isActive !== undefined) {
        where.isActive = query.isActive === 'true';
      }
      if (query.ticketId) {
        where.ticketId = query.ticketId;
      }

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      const [actions, total] = await Promise.all([
        prisma.moderationAction.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { when: 'desc' },
          include: {
            warning: true,
          },
        }),
        prisma.moderationAction.count({ where }),
      ]);

      return reply.send({
        actions,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch moderation actions' });
    }
  });

  // Get moderation action by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const action = await prisma.moderationAction.findUnique({
        where: { id: params.id },
        include: {
          warning: true,
        },
      });

      if (!action) {
        return reply.status(404).send({ error: 'Moderation action not found' });
      }

      return reply.send(action);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch moderation action' });
    }
  });

  // Get moderation actions for a member
  fastify.get('/member/:memberId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { memberId: string };
      const query = request.query as { actionType?: string; isActive?: string; limit?: string };

      const where: Record<string, unknown> = { memberId: params.memberId };

      if (query.actionType) {
        where.actionType = query.actionType;
      }
      if (query.isActive !== undefined) {
        where.isActive = query.isActive === 'true';
      }

      const limit = query.limit ? parseInt(query.limit, 10) : 100;

      const actions = await prisma.moderationAction.findMany({
        where,
        take: limit,
        orderBy: { when: 'desc' },
        include: {
          warning: true,
        },
      });

      return reply.send(actions);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch moderation actions' });
    }
  });

  // Create moderation action
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createModerationActionSchema.parse(request.body);
      const action = await prisma.moderationAction.create({
        data: {
          ...body,
          when: new Date(body.when),
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        },
        include: {
          warning: true,
        },
      });

      return reply.status(201).send(action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create moderation action' });
    }
  });

  // Update moderation action
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateModerationActionSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.reason !== undefined) updateData.reason = body.reason;
      if (body.duration !== undefined) updateData.duration = body.duration;
      if (body.evidenceUrls !== undefined) updateData.evidenceUrls = body.evidenceUrls;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
      if (body.notes !== undefined) updateData.notes = body.notes;

      const action = await prisma.moderationAction.update({
        where: { id: params.id },
        data: updateData,
        include: {
          warning: true,
        },
      });

      return reply.send(action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update moderation action' });
    }
  });

  // Delete moderation action
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.moderationAction.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete moderation action' });
    }
  });
}


