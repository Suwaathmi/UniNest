#!/bin/bash

# UniNest EC2 Deployment Setup Script
# This script sets up Docker, Docker Compose, and all necessary configurations

set -e

echo "🚀 Starting UniNest EC2 Setup..."

# STEP 1: Update packages
echo "📦 Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

# STEP 2: Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# STEP 3: Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo apt install -y docker-compose

# STEP 4: Add ubuntu user to docker group
echo "👤 Adding ubuntu to docker group..."
sudo usermod -aG docker ubuntu
newgrp docker

# STEP 5: Create app directory
echo "📁 Creating application directories..."
mkdir -p ~/UniNest
cd ~/UniNest
mkdir -p nginx mongo-init

# STEP 6: Create .env file
echo "⚙️ Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
JWT_SECRET=your-production-secret-key-change-this

# MongoDB Configuration
DB_HOST=mongodb
DB_PORT=27017
DB_NAME=myapp
DB_USER=root
DB_PASS=example

# MongoDB Root Credentials
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=example
EOF

# STEP 7: Create nginx.conf file
echo "⚙️ Creating nginx configuration..."
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# STEP 8: Create mongo-init script
echo "⚙️ Creating MongoDB initialization script..."
cat > mongo-init/init-db.js << 'EOF'
db = db.getSiblingDB('myapp');
db.createUser({
  user: 'root',
  pwd: 'example',
  roles: [
    { role: 'readWrite', db: 'myapp' }
  ]
});
EOF

# STEP 9: Create docker-compose.yml
echo "⚙️ Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    image: suwaathmi/uninest-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - CHOKIDAR_USEPOLLING=true
      - REACT_APP_API_URL=http://backend:5000
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  backend:
    image: suwaathmi/uninest-backend:latest
    ports:
      - "5000:5000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key
      - DB_HOST=mongodb
      - DB_PORT=27017
      - DB_NAME=myapp
      - DB_USER=root
      - DB_PASS=example
    depends_on:
      - mongodb
    networks:
      - app-network
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    container_name: uninest-mongo
    ports:
      - "127.0.0.1:27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=example
      - MONGO_INITDB_DATABASE=myapp
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d:ro
    networks:
      - app-network
    restart: unless-stopped
    command: ["mongod", "--auth"]

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
EOF

# STEP 10: Make script executable
chmod +x mongo-init/init-db.js

echo "✅ All configuration files created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Pull Docker images: docker pull suwaathmi/uninest-frontend:latest && docker pull suwaathmi/uninest-backend:latest"
echo "2. Start services: docker-compose up -d"
echo "3. Check status: docker-compose ps"
echo "4. View logs: docker-compose logs -f"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://54.226.77.47:3000"
echo "   Backend: http://54.226.77.47:5000"
echo "   Nginx: http://54.226.77.47"
echo ""
echo "🚀 UniNest is ready to deploy!"