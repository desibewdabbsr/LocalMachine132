# Auto-generated terraform template for ec2.tf

provider "aws" {
  region = var.aws_region
}

variable "environment" {
  type = string
  description = "Deployment environment"
}

# Resource definitions will be populated here
