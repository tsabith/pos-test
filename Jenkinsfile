pipeline {
    agent any

    environment {
        // contoh: jika butuh node versi spesifik, bisa set di sini
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/tsabith/pos-test.git', branch: 'main'
            }
        }

        stage('Install dependencies') {
            steps {
                // gunakan npm ci supaya konsisten dengan package-lock.json :contentReference[oaicite:1]{index=1}
                sh 'npm ci'
            }
        }

        stage('Lint / Test') {
            steps {
                // optional: jalankan lint / test jika ada
                // misal: npm run lint, npm run test
                // uncomment jika kamu punya script test
                // sh 'npm run lint'
                // sh 'npm run test'
                echo 'Skipping lint/test — sesuaikan kalau kamu punya.'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Archive build artifacts') {
            steps {
                // simpan hasil build (folder dist) sebagai artefak build
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        // Jika kamu butuh deploy otomatis ke server atau host lain,
        // kamu bisa tambahkan stage deploy di sini
        // Contoh:
        // stage('Deploy') {
        //   steps {
        //     // misal copy hasil build ke server via scp / rsync / docker, dsb.
        //     echo 'Deploy step — sesuaikan dengan environment kamu'
        //   }
        // }
    }

    post {
        success {
            echo "Build successful!"
        }
        failure {
            echo "Build failed!"
        }
    }
}
