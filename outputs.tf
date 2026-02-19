output "jenkins_server_public_ip" {
  description = "Public IP address of the Jenkins server"
  value       = aws_instance.jenkins_server.public_ip
}

output "jenkins_url" {
  description = "URL to access Jenkins UI"
  value       = "http://${aws_instance.jenkins_server.public_ip}:8080"
}

output "app_server_public_ip" {
  description = "Public IP address of the application server"
  value       = aws_instance.app_server.public_ip
}

output "app_url" {
  description = "Application URL via Nginx (port 80)"
  value       = "http://${aws_instance.app_server.public_ip}"
}

output "app_frontend_url" {
  description = "Direct frontend URL"
  value       = "http://${aws_instance.app_server.public_ip}:3000"
}

output "app_backend_url" {
  description = "Direct backend API URL"
  value       = "http://${aws_instance.app_server.public_ip}:5000"
}

output "ssh_jenkins" {
  description = "SSH command for Jenkins server"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_instance.jenkins_server.public_ip}"
}

output "ssh_app" {
  description = "SSH command for application server"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_instance.app_server.public_ip}"
}