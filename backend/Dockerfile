# Use Node.js 20 with Debian
FROM node:20-bookworm-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# No build - run directly with ts-node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Run with ts-node (no compilation needed)
CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]
