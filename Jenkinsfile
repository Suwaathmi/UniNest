pipeline { 
    agent any
    stages { 
        stage('Build') { 
            steps { 
                script { 
                    // Build Docker image
                    sh 'docker build -t my-app:latest .'
                }
            }
        }
        stage('Test') { 
            steps { 
                script { 
                    // Run tests
                    sh 'docker run my-app:latest test'
                }
            }
        }
        stage('Deploy') { 
            steps { 
                script { 
                    // Deploy with Terraform
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'
                }
            }
        }
    }
    post { 
        always { 
            // Clean up
            sh 'docker rmi my-app:latest'
        }
    }
}