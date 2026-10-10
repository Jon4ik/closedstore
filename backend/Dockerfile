# Use Node.js 20 with Debian
FROM node:20-bookworm-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies with retry and network optimizations
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --prefer-offline --no-audit --no-fund

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# No build - run directly with ts-node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Run migrations, seed, and start application
CMD sh -c "npx prisma migrate deploy && npx prisma db seed && npx ts-node -r tsconfig-paths/register src/main.ts"
