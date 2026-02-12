#!/bin/bash

# Update the package database
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo apt install -y docker-compose

# Create application directory
mkdir -p ~/my_application

# Additional setup can be added here
