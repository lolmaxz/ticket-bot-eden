import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';

export default async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  // Get ticket analytics
  fastify.get('/analytics/tickets', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        period?: string; // 'day', 'week', 'month'
      };

      const period = query.period || 'week';
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'week':
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      // Total tickets in period
      const totalTickets = await prisma.ticket.count({
        where: {
          createdAt: { gte: startDate },
        },
      });

      // Tickets by status
      const ticketsByStatus = await prisma.ticket.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      });

      // Tickets by type
      const ticketsByType = await prisma.ticket.groupBy({
        by: ['type'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      });

      // Closed tickets
      const closedTickets = await prisma.ticket.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['CLOSED', 'ARCHIVED'] },
        },
      });

      // Average time to close (for closed tickets)
      const closedTicketsWithTimes = await prisma.ticket.findMany({
        where: {
          createdAt: { gte: startDate },
          closedAt: { not: null },
        },
        select: {
          createdAt: true,
          closedAt: true,
        },
      });

      const avgTimeToClose = closedTicketsWithTimes.length > 0
        ? closedTicketsWithTimes.reduce((acc, ticket) => {
            const timeToClose = ticket.closedAt!.getTime() - ticket.createdAt.getTime();
            return acc + timeToClose;
          }, 0) / closedTicketsWithTimes.length
        : 0;

      return reply.send({
        period,
        totalTickets,
        closedTickets,
        openTickets: totalTickets - closedTickets,
        ticketsByStatus: ticketsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        ticketsByType: ticketsByType.map((item) => ({
          type: item.type,
          count: item._count,
        })),
        avgTimeToCloseMs: avgTimeToClose,
        avgTimeToCloseHours: avgTimeToClose / (1000 * 60 * 60),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch ticket analytics' });
    }
  });

  // Get staff analytics
  fastify.get('/analytics/staff', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        period?: string; // 'day', 'week', 'month'
      };

      const period = query.period || 'week';
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'week':
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      // Staff ticket assignments
      const staffAssignments = await prisma.ticketAssignment.groupBy({
        by: ['staffId'],
        where: {
          assignedAt: { gte: startDate },
        },
        _count: true,
      });

      // Staff who closed tickets
      const staffClosures = await prisma.ticket.groupBy({
        by: ['closedBy'],
        where: {
          closedAt: { gte: startDate, not: null },
        },
        _count: true,
      });

      // Staff participation (if available)
      const staffParticipation = await prisma.ticketStaffParticipation.groupBy({
        by: ['staffId'],
        where: {
          participatedAt: { gte: startDate },
        },
        _count: true,
      });

      // Get staff usernames
      const staffIds = [
        ...new Set([
          ...staffAssignments.map((s) => s.staffId),
          ...staffClosures.map((s) => s.closedBy).filter((id): id is string => id !== null),
          ...staffParticipation.map((s) => s.staffId),
        ]),
      ];

      const staffMembers = await prisma.memberRecord.findMany({
        where: { discordId: { in: staffIds } },
        select: { discordId: true, discordTag: true },
      });

      const staffMap = new Map(staffMembers.map((s) => [s.discordId, s.discordTag]));

      // Combine all staff activity
      const staffActivity = new Map<string, {
        staffId: string;
        username: string;
        assignments: number;
        closures: number;
        participations: number;
        totalActivity: number;
      }>();

      staffAssignments.forEach((item) => {
        const username = staffMap.get(item.staffId) || item.staffId;
        staffActivity.set(item.staffId, {
          staffId: item.staffId,
          username,
          assignments: item._count,
          closures: 0,
          participations: 0,
          totalActivity: item._count,
        });
      });

      staffClosures.forEach((item) => {
        if (!item.closedBy) return;
        const existing = staffActivity.get(item.closedBy);
        const username = staffMap.get(item.closedBy) || item.closedBy;
        if (existing) {
          existing.closures = item._count;
          existing.totalActivity += item._count;
        } else {
          staffActivity.set(item.closedBy, {
            staffId: item.closedBy,
            username,
            assignments: 0,
            closures: item._count,
            participations: 0,
            totalActivity: item._count,
          });
        }
      });

      staffParticipation.forEach((item) => {
        const existing = staffActivity.get(item.staffId);
        const username = staffMap.get(item.staffId) || item.staffId;
        if (existing) {
          existing.participations = item._count;
          existing.totalActivity += item._count;
        } else {
          staffActivity.set(item.staffId, {
            staffId: item.staffId,
            username,
            assignments: 0,
            closures: 0,
            participations: item._count,
            totalActivity: item._count,
          });
        }
      });

      const staffStats = Array.from(staffActivity.values())
        .sort((a, b) => b.totalActivity - a.totalActivity);

      return reply.send({
        period,
        staffStats,
        totalStaff: staffStats.length,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch staff analytics' });
    }
  });

  // Get verification analytics
  fastify.get('/analytics/verifications', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        period?: string; // 'day', 'week', 'month'
      };

      const period = query.period || 'week';
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'week':
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      // Total verifications
      const totalVerifications = await prisma.verificationTicket.count({
        where: {
          ticket: {
            createdAt: { gte: startDate },
          },
        },
      });

      // Verifications by initial verifier
      const initialVerifierStats = await prisma.verificationTicket.groupBy({
        by: ['initialVerifierId'],
        where: {
          ticket: {
            createdAt: { gte: startDate },
          },
          initialVerifierId: { not: null },
        },
        _count: true,
      });

      // Verifications by final verifier
      const finalVerifierStats = await prisma.verificationTicket.groupBy({
        by: ['finalVerifierId'],
        where: {
          ticket: {
            createdAt: { gte: startDate },
          },
          finalVerifierId: { not: null },
        },
        _count: true,
      });

      // Get verifier usernames
      const verifierIds = [
        ...new Set([
          ...initialVerifierStats.map((v) => v.initialVerifierId).filter((id): id is string => id !== null),
          ...finalVerifierStats.map((v) => v.finalVerifierId).filter((id): id is string => id !== null),
        ]),
      ];

      const verifiers = await prisma.memberRecord.findMany({
        where: { discordId: { in: verifierIds } },
        select: { discordId: true, discordTag: true },
      });

      const verifierMap = new Map(verifiers.map((v) => [v.discordId, v.discordTag]));

      // Combine verifier stats
      const verifierActivity = new Map<string, {
        staffId: string;
        username: string;
        initialVerifications: number;
        finalVerifications: number;
        totalVerifications: number;
      }>();

      initialVerifierStats.forEach((item) => {
        if (!item.initialVerifierId) return;
        const username = verifierMap.get(item.initialVerifierId) || item.initialVerifierId;
        verifierActivity.set(item.initialVerifierId, {
          staffId: item.initialVerifierId,
          username,
          initialVerifications: item._count,
          finalVerifications: 0,
          totalVerifications: item._count,
        });
      });

      finalVerifierStats.forEach((item) => {
        if (!item.finalVerifierId) return;
        const existing = verifierActivity.get(item.finalVerifierId);
        const username = verifierMap.get(item.finalVerifierId) || item.finalVerifierId;
        if (existing) {
          existing.finalVerifications = item._count;
          existing.totalVerifications += item._count;
        } else {
          verifierActivity.set(item.finalVerifierId, {
            staffId: item.finalVerifierId,
            username,
            initialVerifications: 0,
            finalVerifications: item._count,
            totalVerifications: item._count,
          });
        }
      });

      const verifierStats = Array.from(verifierActivity.values())
        .sort((a, b) => b.totalVerifications - a.totalVerifications);

      // Completed verifications
      const completedVerifications = await prisma.verificationTicket.count({
        where: {
          ticket: {
            createdAt: { gte: startDate },
            status: { in: ['CLOSED', 'ARCHIVED'] },
          },
        },
      });

      return reply.send({
        period,
        totalVerifications,
        completedVerifications,
        openVerifications: totalVerifications - completedVerifications,
        verifierStats,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch verification analytics' });
    }
  });

  // Get staff participation for a specific ticket
  fastify.get('/tickets/:ticketId/staff-participation', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as { ticketId: string };
      
      const participations = await prisma.ticketStaffParticipation.findMany({
        where: { ticketId: params.ticketId },
        orderBy: { participatedAt: 'desc' },
      });

      // Get staff usernames
      const staffIds = [...new Set(participations.map((p) => p.staffId))];
      const staffMembers = await prisma.memberRecord.findMany({
        where: { discordId: { in: staffIds } },
        select: { discordId: true, discordTag: true },
      });

      const staffMap = new Map(staffMembers.map((s) => [s.discordId, s.discordTag]));

      const participationsWithUsernames = participations.map((p) => ({
        ...p,
        staffUsername: staffMap.get(p.staffId) || p.staffId,
      }));

      return reply.send({
        participations: participationsWithUsernames,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch staff participation' });
    }
  });
}


