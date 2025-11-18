# Environment Variable Examples

Copy these examples to create your `.env` files. Each section shows what to put in each file.

## 1. Root `.env` (For Docker)

**Location:** Create at project root: `/.env`

```env
# ============================================
# Ticket Bot - Environment Variables
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

---

## 2. Bot `.env` (For Local Development)

**Location:** Create at: `/bot/.env`

```env
# ============================================
# Discord Bot Environment Variables
# ============================================

# Discord Bot Token (REQUIRED)
DISCORD_TOKEN=your_discord_bot_token_here

# API Service URL
# For local development:
API_URL=http://localhost:3000
# For Docker:
# API_URL=http://api:3000

# Database Connection (if needed directly)
DATABASE_URL=mysql://ticketbot:ticketbotpassword@localhost:3306/ticketbot

# Environment
NODE_ENV=development
```

---

## 3. API `.env` (For Local Development)

**Location:** Create at: `/api/.env`

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

**Note:** Next.js uses `.env.local` (not `.env`)

```env
# ============================================
# Dashboard Environment Variables
# ============================================

# API Service URL
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:3000
# For Docker:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

---

## Quick Setup Commands

### For Docker (Recommended):

```bash
# Create root .env file
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=ticketbot
MYSQL_USER=ticketbot
MYSQL_PASSWORD=ticketbotpassword
DISCORD_TOKEN=your_discord_bot_token_here
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

# Edit and add your Discord token
# Then run: docker-compose up -d
```

### For Local Development:

```bash
# Create bot .env
cat > bot/.env << 'EOF'
DISCORD_TOKEN=your_discord_bot_token_here
API_URL=http://localhost:3000
DATABASE_URL=mysql://ticketbot:ticketbotpassword@localhost:3306/ticketbot
NODE_ENV=development
EOF

# Create api .env
cat > api/.env << 'EOF'
DATABASE_URL=mysql://ticketbot:ticketbotpassword@localhost:3306/ticketbot
PORT=3000
NODE_ENV=development
EOF

# Create dashboard .env.local
cat > dashboard/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
EOF
```

---

## Getting Your Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create a new application or select an existing one
3. Go to the **"Bot"** section in the left sidebar
4. Click **"Reset Token"** or **"Copy"** to get your bot token
5. Replace `your_discord_bot_token_here` in your `.env` files

---

## Security Reminders

⚠️ **IMPORTANT:**
- Never commit `.env` files to git (they're in `.gitignore`)
- Change database passwords to something secure
- Keep your Discord bot token secret
- Use different credentials for production

