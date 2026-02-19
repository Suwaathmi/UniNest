# Application server running UniNest via Docker Compose
resource "aws_instance" "app_server" {
  ami                         = var.ami_id
  instance_type               = var.app_instance_type
  key_name                    = aws_key_pair.uninest_key.key_name
  vpc_security_group_ids      = [aws_security_group.app_sg.id]
  subnet_id                   = data.aws_subnet.default.id
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name    = "UniNest-App-Server"
    Project = "UniNest"
    Role    = "Application"
  }

  user_data = <<-EOF
    #!/bin/bash
    exec > /var/log/app-setup.log 2>&1
    set -e

    echo "=== Starting App Server setup ==="
    apt update -y
    apt upgrade -y

    # Install Docker
    echo "=== Installing Docker ==="
    apt install -y docker.io docker-compose

    # Enable and start Docker
    systemctl enable docker
    systemctl start docker

    # Add ubuntu user to docker group
    usermod -aG docker ubuntu

    # Get the public IP from EC2 metadata
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    echo "=== Public IP: $PUBLIC_IP ==="

    # Create application directories
    echo "=== Creating application directories ==="
    mkdir -p /home/ubuntu/UniNest/nginx
    mkdir -p /home/ubuntu/UniNest/mongo-init
    cd /home/ubuntu/UniNest

    # Create .env file
    echo "=== Creating .env file ==="
    cat > .env << 'ENVEOF'
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
ENVEOF

    # Create nginx/nginx.conf
    echo "=== Creating nginx configuration ==="
    cat > nginx/nginx.conf << 'NGINXEOF'
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
NGINXEOF

    # Create mongo-init/init-db.js
    echo "=== Creating MongoDB init script ==="
    cat > mongo-init/init-db.js << 'MONGOEOF'
db = db.getSiblingDB('myapp');
db.createUser({
  user: 'root',
  pwd: 'example',
  roles: [
    { role: 'readWrite', db: 'myapp' }
  ]
});
MONGOEOF

    # Create docker-compose.yml (uses $PUBLIC_IP for REACT_APP_API_URL)
    echo "=== Creating docker-compose.yml ==="
    cat > docker-compose.yml << COMPOSEEOF
version: '3.8'

services:
  frontend:
    image: ${var.docker_image_frontend}
    ports:
      - "3000:3000"
    environment:
      - CHOKIDAR_USEPOLLING=true
      - REACT_APP_API_URL=http://$PUBLIC_IP:5000
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  backend:
    image: ${var.docker_image_backend}
    ports:
      - "5000:5000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
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
COMPOSEEOF

    # Set ownership
    chown -R ubuntu:ubuntu /home/ubuntu/UniNest

    # Pull images and start services
    echo "=== Pulling Docker images and starting services ==="
    cd /home/ubuntu/UniNest
    sudo -u ubuntu docker-compose pull
    sudo -u ubuntu docker-compose up -d

    echo "=== App Server setup complete ==="
  EOF
}
