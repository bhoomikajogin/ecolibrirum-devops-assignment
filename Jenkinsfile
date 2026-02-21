pipeline {
  agent any

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Checking out source code...'
      }
    }

    stage('Environment Info') {
      steps {
        sh '''
          echo "Node Name: $(hostname)"
          echo "Workspace: $WORKSPACE"
          java -version || true
          docker --version || true
        '''
      }
    }

    stage('Smoke Test') {
      steps {
        echo 'Jenkins pipeline from SCM is working successfully!'
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed.'
    }
  }
}