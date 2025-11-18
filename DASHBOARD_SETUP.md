# Dashboard Setup Guide

## Authentication Setup

The dashboard uses Discord OAuth2 for authentication via NextAuth.js.

### 1. Create Discord OAuth Application

1. Go to https://discord.com/developers/applications
2. Create a new application or select an existing one
3. Go to the **"OAuth2"** section
4. Add a redirect URI:
   - For local development: `http://localhost:3001/api/auth/callback/discord`
   - For production: `https://your-domain.com/api/auth/callback/discord`
5. Copy your **Client ID** and **Client Secret**

### 2. Set Environment Variables

Add to your `dashboard/.env.local`:

```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=generate_random_string_here
NEXTAUTH_URL=http://localhost:3001
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Install Dependencies

```bash
cd dashboard
npm install
```

### 4. Run the Dashboard

```bash
npm run dev
```

The dashboard will be available at http://localhost:3001

## Pages Created

- ✅ `/` - Main dashboard with stats and overview
- ✅ `/tickets` - Ticket list with filtering
- ✅ `/tickets/[id]` - Ticket detail page
- ✅ `/auth/signin` - Discord OAuth sign-in page

## Features Implemented

- ✅ Discord OAuth2 authentication
- ✅ Protected routes with middleware
- ✅ Session management
- ✅ API client with React Query
- ✅ Dashboard stats cards
- ✅ Ticket list with filters
- ✅ Ticket detail view
- ✅ Responsive sidebar navigation
- ✅ Loading states
- ✅ Error handling

## Next Steps

1. Set up Discord OAuth (see above)
2. Add more pages:
   - `/verifications` - Verification management
   - `/warnings` - Warning management
   - `/moderation` - Moderation logs
   - `/mod-on-call` - Mod on Call dashboard
3. Implement role-based access control
4. Add real-time updates (WebSocket)
5. Build analytics charts
6. Add export functionality

