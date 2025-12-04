import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';

export default async function discordUserRoutes(fastify: FastifyInstance): Promise<void> {
  // Get Discord user profile data (avatar, banner, accentColor)
  fastify.get('/:discordId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { discordId: string };
      
      // Get member record to get discordTag
      const member = await prisma.memberRecord.findUnique({
        where: { discordId: params.discordId },
      });

      if (!member) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // For now, we'll return basic data
      // TODO: Integrate with Discord bot to fetch accentColor, banner, and avatar
      // The bot can fetch these using: user.accentColor, user.banner, user.displayAvatarURL()
      // For now, we'll use default values and construct avatar URL
      
      // Get username and discriminator
      const usernameParts = member.discordTag.split('#');
      const username = usernameParts[0];
      const discriminator = usernameParts[1] || '0';
      
      // Use stored avatar URL or default
      const avatarUrl = member.avatarUrl || `https://cdn.discordapp.com/embed/avatars/${parseInt(discriminator) % 5}.png`;
      
      // Use stored accent color or default
      const accentColor = member.accentColor || 0x5865F2; // Discord's blurple
      
      // Use stored banner or null
      const bannerUrl = member.bannerUrl || null;

      return reply.send({
        discordId: params.discordId,
        username,
        discriminator,
        avatarUrl,
        bannerUrl,
        accentColor,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch Discord user data' });
    }
  });
}

