# Public IPs
output "app_server_ip" {
  value = aws_instance.app_server.public_ip
}

output "jenkins_server_ip" {
  value = aws_instance.jenkins_server.public_ip
}

# Instance IDs
output "app_server_id" {
  value = aws_instance.app_server.id
}

output "jenkins_server_id" {
  value = aws_instance.jenkins_server.id
}

# Security Groups (fix: use tolist() or output full set)
output "app_server_sg" {
  value = tolist(aws_instance.app_server.vpc_security_group_ids)[0]
}

output "jenkins_server_sg" {
  value = tolist(aws_instance.jenkins_server.vpc_security_group_ids)[0]
}

# SSH Commands (using your uninest-key.pem file)
output "app_server_ssh" {
  value = "ssh -i uninest-key.pem ubuntu@${aws_instance.app_server.public_ip}"
}

output "jenkins_server_ssh" {
  value = "ssh -i uninest-key.pem ubuntu@${aws_instance.jenkins_server.public_ip}"
}
