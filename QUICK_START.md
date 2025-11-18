# Quick Start Guide

## Step 1: Create Your .env Files

### Option A: Using Docker (Recommended - Easiest)

1. **Copy the root example file:**

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set your Discord token:**

   ```env
   DISCORD_TOKEN=your_actual_discord_bot_token_here
   ```

3. **Optionally change database passwords:**
   ```env
   MYSQL_ROOT_PASSWORD=your_secure_password
   MYSQL_PASSWORD=your_secure_password
   ```

That's it! Docker will handle everything else.

### Option B: Local Development

1. **Copy all example files:**

   ```bash
   cp .env.example .env
   cp bot/.env.example bot/.env
   cp api/.env.example api/.env
   cp dashboard/.env.local.example dashboard/.env.local
   ```

2. **Update each file:**
   - **`.env`**: Set `DISCORD_TOKEN`
   - **`bot/.env`**: Set `DISCORD_TOKEN` and `API_URL`
   - **`api/.env`**: Set `DATABASE_URL` (point to your MySQL)
   - **`dashboard/.env.local`**: Set `NEXT_PUBLIC_API_URL`

## Step 2: Get Your Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create a new application or select an existing one
3. Go to the **"Bot"** section in the left sidebar
4. Click **"Reset Token"** or **"Copy"** to get your bot token
5. Paste it in your `.env` files where `DISCORD_TOKEN` is set

## Step 3: Start the Services

### Using Docker (Easiest)

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec api npm run prisma:migrate

# View logs
docker-compose logs -f
```

### Local Development

```bash
# Terminal 1: Start MySQL (or use Docker for just MySQL)
docker-compose up mysql -d

# Terminal 2: Start API
cd api
npm run dev

# Terminal 3: Start Bot
cd bot
npm run dev

# Terminal 4: Start Dashboard
cd dashboard
npm run dev
```

## Step 4: Verify Everything Works

1. **Check API health:**

   - Open http://localhost:3000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check bot:**

   - Look for "Bot is ready!" in bot logs
   - Bot should appear online in Discord

3. **Check dashboard:**
   - Open http://localhost:3001
   - Should see the dashboard page

## Troubleshooting

### "DISCORD_TOKEN is required"

- Make sure you've set `DISCORD_TOKEN` in `.env` (for Docker) or `bot/.env` (for local)

### Database connection errors

- Check MySQL is running: `docker-compose ps mysql`
- Verify `DATABASE_URL` matches your MySQL credentials
- For Docker, use `mysql:3306` as host
- For local, use `localhost:3306`

### API connection errors

- Verify `API_URL` in `bot/.env` matches where API is running
- Check API is running: `curl http://localhost:3000/health`

### CORS errors

- Check `NEXT_PUBLIC_API_URL` in `dashboard/.env.local`
- Make sure it matches where API is accessible

## Next Steps

- See `TICKET_BOT_REQUIREMENTS.md` for feature requirements
- See `ENV_FILES_NEEDED.md` for detailed environment variable documentation
- Start building your ticket management features!
