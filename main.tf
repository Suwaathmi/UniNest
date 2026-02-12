resource "aws_instance" "uniNestInstance" {
  ami           = "ami-0c55b159cbfafe01e" // Use the appropriate AMI ID
  instance_type = "t2.micro"  // Choose the instance type
  tags = {
    Name = "UniNest-Application"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y docker.io",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      "sudo docker run -d -p 80:80 unicast/UniNest" // Replace with your actual Docker image
    ]
  }
}