# QUICK START GUIDE FOR DEPLOYMENT

## Checklist
- **Pre-requisites**: Make sure you have the following tools installed:
  - Git
  - Node.js (version X.X.X)
  - Docker (for containerized deployments)
- **Environment Setup**: Ensure the environment matches production settings.
- **Dependencies**: Install required modules using `npm install` or `yarn install`.
- **Access Rights**: Ensure you have the necessary permissions for cloud services if applicable.

## Step-by-Step Instructions
1. **Cloning the Repository**:  
   Run the following command in your terminal:
   ```bash
   git clone https://github.com/Suwaathmi/UniNest.git
   cd UniNest
   ```  

2. **Installing Dependencies**:  
   Navigate to the project directory and run:  
   ```bash
   npm install
   ```  
   or if you use yarn:
   ```bash
   yarn install
   ```

3. **Configuring Environment Variables**:  
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```  
   Fill in the necessary details in the `.env` file.

4. **Running the Application**:  
   Start the application:
   ```bash
   npm run start
   ```
   or for Docker:
   ```bash
   docker-compose up
   ```  

## Monitoring Commands
- **Checking Logs**:  
   Use the following command to tail logs:
   ```bash
   tail -f logs/app.log
   ```  

- **Monitoring Resource Usage**:
   Use the command below to check the application resource usage:
   ```bash
   docker stats
   ```  

## Troubleshooting
- **Common Issues and Solutions**:
  - If the application won't start, ensure all services are running:
    ```bash
    docker-compose ps
    ```
  - Validate your environment variables; incorrect configurations often lead to startup issues.

- **Debugging Tips**:
  - Interactive debugging can be done using Node Inspector or Chrome DevTools.

## Final Verification Steps
- **Confirming Successful Deployment**:
  - Visit `http://localhost:3000` in your web browser. You should see the welcome page.

- **Running Tests**:
   Execute the following command to run automated tests:
   ```bash
   npm test
   ```  
