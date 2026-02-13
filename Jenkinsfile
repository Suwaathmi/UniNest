pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'docker-credentials-id' // change this to your Jenkins credential ID
        DOCKER_IMAGE_FRONTEND = 'your-docker-hub-username/frontend-image-name'
        DOCKER_IMAGE_BACKEND = 'your-docker-hub-username/backend-image-name'
        EC2_IP = '54.226.77.47'
        SSH_CREDENTIALS_ID = 'ssh-credentials-id' // change this to your Jenkins SSH credential ID
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
        stage('Test Images') {
            steps {
                script {
                    // Add commands to test images
                    sh 'docker run --rm $DOCKER_IMAGE_FRONTEND test-command'
                    sh 'docker run --rm $DOCKER_IMAGE_BACKEND test-command'
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
        stage('EC2 Deployment') {
            steps {
                script {
                    sshagent(['$SSH_CREDENTIALS_ID']) {
                        sh """
                        ssh ec2-user@$EC2_IP 'cd /path/to/your/app && docker-compose up -d'
                        """
                    }
                }
            }
        }
        stage('Deployment Verification') {
            steps {
                script {
                    sshagent(['$SSH_CREDENTIALS_ID']) {
                        sh """
                        ssh ec2-user@$EC2_IP 'curl -f http://localhost:your-port || exit 1'
                        """
                    }
                }
            }
        }
    }
}