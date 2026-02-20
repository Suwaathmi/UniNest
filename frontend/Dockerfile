# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy only package.json first to leverage caching
COPY package*.json ./

# Install dependencies with peer compatibility + fix ajv mismatch
RUN npm install --legacy-peer-deps && npm install ajv@^8.12.0 ajv-keywords@^5.1.0

# Copy the rest of the source code
COPY . .

# Build the production-ready React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from Stage 1 (React outputs to build/)
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
