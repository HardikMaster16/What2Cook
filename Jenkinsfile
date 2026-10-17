
pipeline {
    agent any

    parameters {
        string(
            name: 'ROLLBACK_TAG',
            defaultValue: '',
            description: 'Leave empty to build and deploy a new version. Enter an existing tag to roll back.'
        )
    }

    environment {
        COMPOSE_PROJECT = 'what2cook'
        COMPOSE_FILE = 'D:\\auro university\\FSWD\\What2Cook\\docker-compose.yml'
        JENKINS_STATE = 'C:\\ProgramData\\Jenkins\\.jenkins\\what2cook-last-good.txt'
        JENKINS_PREVIOUS = 'C:\\ProgramData\\Jenkins\\.jenkins\\what2cook-previous-good.txt'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/HardikMaster16/What2Cook.git'
            }
        }

        stage('Frontend Lint') {
            when {
                expression { !params.ROLLBACK_TAG?.trim() }
            }
            steps {
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm run lint'
                }
            }
        }

        stage('Frontend Build') {
            when {
                expression { !params.ROLLBACK_TAG?.trim() }
            }
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Build Versioned Images') {
            when {
                expression { !params.ROLLBACK_TAG?.trim() }
            }
            steps {
                script {
                    env.IMAGE_TAG = bat(
                        returnStdout: true,
                        script: '@git rev-parse --short=12 HEAD'
                    ).trim()
                }

                bat '''
                    docker build -t what2cook-server:%IMAGE_TAG% ./server

                    docker build ^
                      --build-arg VITE_API_BASE_URL=/api ^
                      --build-arg VITE_GOOGLE_CLIENT_ID=%VITE_GOOGLE_CLIENT_ID% ^
                      -t what2cook-frontend:%IMAGE_TAG% ./frontend
                '''
            }
        }

        stage('Select Deployment Version') {
            steps {
                script {
                    if (params.ROLLBACK_TAG?.trim()) {
                        env.IMAGE_TAG = params.ROLLBACK_TAG.trim()
                    }

                    if (!(env.IMAGE_TAG ==~ /[A-Za-z0-9_.-]+/)) {
                        error('Invalid Docker image tag.')
                    }
                }

                bat '''
                    docker image inspect what2cook-server:%IMAGE_TAG% >nul 2>&1
                    if errorlevel 1 (
                        echo Server image tag not found.
                        exit /b 1
                    )

                    docker image inspect what2cook-frontend:%IMAGE_TAG% >nul 2>&1
                    if errorlevel 1 (
                        echo Frontend image tag not found.
                        exit /b 1
                    )
                '''
            }
        }

        stage('Deploy') {
            steps {
                bat '''
                    set "WHAT2COOK_IMAGE_TAG=%IMAGE_TAG%"
                    docker compose -p "%COMPOSE_PROJECT%" -f "%COMPOSE_FILE%" up -d --no-build --force-recreate server frontend
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    int result = bat(
                        returnStatus: true,
                        script: '''
                            @echo off
                            for /L %%i in (1,1,12) do (
                                echo Health check attempt %%i of 12...
                                curl.exe --fail --silent --show-error http://localhost:8081/api/health
                                if not errorlevel 1 exit /b 0
                                timeout /t 5 /nobreak >nul
                            )
                            echo Deployment health check failed.
                            exit /b 1
                        '''
                    )

                    if (result != 0) {
                        error('Deployment health check failed. Check logs and deploy a known-good tag if needed.')
                    }

                    // Preserve the previous successful deployment tag.
                    bat '''
                        if exist "%JENKINS_STATE%" (
                            copy /Y "%JENKINS_STATE%" "%JENKINS_PREVIOUS%" >nul
                        )
                    '''

                    // Update latest only after the deployment passes health checks.
                    bat '''
                        docker tag what2cook-server:%IMAGE_TAG% what2cook-server:latest
                        if errorlevel 1 exit /b 1

                        docker tag what2cook-frontend:%IMAGE_TAG% what2cook-frontend:latest
                        if errorlevel 1 exit /b 1
                    '''

                    // Record the deployment that just passed verification.
                    writeFile(
                        file: 'what2cook-last-good.txt',
                        text: env.IMAGE_TAG
                    )

                    bat '''
                        copy /Y "%WORKSPACE%\\what2cook-last-good.txt" "%JENKINS_STATE%"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "What2Cook deployment succeeded with image tag: ${env.IMAGE_TAG}"
        }
        failure {
            echo 'Deployment failed. Check the console output and container logs before retrying.'
        }
    }
}
