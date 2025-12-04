import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

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
  // Only cache successful access checks, not failures
  // This prevents blocking users who might gain access later
  if (hasAccess) {
    dashboardAccessCache.set(userId, {
      hasAccess,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  } else {
    // Don't cache failures - allow immediate retry
    dashboardAccessCache.delete(userId);
  }
}

/**
 * Check if the current user has dashboard access
 * User must be in the specified server AND have one of the specified roles
 */
export async function checkDashboardAccess(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  // In development mode with SKIP_AUTH, allow access
  if (process.env.SKIP_AUTH === 'true') {
    return true;
  }

  if (!session) {
    console.error('Dashboard access check: No session found');
    return false;
  }

  if (!session.accessToken) {
    console.error('Dashboard access check: No access token in session', {
      hasSession: !!session,
      hasUser: !!session.user,
      userId: session.user?.id,
    });
    return false;
  }

  // Use discordId as cache key (fallback to id if discordId not available)
  const userId = (session.user as { discordId?: string; id?: string })?.discordId || session.user?.id;

  if (userId) {
    // Check cache first
    const cached = getCachedAccess(userId);
    if (cached !== null) {
      return cached;
    }
  }

  try {
    // Fetch user's guilds (servers) from Discord API
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!guildsResponse.ok) {
      // If token is invalid/expired (401), don't cache the failure
      // This allows retry after token refresh
      if (guildsResponse.status === 401) {
        console.warn('Dashboard access check: Discord API returned 401 (token may be expired)');
        // Clear cache to force re-check
        if (userId) {
          dashboardAccessCache.delete(userId);
        }
      } else {
        // For other errors, cache the failure briefly
        if (userId) {
          setCachedAccess(userId, false);
        }
      }
      return false;
    }

    const guilds = (await guildsResponse.json()) as Array<{ id: string }>;

    // Check if user is in the admin server
    const isInAdminServer = guilds.some((guild) => guild.id === ADMIN_SERVER_ID);

    if (!isInAdminServer) {
      if (userId) {
        setCachedAccess(userId, false);
      }
      return false;
    }

    // Fetch user's member info for the admin server to get roles using OAuth2 access token
    const memberResponse = await fetch(`https://discord.com/api/v10/users/@me/guilds/${ADMIN_SERVER_ID}/member`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!memberResponse.ok) {
      // If token is invalid/expired (401), don't cache the failure
      if (memberResponse.status === 401) {
        console.warn('Dashboard access check: Discord API returned 401 when fetching member info (token may be expired)');
        // Clear cache to force re-check
        if (userId) {
          dashboardAccessCache.delete(userId);
        }
      } else {
        // For other errors, cache the failure briefly
        if (userId) {
          setCachedAccess(userId, false);
        }
      }
      return false;
    }

    const member = (await memberResponse.json()) as { roles?: string[] };
    const userRoles = member.roles || [];

    // Check if user has any of the admin roles
    const hasAccess = ADMIN_ROLE_IDS.some((roleId) => userRoles.includes(roleId));

    // Cache the result
    if (userId) {
      setCachedAccess(userId, hasAccess);
    }

    return hasAccess;
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    // Don't cache errors - allow retry
    // This prevents temporary network issues from blocking access
    if (userId) {
      dashboardAccessCache.delete(userId);
    }
    return false;
  }
}

