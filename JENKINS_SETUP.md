# Jenkins Setup Guide for UniNest

## Required Jenkins Credentials

This Jenkinsfile requires the following credentials to be configured in Jenkins:

### 1. Docker Hub Credentials
- **Credential ID**: `dockerhub-credentials`
- **Type**: Username with password
- **Description**: Docker Hub authentication for pushing images
- **Setup**:
  1. Go to Jenkins → Manage Jenkins → Manage Credentials
  2. Select the appropriate domain (usually "Global")
  3. Click "Add Credentials"
  4. Kind: Username with password
  5. ID: `dockerhub-credentials`
  6. Username: Your Docker Hub username
  7. Password: Your Docker Hub password or access token
  8. Description: Docker Hub Credentials

### 2. EC2 SSH Credentials
- **Credential ID**: `ec2-ssh-credentials`
- **Type**: SSH Username with private key
- **Description**: SSH private key for EC2 instance access
- **Setup**:
  1. Go to Jenkins → Manage Jenkins → Manage Credentials
  2. Select the appropriate domain (usually "Global")
  3. Click "Add Credentials"
  4. Kind: SSH Username with private key
  5. ID: `ec2-ssh-credentials`
  6. Username: `ubuntu` (or your EC2 user)
  7. Private Key: Enter directly or from file
  8. Passphrase: If your key has one
  9. Description: EC2 SSH Key

### 3. EC2 Host Address
- **Credential ID**: `ec2-host`
- **Type**: Secret text
- **Description**: EC2 instance public IP or hostname
- **Setup**:
  1. Go to Jenkins → Manage Jenkins → Manage Credentials
  2. Select the appropriate domain (usually "Global")
  3. Click "Add Credentials"
  4. Kind: Secret text
  5. ID: `ec2-host`
  6. Secret: Your EC2 public IP (e.g., `52.12.34.56`) or hostname
  7. Description: EC2 Host Address

### 4. JWT Secret
- **Credential ID**: `jwt-secret`
- **Type**: Secret text
- **Description**: JWT secret key for authentication
- **Setup**:
  1. Go to Jenkins → Manage Jenkins → Manage Credentials
  2. Select the appropriate domain (usually "Global")
  3. Click "Add Credentials"
  4. Kind: Secret text
  5. ID: `jwt-secret`
  6. Secret: A strong random secret key (e.g., generate with `openssl rand -base64 32`)
  7. Description: JWT Secret Key

### 5. Database Username
- **Credential ID**: `db-username`
- **Type**: Secret text
- **Description**: MongoDB root username
- **Setup**:
  1. Go to Jenkins → Manage Jenkins → Manage Credentials
  2. Select the appropriate domain (usually "Global")
  3. Click "Add Credentials"
  4. Kind: Secret text
  5. ID: `db-username`
  6. Secret: Your MongoDB username (e.g., `admin` or `dbadmin`)
  7. Description: Database Username

### 6. Database Password
- **Credential ID**: `db-password`
- **Type**: Secret text
- **Description**: MongoDB root password
- **Setup**:
  1. Go to Jenkins → Manage Jenkins → Manage Credentials
  2. Select the appropriate domain (usually "Global")
  3. Click "Add Credentials"
  4. Kind: Secret text
  5. ID: `db-password`
  6. Secret: A strong password for MongoDB
  7. Description: Database Password

## Environment Variables

The following environment variables are used in the pipeline:

- `DOCKER_REGISTRY`: Docker Hub username (default: `suwaathmi`)
- `FRONTEND_IMAGE`: Full frontend image name
- `BACKEND_IMAGE`: Full backend image name
- `IMAGE_TAG`: Build number used as Docker image tag
- `EC2_USER`: SSH user for EC2 (default: `ubuntu`)
- `NODE_ENV`: Application environment (set to `production`)
- `JWT_SECRET`: JWT secret key from Jenkins credentials
- `DB_USER`: Database username from Jenkins credentials
- `DB_PASS`: Database password from Jenkins credentials

## Pipeline Stages

### 1. Checkout
Checks out the source code from the repository.

### 2. Build Frontend
Builds the frontend Docker image and tags it with both the build number and `latest`.

### 3. Build Backend
Builds the backend Docker image and tags it with both the build number and `latest`.

### 4. Test
Runs tests for both frontend and backend if test scripts exist in package.json.
Tests are optional and will skip gracefully if not configured.

### 5. Push to Docker Hub
Logs into Docker Hub and pushes both frontend and backend images with version tags.

### 6. Deploy to EC2
- Creates a deployment script
- Copies the script to EC2 via SCP
- Executes the script on EC2 which:
  - Pulls latest Docker images
  - Stops existing containers
  - Starts new containers using docker-compose
  - Cleans up old images

## EC2 Instance Requirements

Your EC2 instance should have:

1. **Docker installed**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu
   ```

2. **Docker Compose installed**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Security Group Configuration**:
   - Port 22 (SSH) - For Jenkins deployment
   - Port 80 (HTTP) - For Nginx
   - Port 3000 (Frontend) - Optional, for direct access
   - Port 5000 (Backend) - Optional, for direct access

4. **Application Directory**:
   The deployment script will create `/home/ubuntu/UniNest` if it doesn't exist.

## Post-Deployment Verification

After deployment, verify the application:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check running containers
docker ps

# Check logs
docker-compose logs -f

# Test the application
curl http://localhost:80
```

## Troubleshooting

### Build Failures
- Check Docker is installed on Jenkins agent
- Verify Dockerfiles exist in frontend/ and backend/ directories

### Push Failures
- Verify Docker Hub credentials are correct
- Check image names match your Docker Hub username
- Ensure you have push permissions to the registry

### Deployment Failures
- Verify EC2 SSH credentials are correct
- Check EC2 security group allows SSH (port 22)
- Ensure Docker and docker-compose are installed on EC2
- Verify the EC2 host address is correct

### Application Not Starting
- SSH into EC2 and check: `docker-compose logs`
- Verify environment variables in docker-compose.yml
- Check if ports are already in use: `sudo netstat -tlnp`

## Pipeline Notifications

The pipeline provides status notifications in the post-build section:
- ✅ Success: Shows deployed image tags
- ❌ Failure: Indicates pipeline failed
- ⚠️ Unstable: Indicates warnings or non-critical failures

## Security Notes

1. **Never commit credentials**: All sensitive data is stored in Jenkins credentials manager
2. **Rotate keys regularly**: Update SSH keys, Docker Hub tokens, and secrets periodically
3. **Strong secrets**: Generate strong random secrets:
   - JWT Secret: `openssl rand -base64 32`
   - Database Password: `openssl rand -base64 24`
4. **SSH host verification**: The pipeline now uses `ssh-keyscan` to add the EC2 host key to known_hosts, preventing MITM attacks
5. **No hardcoded defaults**: All secrets must be explicitly configured in Jenkins
6. **Enable Docker Content Trust**: For signed image verification
7. **Limit SSH access**: Use security groups to restrict SSH access to Jenkins IP only
8. **Environment variable security**: Secrets are passed securely via environment variables, not hardcoded in files

## Maintenance

### Updating Docker Images
The pipeline automatically tags images with build numbers. To rollback:

```bash
# On EC2
cd /home/ubuntu/UniNest
# Edit docker-compose.yml to use specific tag
# Change: suwaathmi/uninest-frontend:latest
# To: suwaathmi/uninest-frontend:123
docker-compose up -d
```

### Cleaning Up
Jenkins automatically cleans up build images after each run. To clean EC2:

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

## Support

For issues or questions:
1. Check Jenkins console output for error messages
2. Review application logs: `docker-compose logs`
3. Verify all credentials are properly configured
4. Ensure EC2 instance has sufficient resources
