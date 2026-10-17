
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/HardikMaster16/What2Cook.git'
            }
        }

        stage('Frontend Lint') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run lint'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t what2cook-server:latest ./server'
                bat 'docker build -t what2cook-frontend:latest ./frontend'
            }
        }
    }
}
