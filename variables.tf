variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for the Jenkins server"
  type        = string
  default     = "t3.medium"
}

variable "app_instance_type" {
  description = "EC2 instance type for the application server"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID to use for EC2 instances (Ubuntu 22.04)"
  type        = string
  default     = "ami-0030e4319cbf4dbf2"
}

variable "docker_image_frontend" {
  description = "Docker image for the UniNest frontend"
  type        = string
  default     = "suwaathmi/uninest-frontend:latest"
}

variable "docker_image_backend" {
  description = "Docker image for the UniNest backend"
  type        = string
  default     = "suwaathmi/uninest-backend:latest"
}