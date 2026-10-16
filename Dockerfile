FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests first for efficient layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Expose backend port
EXPOSE 5000

# Set environment defaults
ENV PORT=5000
ENV NODE_ENV=production

# Docker healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the commerce backend service
CMD ["node", "src/server.js"]
