# Environment Variables Setup Guide

This document explains which `.env` files you need to create and what values to set.

## Required .env Files

You need to create **3 main .env files**:

### 1. Root `.env` (for Docker Compose)
**Location:** `/.env` (project root)

This file is used by `docker-compose.yml` to configure all services.

**Required Variables:**
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword          # Change this to a secure password
MYSQL_DATABASE=ticketbot
MYSQL_USER=ticketbot
MYSQL_PASSWORD=ticketbotpassword          # Change this to a secure password

# Discord Bot Token (REQUIRED)
DISCORD_TOKEN=your_discord_bot_token_here # Get from Discord Developer Portal

# API Service
PORT=3000
NODE_ENV=development

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Bot `.env` (for Discord Bot)
**Location:** `/bot/.env`

This file is used when running the bot locally (not in Docker).

**Required Variables:**
```env
# Discord Bot Token (REQUIRED)
DISCORD_TOKEN=your_discord_bot_token_here

# API Service URL
# For local development:
API_URL=http://localhost:3000
# For Docker:
# API_URL=http://api:3000

# Database (if needed directly)
DATABASE_URL=mysql://ticketbot:ticketbotpassword@localhost:3306/ticketbot

# Environment
NODE_ENV=development
```

### 3. API `.env` (for API Service)
**Location:** `/api/.env`

This file is used when running the API locally (not in Docker).

**Required Variables:**
```env
# Database Connection
# For local development:
DATABASE_URL=mysql://ticketbot:ticketbotpassword@localhost:3306/ticketbot
# For Docker:
# DATABASE_URL=mysql://ticketbot:ticketbotpassword@mysql:3306/ticketbot

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Dashboard `.env.local` (for Next.js Dashboard)
**Location:** `/dashboard/.env.local`

This file is used when running the dashboard locally (not in Docker).

**Required Variables:**
```env
# API Service URL
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:3000
# For Docker:
# NEXT_PUBLIC_API_URL=http://api:3000

# Environment
NODE_ENV=development
```

## Quick Setup Steps

1. **Copy the template files:**
   - The `.env` files have been created for you with default values
   - You just need to update the `DISCORD_TOKEN` in the root `.env` and `bot/.env`

2. **Get your Discord Bot Token:**
   - Go to https://discord.com/developers/applications
   - Create a new application or select an existing one
   - Go to "Bot" section
   - Click "Reset Token" or "Copy" to get your bot token
   - Paste it in both `.env` files where `DISCORD_TOKEN` is set

3. **Update Database Passwords (Recommended):**
   - Change `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD` in root `.env` to secure passwords
   - Update `DATABASE_URL` in `api/.env` and `bot/.env` to match

4. **For Docker Usage:**
   - Only the root `.env` file is needed
   - Docker Compose will pass variables to containers automatically

5. **For Local Development:**
   - You need all 4 `.env` files
   - Make sure database URLs point to `localhost:3306` for local MySQL
   - Or use Docker for MySQL only: `docker-compose up mysql -d`

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to git (they're in `.gitignore`)
- Use strong passwords for database in production
- Keep your Discord bot token secret
- Use different passwords for development and production

## Verification

After setting up your `.env` files:

1. **Test Docker setup:**
   ```bash
   docker-compose config
   ```
   This will show you if all environment variables are properly set.

2. **Test local setup:**
   - Start MySQL (or use Docker)
   - Try starting the API: `cd api && npm run dev`
   - Try starting the bot: `cd bot && npm run dev`
   - Try starting the dashboard: `cd dashboard && npm run dev`

## Troubleshooting

- **"DISCORD_TOKEN is required"**: Make sure you've set the token in root `.env` and `bot/.env`
- **Database connection errors**: Check that MySQL is running and `DATABASE_URL` is correct
- **API connection errors**: Verify `API_URL` in bot `.env` matches where API is running
- **CORS errors**: Check `NEXT_PUBLIC_API_URL` in dashboard `.env.local`


