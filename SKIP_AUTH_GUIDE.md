# Bypass Authentication for Local Testing

A temporary development flag has been added to allow testing the dashboard without Discord OAuth setup.

## How to Enable

### Option 1: Using .env file (Recommended)

Add these lines to your `.env` file in the project root:

```env
SKIP_AUTH=true
```

Then restart the dashboard container:
```bash
docker-compose restart dashboard
```

### Option 2: Using Docker Compose Environment

You can also set it directly when starting:
```bash
SKIP_AUTH=true docker-compose up -d dashboard
```

### Option 3: For Local Development (without Docker)

Create a `.env.local` file in the `dashboard/` directory:

```env
SKIP_AUTH=true
NEXT_PUBLIC_SKIP_AUTH=true
NEXT_PUBLIC_API_URL=http://localhost:3000
API_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
```

Then run:
```bash
cd dashboard
npm run dev
```

## What Happens When Enabled

When `SKIP_AUTH=true`:
- ✅ Middleware bypasses authentication checks
- ✅ Mock session is automatically created with:
  - Username: `DevUser`
  - Discord ID: `dev-user-123`
  - No avatar
- ✅ All dashboard pages are accessible without sign-in
- ✅ API queries work normally

## Important Notes

⚠️ **This is for DEVELOPMENT ONLY!**

- **Never** enable this in production
- **Never** commit `SKIP_AUTH=true` to your repository
- The mock session is automatically provided - no sign-in required
- When you're ready to test real authentication, set `SKIP_AUTH=false` or remove it

## Disabling Authentication Bypass

To disable and use real Discord OAuth:

1. Set `SKIP_AUTH=false` in your `.env` file (or remove it)
2. Add your Discord OAuth credentials:
   ```env
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   NEXTAUTH_SECRET=your_random_secret_string
   ```
3. Restart the dashboard:
   ```bash
   docker-compose restart dashboard
   ```

## Testing

Once enabled, visit:
- Dashboard: http://localhost:3001
- You should see "DevUser" in the header
- All pages should be accessible without authentication errors

