output "instance_public_ip" {
  value = aws_instance.my_instance.public_ip
}

output "instance_id" {
  value = aws_instance.my_instance.id
}

output "security_group_id" {
  value = aws_instance.my_instance.vpc_security_group_ids[0]
}

output "ssh_command" {
  value = "ssh -i my-key.pem ec2-user@${aws_instance.my_instance.public_ip}"
}