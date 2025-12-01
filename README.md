# Ticket Bot - Community Management System

A comprehensive Discord ticket management bot with a web dashboard, built with TypeScript, SapphireJS, Next.js, Fastify, and Prisma.

## 🚀 Features

- **Multi-Container Docker Setup**: MySQL database, Discord bot, API service, and web dashboard
- **Ticket Management**: Create, assign, and track tickets with multiple types (Verification, Staff Talk, Event Reports, etc.)
- **Web Dashboard**: Modern, responsive dashboard for managing tickets, warnings, moderation logs, and more
- **Discord OAuth2**: Secure authentication for the web dashboard
- **Mobile Responsive**: Fully optimized for mobile devices with card-based layouts
- **TypeScript**: Strict type checking with no `any` types allowed
- **RESTful API**: Fastify-based API service for all database operations

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Discord Bot Token
- Discord OAuth2 Client ID and Secret (for dashboard authentication)

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:lolmaxz/ticket-bot-eden.git
cd ticket-bot-eden
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# MySQL Database
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_USER=ticketbot
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=ticketbot

# Discord Bot
DISCORD_TOKEN=your_discord_bot_token

# Discord OAuth2 (for Dashboard)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3001

# Optional: Skip authentication for development
SKIP_AUTH=false
```

**Important**: Never commit your `.env` file. Use `.env.example` as a template.

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

This will start all services:
- **MySQL Database** on port 3306
- **API Service** on port 3000
- **Dashboard** on port 3001
- **Discord Bot** (runs in background)

### 4. Initialize Database

The database will be automatically initialized when the API service starts. The Prisma schema is located in `shared/prisma/schema.prisma`.

### 5. Seed Sample Data (Optional)

To populate the database with sample data for testing:

```bash
# Using Docker
docker-compose exec api npm run seed

# Or locally (from api directory)
cd api
npm run seed
```

See `SEED_DATA.md` for more details.

### 5. Access the Dashboard

Open your browser and navigate to:
- **Dashboard**: http://localhost:3001
- **API Health Check**: http://localhost:3000/health

## 📁 Project Structure

```
ticket-bot-eden/
├── api/                 # Fastify API service
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   └── lib/        # Prisma client and utilities
│   └── Dockerfile
├── bot/                 # Discord bot (SapphireJS)
│   ├── src/
│   │   ├── commands/   # Bot commands
│   │   ├── pieces/     # Bot pieces (TicketAPI, etc.)
│   │   └── lib/        # Utilities and components
│   └── Dockerfile
├── dashboard/          # Next.js web dashboard
│   ├── src/
│   │   ├── app/        # Next.js app router pages
│   │   ├── components/ # React components
│   │   └── lib/        # API client and auth
│   └── Dockerfile
├── shared/             # Shared code
│   └── prisma/         # Prisma schema
├── docker-compose.yml  # Docker orchestration
└── .env                # Environment variables (not committed)
```

## 🔧 Development

### Local Development (without Docker)

1. **Install Dependencies**

```bash
# API
cd api && npm install && cd ..

# Bot
cd bot && npm install && cd ..

# Dashboard
cd dashboard && npm install && cd ..

# Shared
cd shared && npm install && cd ..
```

2. **Set up Database**

Make sure MySQL is running and update your `.env` with the correct `DATABASE_URL`.

3. **Generate Prisma Client**

```bash
cd shared
npx prisma generate
```

4. **Run Migrations** (if needed)

```bash
npx prisma migrate dev
```

5. **Start Services**

```bash
# Terminal 1: API
cd api && npm run dev

# Terminal 2: Bot
cd bot && npm run dev

# Terminal 3: Dashboard
cd dashboard && npm run dev
```

### Development with Docker

```bash
# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down
```

## 📚 API Documentation

The API service provides RESTful endpoints for all database operations:

- `GET /api/tickets` - List tickets with filters
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id` - Update ticket
- `GET /api/warnings` - List warnings
- `GET /api/moderation-actions` - List moderation actions
- `GET /api/verification-tickets` - List verification tickets
- And more...

See individual route files in `api/src/routes/` for detailed endpoint documentation.

## 🎨 Dashboard Features

- **Dashboard Overview**: Statistics and ticket overview
- **Ticket Management**: View, filter, and manage all tickets
- **Verifications**: Track verification ticket status
- **Warnings**: View and manage member warnings
- **Moderation Logs**: Review all moderation actions
- **Mod on Call**: Track staff on-call schedules
- **Settings**: User account settings

## 🔐 Authentication

The dashboard uses Discord OAuth2 for authentication. To set up:

1. Go to https://discord.com/developers/applications
2. Create a new application or select an existing one
3. Go to OAuth2 section
4. Add redirect URI: `http://localhost:3001/api/auth/callback/discord`
5. Copy Client ID and Client Secret to your `.env` file

For development, you can set `SKIP_AUTH=true` to bypass authentication (see `SKIP_AUTH_GUIDE.md`).

## 🐳 Docker Volumes

The following volumes are created for data persistence:

- `mysql_data` - MySQL database data
- `api_data` - API service data
- `bot_data` - Bot service data
- `dashboard_data` - Dashboard service data

## 📝 Environment Variables

See `ENV_EXAMPLES.md` for detailed environment variable documentation.

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint
```

## 📖 Additional Documentation

- `TICKET_BOT_REQUIREMENTS.md` - Complete requirements specification
- `QUICK_START.md` - Quick setup guide
- `ENV_FILES_NEEDED.md` - Environment file setup
- `SKIP_AUTH_GUIDE.md` - Development authentication bypass guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Bot not connecting to Discord

- Verify `DISCORD_TOKEN` is correct in `.env`
- Check that the bot has the required intents enabled in Discord Developer Portal:
  - MESSAGE CONTENT INTENT
  - SERVER MEMBERS INTENT
  - PRESENCE INTENT

### Database connection errors

- Ensure MySQL container is healthy: `docker-compose ps`
- Check database credentials in `.env`
- Verify `DATABASE_URL` format: `mysql://user:password@mysql:3306/database`

### Dashboard authentication issues

- Verify Discord OAuth2 credentials are correct
- Check redirect URI matches in Discord Developer Portal
- Ensure `NEXTAUTH_URL` matches your deployment URL
- For development, use `SKIP_AUTH=true` (see `SKIP_AUTH_GUIDE.md`)

### Port conflicts

If ports 3000, 3001, or 3306 are already in use, modify `docker-compose.yml` to use different ports.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using SapphireJS, Next.js, Fastify, and Prisma**
