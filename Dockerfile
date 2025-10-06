# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
