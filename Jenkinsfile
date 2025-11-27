pipeline {
    agent { label 'stb' }

    environment {
        NODE_ENV = 'production'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
	
        stage('Install Node Modules') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                script {
                    if (fileExists('package.json')) {
                        sh 'npm test || echo "No test script found or test skipped"'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npx vite build'
            }
        }

        stage('Archive Build Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying to target server..."
                // contoh deploy pakai rsync / scp jika diperlukan
                // sh 'rsync -avz dist/ user@server:/var/www/project/'
            }
        }
    }

    post {
        success { echo "✔ Build succeed!" }
        failure { echo "❌ Build failed!" }
    }
}
