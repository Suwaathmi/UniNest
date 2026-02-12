pipeline {
    agent any

    environment {
        DOCKERHUB = credentials('dockerhub-creds')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Suwaathmi/UniNest.git',
                    credentialsId: 'github-token'
            }
        }

        stage('Build & Push Frontend') {
            steps {
                sh '''
                docker build -t suwaathmi/uninest-frontend:latest ./frontend
                echo $DOCKERHUB_PSW | docker login -u $DOCKERHUB_USR --password-stdin
                docker push suwaathmi/uninest-frontend:latest
                '''
            }
        }

        stage('Build & Push Backend') {
            steps {
                sh '''
                docker build -t suwaathmi/uninest-backend:latest ./backend
                echo $DOCKERHUB_PSW | docker login -u $DOCKERHUB_USR --password-stdin
                docker push suwaathmi/uninest-backend:latest
                '''
            }
        }

        stage('Build & Push Auth') {
            steps {
                sh '''
                docker build -t suwaathmi/uninest-auth:latest ./auth
                echo $DOCKERHUB_PSW | docker login -u $DOCKERHUB_USR --password-stdin
                docker push suwaathmi/uninest-auth:latest
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@54.162.88.132 "
                        docker pull suwaathmi/uninest-frontend:latest &&
                        docker pull suwaathmi/uninest-backend:latest &&
                        docker pull suwaathmi/uninest-auth:latest &&
                        docker compose -f /home/ubuntu/uninest/docker-compose.yml up -d
                    "
                    '''
                }
            }
        }
    }
}
