# Jenkins CI/CD server
resource "aws_instance" "jenkins_server" {
  ami                         = var.ami_id
  instance_type               = var.jenkins_instance_type
  key_name                    = aws_key_pair.uninest_key.key_name
  vpc_security_group_ids      = [aws_security_group.jenkins_sg.id]
  subnet_id                   = data.aws_subnet.default.id
  associate_public_ip_address = true

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = {
    Name    = "UniNest-Jenkins-Server"
    Project = "UniNest"
    Role    = "CI-CD"
  }

  user_data = <<-EOF
    #!/bin/bash
    exec > /var/log/jenkins-setup.log 2>&1
    set -e

    echo "=== Starting Jenkins setup ==="
    apt update -y
    apt upgrade -y

    # Install Java 17
    echo "=== Installing Java 17 ==="
    apt install -y openjdk-17-jdk

    # Install Jenkins from official Debian stable repo
    echo "=== Installing Jenkins ==="
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
    apt update -y
    apt install -y jenkins

    # Install Docker
    echo "=== Installing Docker ==="
    apt install -y docker.io docker-compose

    # Install Git
    echo "=== Installing Git ==="
    apt install -y git

    # Add jenkins and ubuntu users to docker group
    usermod -aG docker jenkins
    usermod -aG docker ubuntu

    # Enable and start services
    echo "=== Starting services ==="
    systemctl enable docker
    systemctl start docker
    systemctl enable jenkins
    systemctl start jenkins

    echo "=== Jenkins setup complete ==="
  EOF
}
