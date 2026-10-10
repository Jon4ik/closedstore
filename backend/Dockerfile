# Use Node.js 20 with Debian (not Alpine) for better Prisma compatibility
FROM node:20-bookworm-slim

# Install OpenSSL and other dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/ && echo "Build successful" || (echo "Build failed - dist directory not found" && exit 1)

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start the application
CMD ["sh", "-c", "echo 'Starting application...' && ls -la dist/ && npx prisma migrate deploy && node dist/main.js"]
