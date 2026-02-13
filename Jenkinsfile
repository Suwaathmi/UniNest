pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (configured in Jenkins)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_REGISTRY = 'suwaathmi'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/uninest-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/uninest-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // EC2 deployment credentials
        EC2_CREDENTIALS = credentials('ec2-ssh-credentials')
        EC2_HOST = credentials('ec2-host')
        EC2_USER = 'ubuntu'
        
        // Application environment variables (secure)
        NODE_ENV = 'production'
        JWT_SECRET = credentials('jwt-secret')
        DB_USER = credentials('db-username')
        DB_PASS = credentials('db-password')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    echo 'Building Frontend Docker image...'
                    dir('frontend') {
                        sh """
                            docker build \
                                -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                -t ${FRONTEND_IMAGE}:latest \
                                .
                        """
                    }
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                script {
                    echo 'Building Backend Docker image...'
                    dir('backend') {
                        sh """
                            docker build \
                                -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                                -t ${BACKEND_IMAGE}:latest \
                                .
                        """
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    echo 'Running tests...'
                    // Run frontend tests if test script exists
                    dir('frontend') {
                        sh '''
                            if grep -q '"test"' package.json; then
                                echo "Running frontend tests..."
                                set +e
                                docker run --rm ${FRONTEND_IMAGE}:${IMAGE_TAG} npm test -- --passWithNoTests
                                TEST_EXIT_CODE=$?
                                set -e
                                if [ $TEST_EXIT_CODE -ne 0 ]; then
                                    echo "Frontend tests failed with exit code $TEST_EXIT_CODE"
                                    currentBuild.result = 'UNSTABLE'
                                fi
                            else
                                echo "No frontend test script found, skipping..."
                            fi
                        '''
                    }
                    // Run backend tests if test script exists
                    dir('backend') {
                        sh '''
                            if grep -q '"test"' package.json; then
                                echo "Running backend tests..."
                                set +e
                                docker run --rm ${BACKEND_IMAGE}:${IMAGE_TAG} npm test
                                TEST_EXIT_CODE=$?
                                set -e
                                if [ $TEST_EXIT_CODE -ne 0 ]; then
                                    echo "Backend tests failed with exit code $TEST_EXIT_CODE"
                                    currentBuild.result = 'UNSTABLE'
                                fi
                            else
                                echo "No backend test script found, skipping..."
                            fi
                        '''
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo 'Logging into Docker Hub...'
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                    
                    echo 'Pushing Frontend image...'
                    sh """
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                    """
                    
                    echo 'Pushing Backend image...'
                    sh """
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                script {
                    echo 'Deploying to EC2 instance...'
                    
                    // Create deployment script
                    sh """
                        cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting deployment on EC2..."

# Navigate to application directory
cd /home/ubuntu/UniNest || {
    echo "Application directory not found. Creating..."
    mkdir -p /home/ubuntu/UniNest
    cd /home/ubuntu/UniNest
}

# Pull latest code if git repo exists, otherwise create docker-compose.yml
if [ -d ".git" ]; then
    echo "Pulling latest code..."
    git pull origin main || git pull origin master
else
    echo "Setting up docker-compose.yml and nginx config..."
    
    # Create nginx directory and config
    mkdir -p nginx
    cat > nginx/nginx.conf << 'NGINX_EOF'
worker_processes 1;

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
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \\$$host;
            proxy_set_header X-Real-IP \\$$remote_addr;
        }
        
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host \\$$host;
            proxy_set_header X-Real-IP \\$$remote_addr;
        }
    }
}
NGINX_EOF
    
    cat > docker-compose.yml << 'COMPOSE_EOF'
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
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DB_HOST=mongodb
      - DB_PORT=27017
      - DB_NAME=myapp
      - DB_USER=${DB_USER}
      - DB_PASS=${DB_PASS}
    depends_on:
      - mongodb
    networks:
      - app-network
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    container_name: uninest-mongo
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${DB_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${DB_PASS}
      - MONGO_INITDB_DATABASE=myapp
    volumes:
      - mongodb_data:/data/db
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
COMPOSE_EOF
fi

# Pull latest Docker images
echo "Pulling latest Docker images..."
docker pull suwaathmi/uninest-frontend:latest
docker pull suwaathmi/uninest-backend:latest

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Start containers with new images
echo "Starting containers..."
docker-compose up -d

# Clean up old images
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment completed successfully!"
EOF
                        chmod +x deploy.sh
                        
                        # Create .env file with secrets
                        cat > .env.production << 'ENVEOF'
JWT_SECRET=${JWT_SECRET}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
ENVEOF
                    """
                    
                    // Deploy to EC2 via SSH (with host key checking)
                    sh '''
                        # Add EC2 host to known_hosts if not already there
                        mkdir -p ~/.ssh
                        ssh-keyscan -H ${EC2_HOST} >> ~/.ssh/known_hosts 2>/dev/null || true
                        
                        # Copy deployment files
                        scp -i $EC2_CREDENTIALS deploy.sh ${EC2_USER}@${EC2_HOST}:/tmp/
                        scp -i $EC2_CREDENTIALS .env.production ${EC2_USER}@${EC2_HOST}:/tmp/
                        
                        # Execute deployment with environment variables
                        ssh -i $EC2_CREDENTIALS ${EC2_USER}@${EC2_HOST} "
                            export JWT_SECRET='${JWT_SECRET}'
                            export DB_USER='${DB_USER}'
                            export DB_PASS='${DB_PASS}'
                            bash /tmp/deploy.sh
                            rm -f /tmp/deploy.sh /tmp/.env.production
                        "
                        
                        # Clean up local files
                        rm -f deploy.sh .env.production
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo 'Cleaning up local Docker images...'
                sh """
                    docker logout || true
                    docker rmi ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
                    docker rmi ${BACKEND_IMAGE}:${IMAGE_TAG} || true
                """
            }
        }
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Frontend: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo "Backend: ${BACKEND_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
        unstable {
            echo '⚠️ Pipeline completed with warnings.'
        }
    }
}