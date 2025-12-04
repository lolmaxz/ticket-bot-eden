import { FastifyRequest, FastifyReply } from 'fastify';

const ADMIN_SERVER_ID = '734595073920204940';
const ADMIN_ROLE_IDS = ['735696916255604776', '1114379479381442650'];

// In-memory cache for dashboard access checks
// Key: userId, Value: { hasAccess: boolean, expiresAt: number }
const dashboardAccessCache = new Map<string, { hasAccess: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedAccess(userId: string): boolean | null {
  const cached = dashboardAccessCache.get(userId);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    dashboardAccessCache.delete(userId);
    return null;
  }

  return cached.hasAccess;
}

function setCachedAccess(userId: string, hasAccess: boolean): void {
  dashboardAccessCache.set(userId, {
    hasAccess,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function checkDashboardAccess(accessToken: string, userId: string): Promise<boolean> {
  // Check cache first
  const cached = getCachedAccess(userId);
  if (cached !== null) {
    return cached;
  }

  try {
    // Fetch user's guilds (servers) from Discord API
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!guildsResponse.ok) {
      setCachedAccess(userId, false);
      return false;
    }

    const guilds = (await guildsResponse.json()) as Array<{ id: string }>;

    // Check if user is in the admin server
    const isInAdminServer = guilds.some((guild) => guild.id === ADMIN_SERVER_ID);

    if (!isInAdminServer) {
      setCachedAccess(userId, false);
      return false;
    }

    // Fetch user's member info for the admin server to get roles
    const memberResponse = await fetch(`https://discord.com/api/v10/users/@me/guilds/${ADMIN_SERVER_ID}/member`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!memberResponse.ok) {
      setCachedAccess(userId, false);
      return false;
    }

    const member = (await memberResponse.json()) as { roles?: string[] };
    const userRoles = member.roles || [];

    // Check if user has any of the admin roles
    const hasAccess = ADMIN_ROLE_IDS.some((roleId) => userRoles.includes(roleId));

    // Cache the result
    setCachedAccess(userId, hasAccess);

    return hasAccess;
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    setCachedAccess(userId, false);
    return false;
  }
}

/**
 * Fastify hook to verify dashboard access
 * Expects Authorization header with Bearer token (Discord access token)
 * Also expects X-User-Id header with the Discord user ID
 */
export async function verifyDashboardAccess(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip auth check in development
  if (process.env.SKIP_AUTH === 'true') {
    return;
  }

  const authHeader = request.headers.authorization;
  const userId = request.headers['x-user-id'] as string;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  if (!userId) {
    return reply.status(401).send({ error: 'Missing user ID header' });
  }

  const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

  const hasAccess = await checkDashboardAccess(accessToken, userId);

  if (!hasAccess) {
    return reply.status(403).send({ error: 'Access denied. Insufficient permissions.' });
  }
}

