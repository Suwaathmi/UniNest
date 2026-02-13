pipeline {
    agent any 
    environment {
        DOCKER_BUILDKIT=1
        DOCKER_IMAGE_NAME = "your-docker-image-name"
        DOCKER_HUB_REPO = "your-docker-hub-repo"
        EC2_INSTANCE = "your-ec2-instance"
        SSH_KEY = credentials('your-ssh-key-id')
    }
    stages {
        stage('Build Frontend') {
            steps {
                script {
                    try {
                        echo 'Building Frontend...'
                        // Commands to build frontend
                        sh 'cd frontend && npm install && npm run build'
                    } catch (Exception e) {
                        error("Frontend build failed: ${e.message}")
                    }
                }
            }
        }
        stage('Build Backend') {
            steps {
                script {
                    try {
                        echo 'Building Backend...'
                        // Commands to build backend
                        sh 'cd backend && mvn clean package'
                    } catch (Exception e) {
                        error("Backend build failed: ${e.message}")
                    }
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    try {
                        echo 'Running Tests...'
                        // Commands to run tests
                        sh './run-tests.sh'
                    } catch (Exception e) {
                        error("Tests failed: ${e.message}")
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    try {
                        echo 'Building Docker Image...'
                        sh "docker build -t ${DOCKER_IMAGE_NAME} ."
                    } catch (Exception e) {
                        error("Docker build failed: ${e.message}")
                    }
                }
            }
        }
        stage('Push to Docker Hub') {
            steps {
                script {
                    try {
                        echo 'Pushing Docker Image to Docker Hub...'
                        sh "docker login -u your-docker-username -p your-docker-password"
                        sh "docker push ${DOCKER_HUB_REPO}/${DOCKER_IMAGE_NAME}"
                    } catch (Exception e) {
                        error("Pushing to Docker Hub failed: ${e.message}")
                    }
                }
            }
        }
        stage('Deploy to EC2') {
            steps {
                script {
                    try {
                        echo 'Deploying to EC2...'
                        sh "ssh -i ${SSH_KEY} ec2-user@${EC2_INSTANCE} 'cd /path/to/your/app && docker-compose down && docker-compose up -d'"
                    } catch (Exception e) {
                        error("Deployment failed: ${e.message}")
                    }
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            // Any cleanup steps
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }
}