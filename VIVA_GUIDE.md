# VIVA Presentation Guide

## Deployment Steps
1. **Clone the Repository**: Use the command `git clone https://github.com/Suwaathmi/UniNest.git` to clone the repository.
2. **Install Dependencies**: Navigate into the directory and run `npm install` (or the appropriate dependency manager command) to install all necessary packages.
3. **Set Up Environment Variables**: Create a `.env` file based on the provided `.env.example` and fill in the necessary configurations.
4. **Run Database Migrations**: Execute `npm run migrate` to apply any database changes.
5. **Start the Application**: Use `npm start` to launch the application.

## Jenkins Setup
1. **Install Jenkins**: Ensure Jenkins is installed. You can download it from [Jenkins.io](https://www.jenkins.io/).
2. **Create a New Job**: Go to Jenkins dashboard, click on ‘New Item’, name your job, and select either Freestyle project or Pipeline.
3. **Configure Source Code Management**:
   - Select Git as the SCM.
   - Enter the repository URL.
4. **Set Build Triggers**: For CI/CD, configure triggers such as GitHub hook trigger for GITScm polling.
5. **Build Steps**: Define the build steps (e.g., execute shell commands like `npm install` followed by `npm run test`).
6. **Post-build Actions**: Set up any post-build actions such as notifications.

## Accessing the Application
- **Local Environment**: Access the application via `http://localhost:3000` (or the configured port).
- **Production Environment**: Access the live application at the provided domain.

## Troubleshooting
- **Application Doesn't Start**: Check if there are any missing environment variables or package dependencies.
- **Jenkins Build Failures**: Look into the Jenkins build logs to diagnose issues (e.g., authentication errors, missing steps).

## Key Talking Points for CI/CD Explanation
1. **Definition of CI/CD**: Continuous Integration and Continuous Deployment ensure rapid delivery of code changes.
2. **Benefits**: Highlight aspects such as increased deployment frequency, lower failure rates, and quicker recovery.
3. **Pipeline Overview**: Explain the automated pipeline from code commit to deployment, emphasizing testing and quality checks.
4. **Architecture Explanation**: Discuss the tech stack used, how components communicate, and the role of CI/CD in maintaining infrastructure efficiency.

---