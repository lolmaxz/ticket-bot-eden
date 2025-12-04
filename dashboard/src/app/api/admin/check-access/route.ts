import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const ADMIN_SERVER_ID = "734595073920204940";
const ADMIN_ROLE_IDS = ["735696916255604776", "1114379479381442650"];

// In-memory cache for admin access checks
// Key: userId, Value: { hasAccess: boolean, expiresAt: number }
const adminAccessCache = new Map<string, { hasAccess: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedAccess(userId: string): boolean | null {
  const cached = adminAccessCache.get(userId);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    adminAccessCache.delete(userId);
    return null;
  }

  return cached.hasAccess;
}

function setCachedAccess(userId: string, hasAccess: boolean): void {
  adminAccessCache.set(userId, {
    hasAccess,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // In development mode with SKIP_AUTH, allow access
    if (process.env.SKIP_AUTH === "true") {
      return NextResponse.json({ hasAccess: true, debug: { stage: "skip_auth" } });
    }

    if (!session?.accessToken) {
      return NextResponse.json({ hasAccess: false, debug: { stage: "no_access_token" } }, { status: 401 });
    }

    // Use discordId as cache key (fallback to id if discordId not available)
    const userId = (session.user as { discordId?: string; id?: string })?.discordId || session.user?.id;

    if (userId) {
      // Check cache first
      const cached = getCachedAccess(userId);
      if (cached !== null) {
        return NextResponse.json({ hasAccess: cached, debug: { stage: "cached" } });
      }
    }

    try {
      // Fetch user's guilds (servers) from Discord API
      const guildsResponse = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!guildsResponse.ok) {
        const text = await guildsResponse.text();
        return NextResponse.json(
          {
            hasAccess: false,
            debug: {
              stage: "guilds_fetch_failed",
              status: guildsResponse.status,
              body: text.slice(0, 200),
            },
          },
          { status: 403 }
        );
      }

      const guilds = (await guildsResponse.json()) as Array<{ id: string }>;

      // Check if user is in the admin server
      const isInAdminServer = guilds.some((guild) => guild.id === ADMIN_SERVER_ID);

      if (!isInAdminServer) {
        return NextResponse.json(
          {
            hasAccess: false,
            debug: {
              stage: "not_in_admin_server",
              guildCount: guilds.length,
              guildIdsSample: guilds.slice(0, 5).map((g) => g.id),
            },
          },
          { status: 403 }
        );
      }

      // Fetch user's member info for the admin server to get roles using OAuth2 access token
      // This requires the 'guilds.members.read' scope in the OAuth2 authorization
      const memberResponse = await fetch(`https://discord.com/api/v10/users/@me/guilds/${ADMIN_SERVER_ID}/member`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!memberResponse.ok) {
        const text = await memberResponse.text();
        return NextResponse.json(
          {
            hasAccess: false,
            debug: {
              stage: "member_fetch_failed",
              status: memberResponse.status,
              body: text.slice(0, 200),
            },
          },
          { status: 403 }
        );
      }

      const member = (await memberResponse.json()) as { roles?: string[] };
      const userRoles = member.roles || [];

      // Check if user has any of the admin roles
      const hasAccess = ADMIN_ROLE_IDS.some((roleId) => userRoles.includes(roleId));

      // Cache the result (use same userId from earlier)
      if (userId) {
        setCachedAccess(userId, hasAccess);
      }

      return NextResponse.json({
        hasAccess,
        debug: {
          stage: "roles_checked",
          roles: userRoles,
          requiredRoles: ADMIN_ROLE_IDS,
        },
      });
    } catch (error) {
      console.error("Error checking admin access:", error);
      return NextResponse.json({ hasAccess: false }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in admin access check:", error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
}
