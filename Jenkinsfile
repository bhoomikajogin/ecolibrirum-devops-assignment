pipeline {
  agent any

  stages {
    stage('Terraform Plan') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds'],
          string(credentialsId: 'aws-session-token', variable: 'AWS_SESSION_TOKEN')
        ]) {
          sh '''
            export AWS_REGION=us-east-1
            terraform -chdir=terraform init
            terraform -chdir=terraform plan
          '''
        }
      }
    }
  }
}