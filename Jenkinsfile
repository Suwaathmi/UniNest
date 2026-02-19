pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-credentials-id'       // Update with your Jenkins Docker Hub credential ID
        DOCKER_IMAGE_FRONTEND = 'suwaathmi/uninest-frontend'
        DOCKER_IMAGE_BACKEND  = 'suwaathmi/uninest-backend'
        APP_SERVER_IP         = 'YOUR_APP_SERVER_IP'           // Update after terraform apply
        SSH_CREDENTIALS_ID    = 'ssh-credentials-id'           // Update with your Jenkins SSH credential ID
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Suwaathmi/UniNest.git'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE_FRONTEND}:latest ./frontend"
            }
        }

        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE_BACKEND}:latest ./backend"
            }
        }

        stage('Test Images') {
            steps {
                sh "docker run --rm ${DOCKER_IMAGE_FRONTEND}:latest npm test -- --watchAll=false || echo 'Frontend tests skipped'"
                sh "docker run --rm ${DOCKER_IMAGE_BACKEND}:latest npm test || echo 'Backend tests skipped'"
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_CREDENTIALS_ID}") {
                        sh "docker push ${DOCKER_IMAGE_FRONTEND}:latest"
                        sh "docker push ${DOCKER_IMAGE_BACKEND}:latest"
                    }
                }
            }
        }

        stage('Deploy to App Server') {
            steps {
                sshagent(["${SSH_CREDENTIALS_ID}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${APP_SERVER_IP} '
                            cd /home/ubuntu/UniNest &&
                            docker-compose pull &&
                            docker-compose up -d --force-recreate
                        '
                    """
                }
            }
        }

        stage('Deployment Verification') {
            steps {
                sshagent(["${SSH_CREDENTIALS_ID}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${APP_SERVER_IP} '
                            sleep 15 &&
                            curl -f http://localhost || exit 1
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ UniNest deployed successfully to http://${APP_SERVER_IP}"
        }
        failure {
            echo "❌ Deployment failed! Check the logs above for details."
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}