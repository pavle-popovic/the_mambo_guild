# Development Dockerfile for Next.js
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json ./
# Copy lock file if it exists, otherwise npm install will create it
COPY package-lock.json* ./

# Install dependencies (use npm install to handle lock file updates)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Run development server with proper file watching for Docker
CMD ["sh", "-c", "npm run dev"]
