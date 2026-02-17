terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Get default VPC and subnet
data "aws_vpc" "default" {
  default = true
}

data "aws_subnet" "default" {
  vpc_id             = data.aws_vpc.default.id
  availability_zone  = "us-east-1a"
}

# Security group for SSH, HTTP, Jenkins
resource "aws_security_group" "uninest_sg" {
  name_prefix = "uninest-"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Use your existing SSH key
resource "aws_key_pair" "uninest_key" {
  key_name   = "uninest-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# EC2 instance with Jenkins + Docker + Nginx installed via user_data
resource "aws_instance" "uninest_server" {
  ami                    = "ami-0030e4319cbf4dbf2"  # Ubuntu 22.04
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.uninest_key.key_name
  vpc_security_group_ids = [aws_security_group.uninest_sg.id]
  subnet_id              = data.aws_subnet.default.id

  tags = {
    Name = "UniNest-Server"
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install -y openjdk-11-jdk
              wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
              sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
              sudo apt update -y
              sudo apt install -y jenkins docker.io nginx
              sudo systemctl enable jenkins docker nginx
              sudo systemctl start jenkins docker nginx
              EOF
}

# Output Jenkins server public IP
output "jenkins_ip" {
  value = aws_instance.uninest_server.public_ip
}
