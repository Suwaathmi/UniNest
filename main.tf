# App Server
resource "aws_instance" "app_server" {
  ami                    = "ami-0030e4319cbf4dbf2"  # Ubuntu 22.04
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.uninest_key.key_name
  vpc_security_group_ids = [aws_security_group.uninest_sg.id]
  subnet_id              = data.aws_subnet.default.id

  tags = {
    Name = "UniNest-AppServer"
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install -y docker.io nginx
              sudo systemctl enable docker nginx
              sudo systemctl start docker nginx
              EOF
}

# Jenkins Server
resource "aws_instance" "jenkins_server" {
  ami                    = "ami-0030e4319cbf4dbf2"  # Ubuntu 22.04
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.uninest_key.key_name
  vpc_security_group_ids = [aws_security_group.uninest_sg.id]
  subnet_id              = data.aws_subnet.default.id

  tags = {
    Name = "UniNest-JenkinsServer"
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install -y openjdk-11-jdk jenkins docker.io
              sudo systemctl enable jenkins docker
              sudo systemctl start jenkins docker
              EOF
}

# Outputs
output "app_server_ip" {
  value = aws_instance.app_server.public_ip
}

output "jenkins_server_ip" {
  value = aws_instance.jenkins_server.public_ip
}
