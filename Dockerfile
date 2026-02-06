# Stage 1: Build the React Frontend
FROM node:18-alpine as build
WORKDIR /app

# Copy root package.json (Frontend dependencies)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend (creates /app/dist)
RUN npm run build

# Stage 2: Setup the Node.js Backend
FROM node:18-alpine
WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend/ .

# Copy built frontend assets from Stage 1
# server.js looks for '../dist', so we place it in /app/dist
COPY --from=build /app/dist ../dist

# Environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
