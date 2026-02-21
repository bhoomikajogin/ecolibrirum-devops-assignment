pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
  }

  options {
    timestamps()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Terraform Init') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            terraform -chdir=terraform init -input=false
          '''
        }
      }
    }

    stage('Terraform Validate') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            terraform -chdir=terraform validate
          '''
        }
      }
    }

    stage('Terraform Plan') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            terraform -chdir=terraform plan -input=false
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Terraform smoke test successful"
    }
    failure {
      echo "❌ Terraform smoke test failed"
    }
  }
}