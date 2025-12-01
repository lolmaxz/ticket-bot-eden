import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';

async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.ticketMessage.deleteMany();
  await prisma.ticketLog.deleteMany();
  await prisma.ticketAssignment.deleteMany();
  await prisma.verificationTicket.deleteMany();
  await prisma.eventReportTicket.deleteMany();
  await prisma.staffTalkTicket.deleteMany();
  await prisma.warning.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.modOnCall.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.memberRecord.deleteMany();

  // Create member records
  console.log('👥 Creating member records...');
  const members = await Promise.all([
    prisma.memberRecord.create({
      data: {
        discordId: '123456789012345678',
        discordTag: 'JohnDoe#1234',
      },
    }),
    prisma.memberRecord.create({
      data: {
        discordId: '234567890123456789',
        discordTag: 'JaneSmith#5678',
      },
    }),
    prisma.memberRecord.create({
      data: {
        discordId: '345678901234567890',
        discordTag: 'BobWilson#9012',
      },
    }),
    prisma.memberRecord.create({
      data: {
        discordId: '456789012345678901',
        discordTag: 'AliceBrown#3456',
      },
    }),
    prisma.memberRecord.create({
      data: {
        discordId: '567890123456789012',
        discordTag: 'CharlieDavis#7890',
      },
    }),
  ]);

  // Create staff member
  const staffMember = await prisma.memberRecord.create({
    data: {
      discordId: '999999999999999999',
      discordTag: 'StaffMember#0001',
    },
  });

  // Create tickets
  console.log('🎫 Creating tickets...');
  const guildId = '987654321098765432';
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        discordId: 'ticket-001',
        guildId: guildId,
        type: 'VERIFICATION_ID',
        status: 'OPEN',
        title: 'ID Verification Request',
        creatorId: members[0].discordId,
        memberId: members[0].discordId,
        assignedStaffId: staffMember.discordId,
      },
    }),
    prisma.ticket.create({
      data: {
        discordId: 'ticket-002',
        guildId: guildId,
        type: 'STAFF_TALK',
        status: 'IN_PROGRESS',
        title: 'Need to discuss moderation policy',
        creatorId: members[1].discordId,
        memberId: members[1].id,
        assignedStaffId: staffMember.discordId,
      },
    }),
    prisma.ticket.create({
      data: {
        discordId: 'ticket-003',
        guildId: guildId,
        type: 'EVENT_REPORT',
        status: 'AWAITING_RESPONSE',
        title: 'Weekly event report - March 2024',
        creatorId: members[2].discordId,
        memberId: members[2].id,
      },
    }),
    prisma.ticket.create({
      data: {
        discordId: 'ticket-004',
        guildId: guildId,
        type: 'UNSOLICITED_DM',
        status: 'CLOSED',
        title: 'Received unsolicited DM from user',
        creatorId: members[3].discordId,
        memberId: '111111111111111111',
        assignedStaffId: staffMember.discordId,
        closedAt: new Date('2024-11-10'),
        closedBy: staffMember.discordId,
        closeReason: 'Issue resolved',
      },
    }),
    prisma.ticket.create({
      data: {
        discordId: 'ticket-005',
        guildId: guildId,
        type: 'FRIEND_REQUEST',
        status: 'OPEN',
        title: 'Friend request from unknown user',
        creatorId: members[4].discordId,
        memberId: members[4].id,
      },
    }),
    prisma.ticket.create({
      data: {
        discordId: 'ticket-006',
        guildId: guildId,
        type: 'DRAMA',
        status: 'IN_PROGRESS',
        title: 'Community drama report',
        creatorId: members[0].discordId,
        memberId: members[1].id,
        assignedStaffId: staffMember.discordId,
      },
    }),
    prisma.ticket.create({
      data: {
        discordId: 'ticket-007',
        guildId: guildId,
        type: 'OTHER',
        status: 'OPEN',
        title: 'General inquiry about server rules',
        creatorId: members[2].discordId,
        memberId: members[2].id,
      },
    }),
    prisma.ticket.create({
      data: {
        discordId: 'ticket-008',
        guildId: guildId,
        type: 'VERIFICATION_ID',
        status: 'CLOSED',
        title: 'ID Verification - Completed',
        creatorId: members[3].discordId,
        memberId: members[3].id,
        assignedStaffId: staffMember.discordId,
        closedAt: new Date('2024-11-15'),
        closedBy: staffMember.discordId,
        closeReason: 'Verification successful',
      },
    }),
  ]);

  // Create verification tickets
  console.log('🆔 Creating verification tickets...');
  await Promise.all([
    prisma.verificationTicket.create({
      data: {
        ticketId: tickets[0].id,
        verificationType: 'ID',
        initialVerifierId: staffMember.discordId,
        idReceivedAt: new Date('2024-11-16'),
        initialVerifiedAt: new Date('2024-11-17'),
        reminderCount: 1,
        lastReminderAt: new Date('2024-11-16'),
      },
    }),
    prisma.verificationTicket.create({
      data: {
        ticketId: tickets[7].id,
        verificationType: 'ID',
        initialVerifierId: staffMember.discordId,
        finalVerifierId: staffMember.discordId,
        idReceivedAt: new Date('2024-11-10'),
        initialVerifiedAt: new Date('2024-11-11'),
        finalVerifiedAt: new Date('2024-11-12'),
        reminderCount: 0,
      },
    }),
  ]);

  // Create event report tickets
  console.log('📅 Creating event report tickets...');
  await prisma.eventReportTicket.create({
    data: {
      ticketId: tickets[2].id,
      eventName: 'Weekly Community Meeting',
      eventDate: new Date('2024-11-20'),
    },
  });

  // Create staff talk tickets
  console.log('💬 Creating staff talk tickets...');
  await prisma.staffTalkTicket.create({
    data: {
      ticketId: tickets[1].id,
      purpose: 'investigation',
      targetMemberId: members[1].discordId,
    },
  });

  // Create ticket messages
  console.log('💬 Creating ticket messages...');
  await Promise.all([
    prisma.ticketMessage.create({
      data: {
        ticketId: tickets[0].id,
        authorId: members[0].discordId,
        content: 'Hello, I would like to verify my ID. Here is my information.',
        messageId: 'msg-001',
        attachments: [] as never,
        createdAt: new Date('2024-11-16T10:00:00'),
      },
    }),
    prisma.ticketMessage.create({
      data: {
        ticketId: tickets[0].id,
        authorId: staffMember.discordId,
        content: 'Thank you for submitting. We will review your information shortly.',
        messageId: 'msg-002',
        attachments: [] as never,
        createdAt: new Date('2024-11-16T10:05:00'),
      },
    }),
    prisma.ticketMessage.create({
      data: {
        ticketId: tickets[1].id,
        authorId: members[1].discordId,
        content: 'I need to discuss the new moderation policy with the team.',
        messageId: 'msg-003',
        attachments: [] as never,
        createdAt: new Date('2024-11-17T14:00:00'),
      },
    }),
  ]);

  // Create ticket logs
  console.log('📝 Creating ticket logs...');
  await Promise.all([
    prisma.ticketLog.create({
      data: {
        ticketId: tickets[0].id,
        action: 'TICKET_CREATED',
        staffId: members[0].discordId,
        details: { note: 'Ticket created by user' } as never,
      },
    }),
    prisma.ticketLog.create({
      data: {
        ticketId: tickets[0].id,
        action: 'TICKET_ASSIGNED',
        staffId: staffMember.discordId,
        details: { assignedTo: staffMember.discordId } as never,
      },
    }),
    prisma.ticketLog.create({
      data: {
        ticketId: tickets[4].id,
        action: 'STATUS_CHANGED',
        staffId: staffMember.discordId,
        details: { oldStatus: 'OPEN', newStatus: 'IN_PROGRESS' } as never,
      },
    }),
  ]);

  // Create ticket assignments
  console.log('👤 Creating ticket assignments...');
  await Promise.all([
    prisma.ticketAssignment.create({
      data: {
        ticketId: tickets[0].id,
        staffId: staffMember.discordId,
        assignedAt: new Date('2024-11-16'),
      },
    }),
    prisma.ticketAssignment.create({
      data: {
        ticketId: tickets[1].id,
        staffId: staffMember.discordId,
        assignedAt: new Date('2024-11-17'),
      },
    }),
    prisma.ticketAssignment.create({
      data: {
        ticketId: tickets[3].id,
        staffId: staffMember.discordId,
        assignedAt: new Date('2024-11-10'),
        unassignedAt: new Date('2024-11-10'),
      },
    }),
  ]);

  // Create warnings
  console.log('⚠️ Creating warnings...');
  await Promise.all([
    prisma.warning.create({
      data: {
        memberId: members[0].id,
        type: 'WARNING',
        why: 'Inappropriate behavior in general chat',
        result: 'User warned and reminded of server rules',
        when: new Date('2024-11-01'),
        loggedBy: staffMember.discordId,
        isActive: true,
        evidenceUrls: ['https://example.com/evidence1.png'] as never,
      },
    }),
    prisma.warning.create({
      data: {
        memberId: members[1].id,
        type: 'INFORMAL_WARNING',
        why: 'Minor rule violation',
        result: 'Informal warning issued',
        when: new Date('2024-11-05'),
        loggedBy: staffMember.discordId,
        isActive: true,
        evidenceUrls: [] as never,
      },
    }),
    prisma.warning.create({
      data: {
        memberId: members[2].id,
        type: 'WATCHLIST',
        why: 'Pattern of concerning behavior',
        result: 'Added to watchlist for monitoring',
        when: new Date('2024-10-20'),
        loggedBy: staffMember.discordId,
        isActive: true,
        evidenceUrls: ['https://example.com/evidence2.png', 'https://example.com/evidence3.png'] as never,
      },
    }),
    prisma.warning.create({
      data: {
        memberId: members[0].id,
        type: 'BANNED',
        why: 'Repeated violations after warnings',
        result: 'User banned from server',
        when: new Date('2024-11-10'),
        loggedBy: staffMember.discordId,
        isActive: false,
        evidenceUrls: [] as never,
      },
    }),
  ]);

  // Create moderation actions
  console.log('🛡️ Creating moderation actions...');
  await Promise.all([
    prisma.moderationAction.create({
      data: {
        memberId: members[0].id,
        staffId: staffMember.discordId,
        actionType: 'WARNING_ISSUED',
        reason: 'Inappropriate behavior',
        when: new Date('2024-11-01'),
        isActive: true,
        evidenceUrls: ['https://example.com/mod-evidence1.png'] as never,
      },
    }),
    prisma.moderationAction.create({
      data: {
        memberId: members[1].id,
        staffId: staffMember.discordId,
        actionType: 'TIMEOUT',
        reason: 'Spam in multiple channels',
        when: new Date('2024-11-08'),
        duration: '7 days',
        isActive: true,
        evidenceUrls: [] as never,
      },
    }),
    prisma.moderationAction.create({
      data: {
        memberId: members[2].id,
        staffId: staffMember.discordId,
        actionType: 'KICK',
        reason: 'Violation of server rules',
        when: new Date('2024-10-25'),
        isActive: false,
        evidenceUrls: ['https://example.com/mod-evidence2.png'] as never,
      },
    }),
    prisma.moderationAction.create({
      data: {
        memberId: members[0].id,
        staffId: staffMember.discordId,
        actionType: 'BAN',
        reason: 'Repeated violations',
        when: new Date('2024-11-10'),
        duration: 'Permanent',
        isActive: true,
        evidenceUrls: [] as never,
      },
    }),
    prisma.moderationAction.create({
      data: {
        memberId: members[3].id,
        staffId: staffMember.discordId,
        actionType: 'VERIFICATION_GRANTED',
        reason: 'ID verification successful',
        when: new Date('2024-11-12'),
        isActive: true,
        evidenceUrls: [] as never,
      },
    }),
    prisma.moderationAction.create({
      data: {
        memberId: members[4].id,
        staffId: staffMember.discordId,
        actionType: 'WATCHLIST_ADDED',
        reason: 'Monitoring for potential issues',
        when: new Date('2024-11-14'),
        isActive: true,
        evidenceUrls: [] as never,
      },
    }),
  ]);

  // Create mod on call records
  console.log('📞 Creating mod on call records...');
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  await Promise.all([
    prisma.modOnCall.create({
      data: {
        staffId: staffMember.discordId,
        weekStart: currentWeekStart,
        weekEnd: currentWeekEnd,
        ticketsClosed: 5,
        recordsLogged: 3,
        isActive: true,
      },
    }),
    prisma.modOnCall.create({
      data: {
        staffId: staffMember.discordId,
        weekStart: lastWeekStart,
        weekEnd: lastWeekEnd,
        ticketsClosed: 8,
        recordsLogged: 5,
        isActive: false,
      },
    }),
  ]);

  console.log('✅ Database seeding completed!');
}

export default async function seedRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/seed', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      await seedDatabase();
      return reply.send({
        success: true,
        message: 'Database seeded successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to seed database',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

