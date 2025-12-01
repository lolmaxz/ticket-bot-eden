import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import qs from 'qs';
import ticketRoutes from './routes/tickets';
import ticketMessageRoutes from './routes/ticket-messages';
import ticketLogRoutes from './routes/ticket-logs';
import ticketAssignmentRoutes from './routes/ticket-assignments';
import memberRecordRoutes from './routes/member-records';
import warningRoutes from './routes/warnings';
import moderationActionRoutes from './routes/moderation-actions';
import modOnCallRoutes from './routes/mod-on-call';
import verificationTicketRoutes from './routes/verification-tickets';
import eventReportTicketRoutes from './routes/event-report-tickets';
import staffTalkTicketRoutes from './routes/staff-talk-tickets';
import seedRoutes from './routes/seed';
import userPreferencesRoutes from './routes/user-preferences';
import prisma from './lib/prisma';

const fastify = Fastify({
  logger: true,
  querystringParser: (str) => {
    return qs.parse(str, { arrayLimit: Infinity });
  },
});

async function start(): Promise<void> {
  try {
    // Register plugins
    await fastify.register(helmet);
    await fastify.register(cors, {
      origin: true,
    });

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(ticketRoutes, { prefix: '/api/tickets' });
    await fastify.register(ticketMessageRoutes, { prefix: '/api/ticket-messages' });
    await fastify.register(ticketLogRoutes, { prefix: '/api/ticket-logs' });
    await fastify.register(ticketAssignmentRoutes, { prefix: '/api/ticket-assignments' });
    await fastify.register(memberRecordRoutes, { prefix: '/api/member-records' });
    await fastify.register(warningRoutes, { prefix: '/api/warnings' });
    await fastify.register(moderationActionRoutes, { prefix: '/api/moderation-actions' });
    await fastify.register(modOnCallRoutes, { prefix: '/api/mod-on-call' });
    await fastify.register(verificationTicketRoutes, { prefix: '/api/verification-tickets' });
    await fastify.register(eventReportTicketRoutes, { prefix: '/api/event-report-tickets' });
    await fastify.register(staffTalkTicketRoutes, { prefix: '/api/staff-talk-tickets' });
    await fastify.register(seedRoutes, { prefix: '/api' });
    await fastify.register(userPreferencesRoutes, { prefix: '/api/user-preferences' });

    const port = Number(process.env.PORT) || 3000;
    const host = '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await fastify.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

start();

