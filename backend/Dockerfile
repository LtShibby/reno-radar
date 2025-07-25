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

# Copy app files
COPY . .

# Install dependencies
RUN npm install

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# Puppeteer expects Chromium at this path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expose the port your app listens on (default: 3001)
EXPOSE 3001

# Run the app
CMD ["node", "server.js"] 