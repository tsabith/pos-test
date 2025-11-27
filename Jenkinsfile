pipeline {
    agent {
        label 'stb'
    }

    stages {
        stage('Prepare Node Environment') {
            agent {
                docker {
                    image 'node:18'
                    args '-u root'
                }
            }
            stages {

                stage('Checkout') {
                    steps {
                        checkout scm
                    }
                }

                stage('Install dependencies') {
                    steps {
                        sh 'npm ci'
                    }
                }

                stage('Test') {
                    steps {
                        script {
                            // Jika project tidak punya test, boleh kamu disable
                            if (fileExists('package.json')) {
                                sh 'npm test || echo "No test script found or skipped"'
                            }
                        }
                    }
                }

                stage('Build') {
                    steps {
                        sh 'npm run build'
                    }
                }

                stage('Archive build artifacts') {
                    steps {
                        archiveArtifacts artifacts: 'dist/**', fingerprint: true
                    }
                }

                stage('Deploy') {
                    when {
                        branch 'main'
                    }
                    steps {
                        echo '📦 Deploying to server...'
                        // Contoh deploy (sesuaikan):
                        // sh 'scp -r dist/* user@server:/var/www/html/'
                        // sh 'rsync -avz dist/ user@server:/var/www/vue-app/'
                    }
                }

            }
        }
    }

    post {
        success {
            echo "✔ Build sukses!"
        }
        failure {
            echo "❌ Build gagal!"
        }
    }
}
