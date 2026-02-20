pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'docker-credentials-id'
        DOCKER_IMAGE_FRONTEND = 'suwaathmi/uninest-frontend:latest'
        DOCKER_IMAGE_BACKEND  = 'suwaathmi/uninest-backend:latest'
        EC2_IP = 'YOUR_ELASTIC_IP'   // Replace with Elastic IP, not dynamic
        SSH_CREDENTIALS_ID = 'ssh-credentials-id'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Suwaathmi/UniNest.git'
            }
        }
        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE_FRONTEND ./frontend'
            }
        }
        stage('Build Backend Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE_BACKEND ./backend'
            }
        }
        stage('Docker Hub Login & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $DOCKER_IMAGE_FRONTEND
                    docker push $DOCKER_IMAGE_BACKEND
                    '''
                }
            }
        }
        stage('EC2 Deployment') {
            steps {
                sshagent([SSH_CREDENTIALS_ID]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@$EC2_IP '
                      docker pull $DOCKER_IMAGE_FRONTEND &&
                      docker pull $DOCKER_IMAGE_BACKEND &&
                      docker-compose -f /home/ubuntu/uninest/docker-compose.yml up -d
                    '
                    """
                }
            }
        }
        stage('Deployment Verification') {
            steps {
                sshagent([SSH_CREDENTIALS_ID]) {
                    sh "ssh -o StrictHostKeyChecking=no ubuntu@$EC2_IP 'curl -f http://localhost || exit 1'"
                }
            }
        }
    }
}
