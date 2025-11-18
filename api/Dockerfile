FROM node:20-alpine

WORKDIR /app

# Copy shared Prisma schema (from parent directory context)
COPY shared/prisma ./shared/prisma

# Copy package files
COPY api/package*.json ./

# Install dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY api/ .

# Generate Prisma Client (schema is now at ./shared/prisma/schema.prisma)
RUN npx prisma generate --schema=./shared/prisma/schema.prisma

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]


