```groovy
pipeline {
    agent any

    parameters {
        string(
            name: 'ROLLBACK_TAG',
            defaultValue: '',
            description: 'Leave empty to build and deploy a new version. Enter an existing version tag to roll back.'
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
                    if errorlevel 1 exit /b 1
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
                        echo 'Health check failed. Starting automatic rollback.'

                        String rollbackTag = env.ROLLBACK_TARGET_TAG

                        if (!rollbackTag?.trim()) {
                            rollbackTag = env.ROLLBACK_TAG?.trim()
                        }

                        if (!rollbackTag?.trim()) {
                            rollbackTag = env.PREVIOUS_GOOD_TAG?.trim()
                        }

                        if (!rollbackTag?.trim()) {
                            rollbackTag = env.INITIAL_ROLLBACK_TAG
                        }

                        if (!(rollbackTag ==~ /[A-Za-z0-9_.-]+/)) {
                            error('Deployment failed and no valid rollback tag is available.')
                        }

                        env.ROLLBACK_TARGET_TAG = rollbackTag

                        int rollbackResult = bat(
                            returnStatus: true,
                            script: """
                                @echo off
                                docker image inspect what2cook-server:${rollbackTag} >nul 2>&1
                                if errorlevel 1 exit /b 1

                                docker image inspect what2cook-frontend:${rollbackTag} >nul 2>&1
                                if errorlevel 1 exit /b 1

                                set "WHAT2COOK_IMAGE_TAG=${rollbackTag}"
                                docker compose -p "%COMPOSE_PROJECT%" -f "%COMPOSE_FILE%" up -d --no-build --force-recreate server frontend
                                if errorlevel 1 exit /b 1

                                for /L %%i in (1,1,12) do (
                                    curl.exe --fail --silent --show-error http://localhost:8081/api/health
                                    if not errorlevel 1 exit /b 0
                                    timeout /t 5 /nobreak >nul
                                )

                                exit /b 1
                            """
                        )

                        if (rollbackResult != 0) {
                            error("Deployment failed and automatic rollback to ${rollbackTag} did not pass verification. Inspect container logs.")
                        }

                        error("New deployment failed health checks. Automatically rolled back to ${rollbackTag}.")
                    }

                    // Read the current known-good tag, if one exists.
                    String previousTag = ''
                    if (fileExists(env.JENKINS_STATE)) {
                        previousTag = readFile(env.JENKINS_STATE).trim()
                    }

                    if (!previousTag) {
                        previousTag = env.INITIAL_ROLLBACK_TAG
                    }

                    // Save the previous tag before recording the new successful deployment.
                    writeFile(
                        file: 'what2cook-previous-good.txt',
                        text: previousTag
                    )

                    bat '''
                        copy /Y "%WORKSPACE%\\what2cook-previous-good.txt" "%JENKINS_PREVIOUS%"
                        if errorlevel 1 exit /b 1
                    '''

                    writeFile(
                        file: 'what2cook-last-good.txt',
                        text: env.IMAGE_TAG
                    )

                    bat '''
                        copy /Y "%WORKSPACE%\\what2cook-last-good.txt" "%JENKINS_STATE%"
                        if errorlevel 1 exit /b 1
                    '''

                    // Update the convenience latest tags only after health checks pass.
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
            echo 'Pipeline failed. Check the console output and container logs.'
        }
    }
}
```