pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'docker-credentials-id'
        DOCKER_IMAGE_FRONTEND = 'suwaathmi/uninest-frontend:latest'
        DOCKER_IMAGE_BACKEND = 'suwaathmi/uninest-backend:latest'
        APP_SERVER_IP = ''  // Fill with app server IP from Terraform output
        SSH_CREDENTIALS_ID = 'ssh-credentials-id'
    }
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/Suwaathmi/UniNest.git'
            }
        }
        stage('Build Frontend Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE_FRONTEND ./frontend'
                }
            }
        }
        stage('Build Backend Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE_BACKEND ./backend'
                }
            }
        }
        stage('Docker Hub Login') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "$DOCKER_CREDENTIALS_ID") {
                        // Login to Docker Hub
                    }
                }
            }
        }
        stage('Push Images') {
            steps {
                script {
                    sh 'docker push $DOCKER_IMAGE_FRONTEND'
                    sh 'docker push $DOCKER_IMAGE_BACKEND'
                }
            }
        }
        stage('Deploy to App Server') {
            steps {
                script {
                    sshagent(["$SSH_CREDENTIALS_ID"]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$APP_SERVER_IP \
                          'cd /home/ubuntu/UniNest && docker-compose pull && docker-compose up -d --force-recreate'
                        """
                    }
                }
            }
        }
        stage('Deployment Verification') {
            steps {
                script {
                    sshagent(["$SSH_CREDENTIALS_ID"]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$APP_SERVER_IP 'curl -f http://localhost || exit 1'
                        """
                    }
                }
            }
        }
    }
    post {
        success {
            echo "Deployment to App Server ($APP_SERVER_IP) succeeded!"
        }
        failure {
            echo "Deployment to App Server ($APP_SERVER_IP) failed."
        }
    }
}