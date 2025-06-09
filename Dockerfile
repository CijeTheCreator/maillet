# Multi-stage Dockerfile for Next.js + Flask application

# Stage 1: Build Next.js application
FROM node:18-alpine AS nextjs-builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy Next.js source code
COPY . .
# Remove the maillet-py directory from Next.js context to avoid conflicts
RUN rm -rf maillet-py

# Build Next.js application
RUN pnpm build

# Stage 2: Final runtime image with Python 3.13 and Node.js
FROM python:3.13-slim

# Install Node.js in the Python image
RUN apt-get update && apt-get install -y \
  curl \
  && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs \
  && npm install -g pnpm \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Flask app and install Python dependencies
COPY maillet-py/requirements.txt ./maillet-py/
RUN pip install --no-cache-dir -r maillet-py/requirements.txt

# Copy Flask application
COPY maillet-py/ ./maillet-py/

# Copy built Next.js application from builder stage
COPY --from=nextjs-builder /app/.next ./.next
COPY --from=nextjs-builder /app/node_modules ./node_modules
COPY --from=nextjs-builder /app/package.json ./package.json
COPY --from=nextjs-builder /app/next.config.mjs ./next.config.mjs

# Copy other necessary Next.js files
COPY public ./public
COPY styles ./styles
COPY --from=nextjs-builder /app/components.json ./components.json
COPY --from=nextjs-builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=nextjs-builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=nextjs-builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=nextjs-builder /app/tsconfig.json ./tsconfig.json

# Expose both ports
EXPOSE 3000 5000

# Set Flask environment variables
ENV FLASK_APP=maillet-py/app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Create a startup script to run both applications
RUN echo '#!/bin/bash\n\
  # Start Flask app in background\n\
  cd /app/maillet-py && python -m flask run --host=0.0.0.0 --port=5000 &\n\
  \n\
  # Start Next.js app in foreground\n\
  cd /app && npm start -- --port 3000 --hostname 0.0.0.0\n\
  ' > /app/start.sh && chmod +x /app/start.sh

# Run both applications
CMD ["/app/start.sh"]
