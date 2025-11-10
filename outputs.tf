output "frontend_container_id" {
  value = docker_container.frontend.id
}

output "backend_container_id" {
  value = docker_container.backend.id
}
