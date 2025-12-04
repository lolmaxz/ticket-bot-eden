import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createVerificationTicketSchema = z.object({
  ticketId: z.string(),
  initialVerifierId: z.string().optional().nullable(), // MemberRecord ID
  finalVerifierId: z.string().optional().nullable(), // MemberRecord ID
  idReceivedAt: z.string().datetime().optional().nullable(),
  initialVerifiedAt: z.string().datetime().optional().nullable(),
  finalVerifiedAt: z.string().datetime().optional().nullable(),
  reminderCount: z.number().default(0),
  lastReminderAt: z.string().datetime().optional().nullable(),
});

const updateVerificationTicketSchema = z.object({
  initialVerifierId: z.string().optional().nullable(), // MemberRecord ID
  finalVerifierId: z.string().optional().nullable(), // MemberRecord ID
  idReceivedAt: z.string().datetime().optional().nullable(),
  initialVerifiedAt: z.string().datetime().optional().nullable(),
  finalVerifiedAt: z.string().datetime().optional().nullable(),
  reminderCount: z.number().optional(),
  lastReminderAt: z.string().datetime().optional().nullable(),
});

export default async function verificationTicketRoutes(fastify: FastifyInstance): Promise<void> {
  // Authorization is handled by the Next.js proxy route
  // Get all verification tickets
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { 
        limit?: string; 
        offset?: string;
        status?: string | string[];
        'status[]'?: string | string[];
        initialVerifierId?: string; // MemberRecord ID
        openedById?: string; // MemberRecord ID (ticket opener)
        ticketId?: string;
      };

      const limit = query.limit ? parseInt(query.limit, 10) : 50;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;

      // Handle status filter
      const where: Record<string, unknown> = {};
      const statusValue = query['status[]'] || query.status;
      if (statusValue) {
        let statusArray: string[];
        if (Array.isArray(statusValue)) {
          statusArray = statusValue;
        } else if (typeof statusValue === 'string' && statusValue.includes(',')) {
          statusArray = statusValue.split(',').map((s) => s.trim());
        } else {
          statusArray = [statusValue];
        }
        where.ticket = {
          status: { in: statusArray },
        };
      }
      
      // Handle initialVerifierId filter (staff who opened)
      if (query.initialVerifierId) {
        where.initialVerifierId = query.initialVerifierId;
      }
      
      // Handle openedById filter (member who opened ticket)
      if (query.openedById) {
        where.ticket = {
          ...(where.ticket as Record<string, unknown> || {}),
          openedById: query.openedById,
        };
      }
      
      // Handle ticketId filter (specific ticket ID)
      if (query.ticketId) {
        where.ticketId = query.ticketId;
      }

      const [verificationTickets, total] = await Promise.all([
        prisma.verificationTicket.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { ticket: { createdAt: 'desc' } },
          include: {
            initialVerifier: {
              select: { id: true, discordId: true, discordTag: true, displayName: true },
            },
            finalVerifier: {
              select: { id: true, discordId: true, discordTag: true, displayName: true },
            },
            ticket: {
              include: {
                openedBy: {
                  select: { discordId: true, discordTag: true, displayName: true },
                },
                messages: {
                  take: 1,
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        }),
        prisma.verificationTicket.count({ where }),
      ]);

      // Add usernames and lastInteraction to verification tickets
      const verificationTicketsWithUsernames = verificationTickets.map((vt) => {
        // Get last interaction from latest message or use ticket updatedAt
        const lastMessage = vt.ticket.messages && vt.ticket.messages.length > 0 ? vt.ticket.messages[0] : null;
        const lastInteraction = lastMessage?.createdAt || vt.ticket.updatedAt;
        
        return {
          ...vt,
          initialVerifierUsername: vt.initialVerifier?.discordTag || null,
          initialVerifierDisplayName: vt.initialVerifier?.displayName || null,
          finalVerifierUsername: vt.finalVerifier?.discordTag || null,
          finalVerifierDisplayName: vt.finalVerifier?.displayName || null,
          creatorUsername: vt.ticket.openedBy?.discordTag || null,
          creatorDisplayName: vt.ticket.openedBy?.displayName || null,
          creatorId: vt.ticket.openedBy?.discordId || null, // Keep for backward compatibility
          lastInteraction: lastInteraction ? new Date(lastInteraction).toISOString() : undefined,
        };
      });

      return reply.send({
        verificationTickets: verificationTicketsWithUsernames,
        total,
        limit,
        offset,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch verification tickets' });
    }
  });

  // Get verification ticket by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const verificationTicket = await prisma.verificationTicket.findUnique({
        where: { id: params.id },
        include: {
          initialVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          finalVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          ticket: {
            include: {
              openedBy: {
                select: { discordId: true, discordTag: true, displayName: true },
              },
              messages: true,
              logs: true,
            },
          },
        },
      });

      if (!verificationTicket) {
        return reply.status(404).send({ error: 'Verification ticket not found' });
      }

      return reply.send({
        ...verificationTicket,
        creatorUsername: verificationTicket.ticket.openedBy?.discordTag || null,
        creatorDisplayName: verificationTicket.ticket.openedBy?.displayName || null,
        creatorId: verificationTicket.ticket.openedBy?.discordId || null, // Keep for backward compatibility
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch verification ticket' });
    }
  });

  // Get verification ticket by ticket ID
  fastify.get('/ticket/:ticketId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      const verificationTicket = await prisma.verificationTicket.findUnique({
        where: { ticketId: params.ticketId },
        include: {
          initialVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          finalVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          ticket: {
            include: {
              openedBy: {
                select: { discordId: true, discordTag: true, displayName: true },
              },
              messages: true,
              logs: true,
            },
          },
        },
      });

      if (!verificationTicket) {
        return reply.status(404).send({ error: 'Verification ticket not found' });
      }

      return reply.send({
        ...verificationTicket,
        creatorUsername: verificationTicket.ticket.openedBy?.discordTag || null,
        creatorDisplayName: verificationTicket.ticket.openedBy?.displayName || null,
        creatorId: verificationTicket.ticket.openedBy?.discordId || null, // Keep for backward compatibility
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch verification ticket' });
    }
  });

  // Create verification ticket
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = createVerificationTicketSchema.parse(request.body);
      const verificationTicket = await prisma.verificationTicket.create({
        data: {
          ticketId: body.ticketId,
          initialVerifierId: body.initialVerifierId,
          finalVerifierId: body.finalVerifierId,
          idReceivedAt: body.idReceivedAt ? new Date(body.idReceivedAt) : null,
          initialVerifiedAt: body.initialVerifiedAt ? new Date(body.initialVerifiedAt) : null,
          finalVerifiedAt: body.finalVerifiedAt ? new Date(body.finalVerifiedAt) : null,
          reminderCount: body.reminderCount,
          lastReminderAt: body.lastReminderAt ? new Date(body.lastReminderAt) : null,
        },
        include: {
          initialVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          finalVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          ticket: {
            include: {
              openedBy: {
                select: { discordId: true, discordTag: true, displayName: true },
              },
            },
          },
        },
      });

      return reply.status(201).send({
        ...verificationTicket,
        creatorUsername: verificationTicket.ticket.openedBy?.discordTag || null,
        creatorDisplayName: verificationTicket.ticket.openedBy?.displayName || null,
        creatorId: verificationTicket.ticket.openedBy?.discordId || null, // Keep for backward compatibility
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to create verification ticket' });
    }
  });

  // Update verification ticket
  fastify.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      const body = updateVerificationTicketSchema.parse(request.body);

      const updateData: Record<string, unknown> = {};
      if (body.initialVerifierId !== undefined) updateData.initialVerifierId = body.initialVerifierId;
      if (body.finalVerifierId !== undefined) updateData.finalVerifierId = body.finalVerifierId;
      if (body.idReceivedAt !== undefined) updateData.idReceivedAt = body.idReceivedAt ? new Date(body.idReceivedAt) : null;
      if (body.initialVerifiedAt !== undefined) updateData.initialVerifiedAt = body.initialVerifiedAt ? new Date(body.initialVerifiedAt) : null;
      if (body.finalVerifiedAt !== undefined) updateData.finalVerifiedAt = body.finalVerifiedAt ? new Date(body.finalVerifiedAt) : null;
      if (body.reminderCount !== undefined) updateData.reminderCount = body.reminderCount;
      if (body.lastReminderAt !== undefined) updateData.lastReminderAt = body.lastReminderAt ? new Date(body.lastReminderAt) : null;

      const verificationTicket = await prisma.verificationTicket.update({
        where: { id: params.id },
        data: updateData,
        include: {
          initialVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          finalVerifier: {
            select: { id: true, discordId: true, discordTag: true, displayName: true },
          },
          ticket: {
            include: {
              openedBy: {
                select: { discordId: true, discordTag: true, displayName: true },
              },
            },
          },
        },
      });

      return reply.send({
        ...verificationTicket,
        creatorUsername: verificationTicket.ticket.openedBy?.discordTag || null,
        creatorDisplayName: verificationTicket.ticket.openedBy?.displayName || null,
        creatorId: verificationTicket.ticket.openedBy?.discordId || null, // Keep for backward compatibility
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to update verification ticket' });
    }
  });

  // Delete verification ticket
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { id: string };
      await prisma.verificationTicket.delete({
        where: { id: params.id },
      });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete verification ticket' });
    }
  });
}


