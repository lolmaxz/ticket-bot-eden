# Seeding Database with Sample Data

This guide explains how to populate the database with sample data for testing the dashboard.

## Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Make sure your containers are running
docker-compose up -d

# Run the seed script inside the API container
docker-compose exec api npm run seed
```

### Option 2: Local Development

1. **Make sure your database is running and accessible**

2. **Set your DATABASE_URL in your environment** (or `.env` file):
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/ticketbot
   ```

3. **Navigate to the API directory**:
   ```bash
   cd api
   ```

4. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

5. **Run the seed script**:
   ```bash
   npm run seed
   ```

## What Gets Created

The seed script creates:

- **6 Member Records** (5 regular members + 1 staff member)
- **8 Tickets** (various types: Verification, Staff Talk, Event Report, etc.)
- **2 Verification Tickets** (one in progress, one completed)
- **1 Event Report Ticket**
- **1 Staff Talk Ticket**
- **3 Ticket Messages**
- **3 Ticket Logs**
- **3 Ticket Assignments**
- **4 Warnings** (various types: Warning, Informal Warning, Watchlist, Banned)
- **6 Moderation Actions** (Warning, Timeout, Kick, Ban, Verification Granted, Watchlist Added)
- **2 Mod on Call Records** (current week and last week)

## Resetting Data

The seed script automatically clears existing data before seeding. If you want to keep existing data, comment out the deletion section at the beginning of `shared/scripts/seed.ts`.

## Customizing Data

Edit `shared/scripts/seed.ts` to customize:
- Number of records created
- Specific values for testing
- Different scenarios and edge cases

## Troubleshooting

### "Cannot find module '@prisma/client'"
Make sure you've generated the Prisma client:
```bash
cd shared
npx prisma generate
```

### "Database connection error"
- Verify your `DATABASE_URL` is correct
- Ensure MySQL is running
- Check that the database exists

### "Permission denied"
Make sure you have write permissions to the database and that your MySQL user has the necessary privileges.

