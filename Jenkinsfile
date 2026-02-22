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
            rm -rf terraform/.terraform
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
            withCredentials([
                [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
            ]) {
                sh '''
                    terraform -chdir=terraform init -input=false
                    terraform -chdir=terraform apply -auto-approve
                '''
            }
        }
    }
    stage('Docker Build') {
        steps {
            sh '''
                docker build -t eks-demo-app:${BUILD_NUMBER} app/
            '''
        }
    }

    stage('ECR Login') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin \
            $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com
          '''
        }
      }
    }

    stage('Docker Push') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

            docker tag eks-demo-app:${BUILD_NUMBER} \
            $ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app:${BUILD_NUMBER}

            docker push \
            $ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app:${BUILD_NUMBER}
          '''
        }
      }
    }

    stage('Install Ingress Controller') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            aws eks update-kubeconfig --region ${AWS_REGION} --name demo-eks-cluster
            helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
            helm repo update
            helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
              --namespace ingress-nginx --create-namespace \
              --set controller.publishService.enabled=true
          '''
        }
      }
    }

    stage('Helm Deploy') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            aws eks update-kubeconfig --region ${AWS_REGION} --name demo-eks-cluster
            ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
            helm upgrade --install eks-demo ./eks-demo-chart \
              --set image.repository=$ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app \
              --set image.tag=${BUILD_NUMBER}

            echo "Waiting for ingress address..."
            sleep 20
            INGRESS=$(kubectl get ingress eks-demo-eks-demo-chart -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
            echo "========================================="
            echo "Application URL: http://$INGRESS"
            echo "========================================="
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Deployment Successful. Application updated to build #${BUILD_NUMBER}"
    }
    failure {
      echo "Deployment failed at build #${BUILD_NUMBER}. Investigate logs"
    }
  }
}