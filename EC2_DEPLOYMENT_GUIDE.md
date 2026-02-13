# EC2 Deployment Guide for UniNest Application

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Setting Up EC2 Instance](#setting-up-ec2-instance)
4. [Configuring Security Groups](#configuring-security-groups)
5. [Installing Dependencies](#installing-dependencies)
6. [Jenkins Configuration](#jenkins-configuration)
7. [Docker Compose Setup](#docker-compose-setup)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Security Best Practices](#security-best-practices)

---

## Introduction
This guide provides comprehensive steps for setting up, configuring, and deploying the UniNest application on EC2.

## Prerequisites
- AWS account and permissions to create EC2 instances.
- Basic knowledge of command-line and AWS Management Console.

## Setting Up EC2 Instance
1. Log in to the AWS Management Console.
2. Navigate to the EC2 dashboard.
3. Click on 'Launch Instance'.
4. Choose an Amazon Machine Image (AMI).
5. Select an instance type with adequate resources (e.g. t2.medium).
6. Configure instance details and review.
7. Launch and create a new key pair for SSH access.

## Configuring Security Groups
1. Navigate to Security Groups in the EC2 dashboard.
2. Create or modify a security group to allow:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)
3. Associate the security group with your EC2 instance.

## Installing Dependencies
1. SSH into your EC2 instance via terminal:
   ```bash
   ssh -i /path/to/your-key.pem ec2-user@your-instance-public-dns
   ```
2. Update the package manager and install necessary dependencies:
   ```bash
   sudo yum update -y
   sudo yum install git docker -y
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```

## Jenkins Configuration
1. Install Jenkins on the instance:
   ```bash
   sudo yum install java-1.8.0-openjdk -y
   wget -O jenkins.war http://mirrors.jenkins.io/war-stable/latest/jenkins.war
   java -jar jenkins.war
   ```
2. Access Jenkins via `http://your-instance-public-dns:8080` and complete the setup.

## Docker Compose Setup
1. Install Docker Compose:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```
2. Create a `docker-compose.yml` file:
   ```yaml
   version: '3'
   services:
     uninst:
       image: your-uninst-image
       ports:
         - "80:80"
   ```
3. Run Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Monitoring
- Use CloudWatch for monitoring the health and performance of your instance.
- Set up alerts for CPU usage and instance status checks.

## Troubleshooting
- Check application logs for errors.
- Ensure security group settings allow necessary traffic.

## Security Best Practices
1. Regularly update your instance and dependencies.
2. Use SSH key pairs instead of passwords.
3. Limit inbound traffic using security groups.
4. Regularly back up data and configurations.

---

This guide provides a comprehensive overview of deploying the UniNest application on AWS EC2. Follow these steps to ensure a successful deployment.