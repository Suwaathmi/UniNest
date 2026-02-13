# Jenkins Setup Guide

## Introduction
This guide provides comprehensive instructions for setting up Jenkins, adding Docker Hub and EC2 SSH credentials, creating a pipeline job, configuring GitHub integration, running the pipeline, and troubleshooting common issues.

### 1. Setting Up Jenkins
1. **Install Java**: Jenkins requires Java to run. Install the latest version of Java on your server.
   
   ```bash
   sudo apt update
   sudo apt install openjdk-11-jdk
   ```

2. **Add Jenkins Repository**: Add the Jenkins repository and import the key:
   
   ```bash
   echo "deb http://pkg.jenkins.io/debian-stable binary/" | sudo tee -a /etc/apt/sources.list.d/jenkins.list
   sudo wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key 
   sudo apt-key add jenkins.io.key
   ````

3. **Install Jenkins**: Now update the package index and install Jenkins:
   
   ```bash
   sudo apt update
   sudo apt install jenkins
   ```

4. **Start Jenkins**: Start the Jenkins service:
   
   ```bash
   sudo systemctl start jenkins
   sudo systemctl enable jenkins
   ```

5. **Access Jenkins**: Open a web browser and go to `http://<your_server_ip>:8080`. Get the initial admin password from:
   
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

### 2. Adding Docker Hub Credentials
1. **Access Jenkins Credentials**: Navigate to Manage Jenkins > Manage Credentials.

2. **Add New Credentials**: Click on `(global)` under Stores scoped to Jenkins. Then click on **Add Credentials**.
   
   - **Kind**: Username with password
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub password
   - **ID**: dockerhub-credentials (or a name of your choice)

### 3. Adding EC2 SSH Credentials
1. **Generate SSH Key**: On your local machine, generate an SSH key:
   
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. **Upload Public Key to EC2**: Add the public key to the `~/.ssh/authorized_keys` on your EC2 instance.

3. **Add SSH Key to Jenkins**: In Jenkins, go to Manage Jenkins > Manage Credentials > Add Credentials:
   
   - **Kind**: SSH Username with private key
   - **Username**: ec2-user (or your EC2 username)
   - **Private Key**: Enter directly or use the file you generated.
   - **ID**: ec2-ssh-credentials (or a name of your choice)

### 4. Creating a Pipeline Job
1. **Create a New Item**: Click on **New Item** in Jenkins dashboard.
   
   - Enter a name for your job.
   - Select **Pipeline** and click **OK**.

2. **Configure the Pipeline**: Scroll down to the Pipeline section and set the following:
   
   - **Definition**: Pipeline script
   - Enter your pipeline script to build your project.

### 5. Configuring GitHub Integration
1. **Install GitHub Plugin**: Go to Manage Jenkins > Manage Plugins. Install the GitHub Integration plugin if it’s not already installed.

2. **Add GitHub Credentials**: In Manage Jenkins > Manage Credentials, add your GitHub token or password.

3. **Configure Webhook**: In your GitHub repository, add a webhook:
   
   - Payload URL: `http://<your_jenkins_url>/github-webhook/`
   - Content type: application/json
   - Select events: Just the push event.

### 6. Running the Pipeline
- Go back to your pipeline job and click on **Build Now** to trigger the pipeline.

### 7. Troubleshooting Common Issues
- **Jenkins not starting**: Check the logs in `/var/log/jenkins/jenkins.log` for errors.
- **SSH issues**: Ensure your EC2 instance's security group allows SSH from Jenkins.
- **GitHub Integration not working**: Verify webhook settings in GitHub and check logs in Jenkins for errors.

## Conclusion
By following this guide, you should be able to successfully set up Jenkins and integrate it with Docker Hub, EC2, and GitHub for your CI/CD needs.