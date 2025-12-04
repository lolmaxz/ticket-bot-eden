import { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// Development flag to bypass authentication
const SKIP_AUTH = process.env.SKIP_AUTH === "true";

// Validate Discord OAuth credentials
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

if (!SKIP_AUTH && (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET)) {
  console.error("❌ Discord OAuth credentials are missing! Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in your .env file.");
}

// Mock credentials provider for development
const mockProvider = {
  id: "mock",
  name: "Mock",
  type: "credentials",
  credentials: {},
  async authorize() {
    return {
      id: "dev-user-123",
      name: "Dev User",
      email: "dev@localhost",
    };
  },
};

export const authOptions: NextAuthOptions = {
  providers: SKIP_AUTH
    ? [mockProvider as never]
    : [
        DiscordProvider({
          clientId: DISCORD_CLIENT_ID || "",
          clientSecret: DISCORD_CLIENT_SECRET || "",
          authorization: {
            params: {
              scope: "identify email guilds guilds.members.read",
            },
          },
        }),
      ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // In development mode, provide mock data
      if (SKIP_AUTH) {
        return {
          ...token,
          accessToken: "dev-token",
          discordId: "dev-user-123",
          username: "DevUser",
          discriminator: "0",
          avatar: null,
        };
      }

      // On initial sign-in, account and profile are provided
      if (account && profile) {
        token.accessToken = account.access_token;
        // Discord profile type assertion
        const discordProfile = profile as {
          id: string;
          username: string;
          discriminator: string;
          avatar: string | null;
        };
        token.discordId = discordProfile.id;
        token.username = discordProfile.username;
        token.discriminator = discordProfile.discriminator;
        token.avatar = discordProfile.avatar;
      }
      
      // CRITICAL: Preserve accessToken on subsequent requests
      // If account is not present (subsequent requests), ensure accessToken persists
      // This is essential for maintaining authentication across page navigations
      if (!account && !token.accessToken) {
        console.warn('JWT callback: accessToken missing on subsequent request');
      }
      
      // Always return the token with preserved values
      return token;
    },
    async session({ session, token }) {
      if (SKIP_AUTH) {
        // Return mock session in development
        return {
          ...session,
          user: {
            id: "dev-user-123",
            discordId: "dev-user-123",
            username: "DevUser",
            discriminator: "0",
            avatar: null,
            email: "dev@localhost",
            image: null,
          },
          accessToken: "dev-token",
        };
      }

      if (session.user && token) {
        session.user.id = token.discordId as string;
        session.user.discordId = token.discordId as string;
        session.user.username = token.username as string;
        session.user.discriminator = token.discriminator as string;
        session.user.avatar = token.avatar as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/no-permission",
  },
  secret: process.env.NEXTAUTH_SECRET || (SKIP_AUTH ? "dev-secret-key-change-in-production" : undefined),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    discordId?: string;
    username?: string;
    discriminator?: string;
    avatar?: string | null;
  }
}
