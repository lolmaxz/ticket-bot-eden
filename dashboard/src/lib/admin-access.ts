import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const ADMIN_SERVER_ID = '734595073920204940';
const ADMIN_ROLE_IDS = ['735696916255604776', '1114379479381442650'];

/**
 * Check if the current user has admin access
 * User must be in the specified server AND have one of the specified roles
 */
export async function checkAdminAccess(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return false;
  }

  // In development mode with SKIP_AUTH, allow access
  if (process.env.SKIP_AUTH === 'true') {
    return true;
  }

  try {
    // Fetch user's guilds (servers) from Discord API
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!guildsResponse.ok) {
      return false;
    }

    const guilds = await guildsResponse.json() as Array<{ id: string }>;
    
    // Check if user is in the admin server
    const isInAdminServer = guilds.some((guild) => guild.id === ADMIN_SERVER_ID);
    
    if (!isInAdminServer) {
      return false;
    }

    // Fetch user's member info for the admin server to get roles
    // Try with bot token first, then fallback to user token
    let memberResponse: Response;
    
    if (process.env.DISCORD_BOT_TOKEN) {
      memberResponse = await fetch(
        `https://discord.com/api/v10/guilds/${ADMIN_SERVER_ID}/members/${session.user.discordId}`,
        {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          },
        }
      );
    } else {
      memberResponse = new Response(null, { status: 401 });
    }

    // If bot token approach failed, try with user token
    if (!memberResponse.ok) {
      const userMemberResponse = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${ADMIN_SERVER_ID}/member`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!userMemberResponse.ok) {
        return false;
      }

      const member = await userMemberResponse.json() as { roles?: string[] };
      const userRoles = member.roles || [];

      // Check if user has any of the admin roles
      return ADMIN_ROLE_IDS.some((roleId) => userRoles.includes(roleId));
    }

    const member = await memberResponse.json() as { roles?: string[] };
    const userRoles = member.roles || [];

    // Check if user has any of the admin roles
    return ADMIN_ROLE_IDS.some((roleId) => userRoles.includes(roleId));
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

