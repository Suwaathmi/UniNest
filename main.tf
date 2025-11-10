terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.20.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "uninest_frontend" {
  name = "suwaathmi/uninest-frontend:latest"
}

resource "docker_container" "frontend" {
  name  = "uninest-frontend"
  image = docker_image.uninest_frontend.name
  ports {
    internal = 3000
    external = 3000
  }
}

resource "docker_image" "uninest_backend" {
  name = "suwaathmi/uninest-auth:latest"
}

resource "docker_container" "backend" {
  name  = "uninest-backend"
  image = docker_image.uninest_backend.name
  ports {
    internal = 5000
    external = 5000
  }
}
