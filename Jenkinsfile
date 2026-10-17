
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

                bat 'docker build --build-arg VITE_API_BASE_URL=/api --build-arg VITE_GOOGLE_CLIENT_ID=%VITE_GOOGLE_CLIENT_ID% -t what2cook-frontend:latest ./frontend'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker compose -p what2cook -f "D:\\auro university\\FSWD\\What2Cook\\docker-compose.yml" up -d --no-build --force-recreate server frontend'
            }
        }

        stage('Verify Deployment') {
            steps {
                bat 'curl.exe --fail --silent --show-error http://localhost:8081/api/health'
            }
        }
    }
}
