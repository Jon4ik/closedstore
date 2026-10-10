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

# Build the application with detailed output
RUN echo "=== Starting build ===" && \
    npm run build 2>&1 && \
    echo "=== Build completed ===" && \
    ls -la && \
    if [ -d "dist" ]; then \
      echo "=== dist directory exists ===" && \
      ls -la dist/; \
    else \
      echo "=== ERROR: dist directory not found ===" && \
      exit 1; \
    fi

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start the application
CMD ["sh", "-c", "echo 'Starting application...' && ls -la dist/ && npx prisma migrate deploy && node dist/main.js"]
