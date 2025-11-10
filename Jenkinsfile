pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_VERSION = '1.29.2'
    }

    stages {
        stage('Build') {
            steps {
                echo '🔧 Building Docker images...'
                sh 'docker-compose build'
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Running backend tests...'
                sh 'cd backend && mvn test'

                echo '🧪 Running frontend tests...'
                sh 'cd frontend && npm install && npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying containers...'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        always {
            echo '📦 Pipeline completed. Cleaning up...'
            sh 'docker-compose down || true'
        }
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed. Check logs and test results.'
        }
    }
}
