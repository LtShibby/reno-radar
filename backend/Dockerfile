# Use Node.js 18 slim as the base image
FROM node:18-slim

# Puppeteer-specific dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create and use app directory
WORKDIR /app

# Pre-copy just package files to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies — faster, lighter
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# Puppeteer environment tweaks
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production
ENV PORT=3001

# Expose the backend port
EXPOSE 3001

# Start it up
CMD ["node", "server.js"]
