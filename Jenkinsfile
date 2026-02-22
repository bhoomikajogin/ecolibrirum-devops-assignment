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
            terraform -chdir=terraform init -migrate-state -input=false
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
    stage('Terraform Apply') {
        steps {
            dir('terraform') {
                sh '''
                    terraform apply -auto-approve
                '''
            }
        }
}
  }

  post {
    success {
      echo "✅ Terraform apply completed successfully"
    }
    failure {
      echo "❌ Terraform apply failed"
    }
  }
}