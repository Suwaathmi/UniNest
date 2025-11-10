#!/bin/bash

# Create project structure
mkdir -p react-node-docker/{frontend,backend,nginx}
cd react-node-docker

# Create basic package.json files
echo '{
  "name": "frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}' > frontend/package.json

echo '{
  "name": "backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}' > backend/package.json

echo "Project structure created!"
echo "Now copy the Docker Compose and Dockerfile contents from the artifact."
