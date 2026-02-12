# AWS Configuration Variables

variable "ec2_key_name" {
  description = "Name of the EC2 key pair"
  type        = string
}

variable "instance_type" {
  description = "Type of the EC2 instance"
  type        = string
  default     = "t2.micro"
}

variable "environment" {
  description = "Environment for the deployment (e.g., dev, staging, production)"
  type        = string
}

variable "cidr_blocks" {
  description = "CIDR blocks for the VPC"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}