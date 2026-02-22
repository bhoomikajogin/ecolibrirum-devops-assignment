pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
  }

  options {
    timestamps()
    cleanWs()
  }

  stages {

    stage('Infra') {
      stages {
        stage('Terraform Init & Validate') {
          steps {
            withCredentials([
              [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
            ]) {
              sh '''
                rm -rf terraform/.terraform
                terraform -chdir=terraform init -migrate-state -input=false
                terraform -chdir=terraform validate
              '''
            }
          }
        }

        stage('Terraform Plan & Apply') {
          steps {
            withCredentials([
              [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
            ]) {
              sh '''
                terraform -chdir=terraform plan -input=false
                terraform -chdir=terraform apply -auto-approve
              '''
            }
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Docker Build') {
          steps {
            sh 'docker build -t eks-demo-app:${BUILD_NUMBER} app/'
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
      }
    }

    stage('Push') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-sandbox-creds']
        ]) {
          sh '''
            ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
            docker tag eks-demo-app:${BUILD_NUMBER} \
              $ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app:${BUILD_NUMBER}
            docker tag eks-demo-app:${BUILD_NUMBER} \
              $ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app:latest
            docker push $ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app:${BUILD_NUMBER}
            docker push $ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app:latest
          '''
        }
      }
    }

    stage('Deploy') {
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

            ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
            helm upgrade --install eks-demo ./eks-demo-chart \
              --set image.repository=$ACCOUNT_ID.dkr.ecr.${AWS_REGION}.amazonaws.com/eks-demo-app \
              --set image.tag=${BUILD_NUMBER}

            echo "Waiting for ingress address..."
            sleep 20
            INGRESS=$(kubectl get ingress eks-demo-eks-demo-chart \
              -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
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
      echo "✅ Build #${BUILD_NUMBER} deployed successfully"
    }
    failure {
      echo "❌ Build #${BUILD_NUMBER} failed — check logs above"
    }
  }
}