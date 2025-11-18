# .env Files You Need to Create

## Summary

You need to create **4 .env files** for the project:

1. **Root `.env`** - For Docker Compose (most important)
2. **`bot/.env`** - For Discord bot (local development)
3. **`api/.env`** - For API service (local development)
4. **`dashboard/.env.local`** - For Next.js dashboard (local development)

---

## 1. Root `.env` (REQUIRED for Docker)

**Location:** Create at project root: `/.env`

**Used by:** Docker Compose to configure all services

```env
# ============================================
# Docker Compose Environment Variables
# ============================================

# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=ticketbot
MYSQL_USER=ticketbot
MYSQL_PASSWORD=ticketbotpassword

# Discord Bot Token (REQUIRED - Get from Discord Developer Portal)
DISCORD_TOKEN=your_discord_bot_token_here

# API Service
PORT=3000
NODE_ENV=development

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**⚠️ IMPORTANT:**

- Replace `your_discord_bot_token_here` with your actual Discord bot token
- Change database passwords to something secure for production

---

## 2. Bot `.env` (For Local Development)

**Location:** Create at: `/bot/.env`

**Used by:** Discord bot when running locally (not in Docker)

```env
# ============================================
# Discord Bot Environment Variables
# ============================================

# Discord Bot Token (REQUIRED)
DISCORD_TOKEN=your_discord_bot_token_here

# API Service URL
# For local development:
API_URL=http://localhost:3000
# For Docker (if bot runs in Docker but API is local):
# API_URL=http://api:3000

# Database Connection (if needed directly)
DATABASE_URL=mysql://ticketbot:ticketbotpassword@localhost:3306/ticketbot

# Environment
NODE_ENV=development
```

---

## 3. API `.env` (For Local Development)

**Location:** Create at: `/api/.env`

**Used by:** API service when running locally (not in Docker)

```env
# ============================================
# API Service Environment Variables
# ============================================

# Database Connection
# For local development:
DATABASE_URL=mysql://ticketbot:ticketbotpassword@localhost:3306/ticketbot
# For Docker:
# DATABASE_URL=mysql://ticketbot:ticketbotpassword@mysql:3306/ticketbot

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (optional)
# CORS_ORIGIN=http://localhost:3001
```

---

## 4. Dashboard `.env.local` (For Local Development)

**Location:** Create at: `/dashboard/.env.local`

**Used by:** Next.js dashboard when running locally (not in Docker)

```env
# ============================================
# Dashboard Environment Variables
# ============================================

# API Service URL
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:3000
# For Docker:
# NEXT_PUBLIC_API_URL=http://api:3000

# Environment
NODE_ENV=development
```

---

## Quick Setup Steps

### Option 1: Using Docker (Recommended)

1. **Create only the root `.env` file** with your Discord token
2. Run: `docker-compose up -d`
3. That's it! Docker handles everything else

### Option 2: Local Development

1. **Create all 4 .env files** listed above
2. Make sure MySQL is running (or use Docker for just MySQL: `docker-compose up mysql -d`)
3. Start services individually:
   - `cd api && npm run dev`
   - `cd bot && npm run dev`
   - `cd dashboard && npm run dev`

---

## Getting Your Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create a new application or select an existing one
3. Go to the "Bot" section in the left sidebar
4. Click "Reset Token" or "Copy" to get your bot token
5. Paste it in both:
   - Root `.env` file (for Docker)
   - `bot/.env` file (for local development)

---

## Security Notes

⚠️ **IMPORTANT:**

- Never commit `.env` files to git (they're already in `.gitignore`)
- Use strong, unique passwords for database in production
- Keep your Discord bot token secret - never share it publicly
- Use different credentials for development and production environments

---

## Verification

After creating your `.env` files:

1. **For Docker:**

   ```bash
   docker-compose config
   ```

   This shows if all environment variables are properly set.

2. **For Local:**
   - Check that MySQL is running: `mysql -u ticketbot -p`
   - Try starting API: `cd api && npm run dev`
   - Try starting bot: `cd bot && npm run dev`

---

## Troubleshooting

- **"DISCORD_TOKEN is required"**: Make sure you've set the token in root `.env` and `bot/.env`
- **Database connection errors**:
  - Check MySQL is running
  - Verify `DATABASE_URL` matches your MySQL credentials
  - For Docker, use `mysql:3306` as host
  - For local, use `localhost:3306`
- **API connection errors**: Verify `API_URL` in bot `.env` matches where API is running
- **CORS errors**: Check `NEXT_PUBLIC_API_URL` in dashboard `.env.local`
