
pipeline {
    agent any

    parameters {
        string(
            name: 'ROLLBACK_TAG',
            defaultValue: '',
            description: 'Leave empty to build and deploy. Enter an existing image tag to roll back manually.'
        )
    }

    environment {
        COMPOSE_PROJECT = 'what2cook'
        COMPOSE_FILE = 'D:\\auro university\\FSWD\\What2Cook\\docker-compose.yml'
        JENKINS_STATE = 'C:\\ProgramData\\Jenkins\\.jenkins\\what2cook-last-good.txt'
        JENKINS_PREVIOUS = 'C:\\ProgramData\\Jenkins\\.jenkins\\what2cook-previous-good.txt'
        INITIAL_ROLLBACK_TAG = 'backup-ccfbeaedaaad'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/HardikMaster16/What2Cook.git'
            }
        }

        stage('Load Deployment State') {
            steps {
                script {
                    String savedTag = ''

                    if (fileExists(env.JENKINS_STATE)) {
                        savedTag = readFile(env.JENKINS_STATE).trim()
                    }

                    if (!savedTag) {
                        savedTag = env.INITIAL_ROLLBACK_TAG
                    }

                    if (!(savedTag ==~ /[A-Za-z0-9_.-]+/)) {
                        error('Invalid saved rollback tag.')
                    }

                    env.ROLLBACK_TARGET_TAG = savedTag

                    echo "Current rollback target: ${env.ROLLBACK_TARGET_TAG}"
                }
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
                    if errorlevel 1 exit /b 1

                    docker build ^
                      --build-arg VITE_API_BASE_URL=/api ^
                      --build-arg VITE_GOOGLE_CLIENT_ID=%VITE_GOOGLE_CLIENT_ID% ^
                      -t what2cook-frontend:%IMAGE_TAG% ./frontend
                    if errorlevel 1 exit /b 1
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
                        echo Selected server image tag not found.
                        exit /b 1
                    )

                    docker image inspect what2cook-frontend:%IMAGE_TAG% >nul 2>&1
                    if errorlevel 1 (
                        echo Selected frontend image tag not found.
                        exit /b 1
                    )

                    docker image inspect what2cook-server:%ROLLBACK_TARGET_TAG% >nul 2>&1
                    if errorlevel 1 (
                        echo Rollback server image tag not found.
                        exit /b 1
                    )

                    docker image inspect what2cook-frontend:%ROLLBACK_TARGET_TAG% >nul 2>&1
                    if errorlevel 1 (
                        echo Rollback frontend image tag not found.
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
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    int healthResult = bat(
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

                    if (healthResult != 0) {
                        echo "Deployment failed health checks. Rolling back to ${env.ROLLBACK_TARGET_TAG}."

                        int rollbackResult = bat(
                            returnStatus: true,
                            script: '''
                                @echo off
                                set "WHAT2COOK_IMAGE_TAG=%ROLLBACK_TARGET_TAG%"

                                docker compose -p "%COMPOSE_PROJECT%" -f "%COMPOSE_FILE%" up -d --no-build --force-recreate server frontend
                                if errorlevel 1 exit /b 1

                                for /L %%i in (1,1,12) do (
                                    echo Rollback health check attempt %%i of 12...
                                    curl.exe --fail --silent --show-error http://localhost:8081/api/health
                                    if not errorlevel 1 exit /b 0
                                    timeout /t 5 /nobreak >nul
                                )

                                echo Rollback health check failed.
                                exit /b 1
                            '''
                        )

                        if (rollbackResult != 0) {
                            error("Automatic rollback failed. Check Docker container logs immediately.")
                        }

                        error("New deployment failed. Previous version restored: ${env.ROLLBACK_TARGET_TAG}")
                    }

                    echo 'Deployment health check passed.'

                    // Preserve the previous last-good tag.
                    writeFile(
                        file: 'what2cook-previous-good.txt',
                        text: env.ROLLBACK_TARGET_TAG
                    )

                    bat '''
                        copy /Y "%WORKSPACE%\\what2cook-previous-good.txt" "%JENKINS_PREVIOUS%"
                        if errorlevel 1 exit /b 1
                    '''

                    // Record the newly verified deployment.
                    writeFile(
                        file: 'what2cook-last-good.txt',
                        text: env.IMAGE_TAG
                    )

                    bat '''
                        copy /Y "%WORKSPACE%\\what2cook-last-good.txt" "%JENKINS_STATE%"
                        if errorlevel 1 exit /b 1
                    '''

                    // Update convenience latest tags after successful verification.
                    bat '''
                        docker tag what2cook-server:%IMAGE_TAG% what2cook-server:latest
                        if errorlevel 1 exit /b 1

                        docker tag what2cook-frontend:%IMAGE_TAG% what2cook-frontend:latest
                        if errorlevel 1 exit /b 1
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "What2Cook operation completed successfully. Selected tag: ${env.IMAGE_TAG}"
        }

        failure {
            echo 'Pipeline failed. Check the Console Output and Docker container logs.'
        }
    }
}
