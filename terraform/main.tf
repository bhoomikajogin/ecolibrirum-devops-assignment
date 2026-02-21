resource "aws_s3_bucket" "tf_test" {
  bucket = "jenkins-terraform-smoke-${random_id.suffix.hex}"

  tags = {
    Name = "Terraform Smoke Test"
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}