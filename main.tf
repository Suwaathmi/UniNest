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

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet" "default" {
  vpc_id = data.aws_vpc.default.id
  availability_zone = "us-east-1a"
}

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

resource "aws_key_pair" "uninest_key" {
  key_name   = "uninest-key"
  public_key = file("~/.ssh/id_rsa.pub")  # Your existing SSH key
}

resource "aws_instance" "uninest_server" {
  ami                    = "ami-0030e4319cbf4dbf2"  # Ubuntu 22.04
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.uninest_key.key_name
  vpc_security_group_ids = [aws_security_group.uninest_sg.id]
  subnet_id              = data.aws_subnet.default.id
  tags = {
    Name = "UniNest-Server"
  }
  
  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file("~/.ssh/id_rsa")
      host        = self.public_ip
    }
    
    inline = [
      "sudo apt update",
      "sudo apt install -y docker.io nginx",
      "sudo systemctl start docker nginx",
      "echo 'UniNest Deployed!' | sudo tee /var/www/html/index.html"
    ]
  }
}

output "instance_public_ip" {
  value = aws_instance.uninest_server.public_ip
}
