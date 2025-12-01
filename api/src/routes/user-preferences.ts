import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const updatePreferencesSchema = z.object({
  dateFormat: z.enum(['absolute', 'relative']).optional(),
});

export default async function userPreferencesRoutes(fastify: FastifyInstance): Promise<void> {
  // Get user preferences
  fastify.get('/:discordId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { discordId: string };
      const preferences = await prisma.userPreferences.findUnique({
        where: { discordId: params.discordId },
      });

      if (!preferences) {
        // Return default preferences if none exist
        return reply.send({
          discordId: params.discordId,
          dateFormat: 'absolute',
        });
      }

      return reply.send(preferences);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch user preferences' });
    }
  });

  // Update user preferences
  fastify.patch('/:discordId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { discordId: string };
      const body = updatePreferencesSchema.parse(request.body);

      // Ensure member record exists first (required for foreign key)
      await prisma.memberRecord.upsert({
        where: { discordId: params.discordId },
        update: {},
        create: {
          discordId: params.discordId,
          discordTag: `User#${params.discordId.slice(-4)}`, // Temporary tag if member doesn't exist
        },
      });

      // Upsert preferences (create if doesn't exist, update if it does)
      const preferences = await prisma.userPreferences.upsert({
        where: { discordId: params.discordId },
        update: {
          ...(body.dateFormat !== undefined && { dateFormat: body.dateFormat }),
          updatedAt: new Date(),
        },
        create: {
          discordId: params.discordId,
          dateFormat: body.dateFormat || 'absolute',
        },
      });

      return reply.send(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update user preferences' });
    }
  });
}

