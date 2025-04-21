# Project Management System: Deployment Guide

This guide provides detailed instructions for deploying the Project Management System application with DynamoDB for data persistence.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Local Deployment](#local-deployment)
4. [Production Deployment](#production-deployment)
5. [Database Migration](#database-migration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the application, ensure you have the following:

- Node.js 18+ and npm
- AWS account with appropriate permissions to create and manage DynamoDB tables
- AWS CLI installed and configured (for local development)
- Git for version control
- SSL certificate for production deployment (optional but recommended)

## Environment Variables

The application requires several environment variables to be set for proper operation. Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=production  # Use 'development' for local development
SESSION_SECRET=your-strong-session-secret-key

# Authentication
JWT_SECRET=your-strong-jwt-secret-key
JWT_EXPIRATION=24h  # Token expiration time

# AWS Configuration for DynamoDB
AWS_REGION=us-east-1  # AWS region where your DynamoDB tables are located
AWS_ACCESS_KEY_ID=your-access-key  # AWS access key with DynamoDB permissions
AWS_SECRET_ACCESS_KEY=your-secret-key  # AWS secret access key
AWS_DYNAMODB_ENDPOINT=https://dynamodb.us-east-1.amazonaws.com  # Optional: For local DynamoDB, use http://localhost:8000

# WebSocket Configuration
WS_PORT=5001  # Optional: Separate port for WebSocket server
```

### Important Notes about Environment Variables

1. **Security**: Never commit sensitive credentials to your repository. Use environment variables or a secrets management service in production.
2. **JWT Secrets**: Use strong, randomly generated secrets for both `SESSION_SECRET` and `JWT_SECRET`.
3. **AWS Credentials**: 
   - For local development, you can use AWS CLI profile configuration
   - For production, use IAM roles when possible instead of hardcoded credentials
   - Ensure the AWS user has the minimum necessary permissions for DynamoDB operations

## Local Deployment

Follow these steps to deploy the application locally:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd project-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Create a `.env` file as described in the previous section
   - For local development, set `NODE_ENV=development`

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application should now be running at http://localhost:5000

## Production Deployment

### Option 1: Standard Server Deployment

1. **Clone the repository on your server**:
   ```bash
   git clone <repository-url>
   cd project-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install --production
   ```

3. **Configure environment variables**:
   - Create a `.env` file or set them in your hosting environment
   - Ensure `NODE_ENV=production`

4. **Build the frontend**:
   ```bash
   npm run build
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Use a process manager** (recommended):
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start npm --name "project-management" -- start
   pm2 save
   ```

### Option 2: Docker Deployment

1. **Build Docker image**:
   ```bash
   docker build -t project-management-system .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 5000:5000 --name pms \
     -e NODE_ENV=production \
     -e SESSION_SECRET=your-session-secret \
     -e JWT_SECRET=your-jwt-secret \
     -e JWT_EXPIRATION=24h \
     -e AWS_REGION=us-east-1 \
     -e AWS_ACCESS_KEY_ID=your-access-key \
     -e AWS_SECRET_ACCESS_KEY=your-secret-key \
     project-management-system
   ```

### Option 3: Cloud Platform Deployment

#### AWS Elastic Beanstalk

1. **Install the EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB application**:
   ```bash
   eb init
   ```

3. **Create an environment and deploy**:
   ```bash
   eb create production-environment
   ```

4. **Configure environment variables**:
   ```bash
   eb setenv NODE_ENV=production SESSION_SECRET=your-secret JWT_SECRET=your-jwt-secret
   ```

#### Heroku

1. **Login to Heroku and create an app**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-session-secret
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set JWT_EXPIRATION=24h
   heroku config:set AWS_REGION=us-east-1
   heroku config:set AWS_ACCESS_KEY_ID=your-access-key
   heroku config:set AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

3. **Deploy to Heroku**:
   ```bash
   git push heroku main
   ```

## Database Migration

When migrating from PostgreSQL to DynamoDB, follow these steps:

1. **Export existing data** from PostgreSQL:
   ```bash
   # Example using pg_dump
   pg_dump -U username -d database_name -f data_backup.sql
   ```

2. **Transform data format** for DynamoDB:
   - Create a migration script to convert SQL data to DynamoDB format
   - Remember that DynamoDB uses a NoSQL data model, so you may need to denormalize
   - Consider using a tool like AWS Data Pipeline for large datasets

3. **Create DynamoDB tables**:
   ```bash
   # Using AWS CLI to create a table
   aws dynamodb create-table \
     --table-name Users \
     --attribute-definitions AttributeName=id,AttributeType=S \
     --key-schema AttributeName=id,KeyType=HASH \
     --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
   ```

4. **Import data** to DynamoDB:
   ```bash
   # Example using AWS CLI to batch write items
   aws dynamodb batch-write-item --request-items file://users-data.json
   ```

5. **Verify data integrity**:
   - Check that all records were imported correctly
   - Run test queries to ensure data accessibility
   - Validate relationships and data structure

## Monitoring & Maintenance

### Monitoring

1. **Application Monitoring**:
   - Set up logging with a service like CloudWatch, Loggly, or ELK stack
   - Monitor application health and performance

2. **DynamoDB Monitoring**:
   - Track read/write capacity units
   - Monitor throttling events
   - Set up alarms for high table utilization

3. **Server Monitoring**:
   - CPU and memory usage
   - Disk space and I/O
   - Network traffic

### Maintenance

1. **Backup Strategy**:
   - Enable DynamoDB point-in-time recovery
   - Schedule regular backups

2. **Scaling DynamoDB**:
   - Adjust read/write capacity as needed
   - Consider auto-scaling for variable workloads

3. **Application Updates**:
   - Implement a CI/CD pipeline
   - Use blue-green deployment for zero downtime

## Troubleshooting

### Common Issues and Solutions

1. **Connection Issues**:
   - Check AWS credentials and permissions
   - Verify DynamoDB endpoint URL
   - Check network connectivity and security groups

2. **Authentication Problems**:
   - Ensure JWT_SECRET is properly set
   - Check token expiration settings
   - Verify user authentication flow

3. **Performance Issues**:
   - Review DynamoDB read/write capacity
   - Check for hot keys in your data model
   - Consider using DynamoDB Accelerator (DAX) for caching

4. **Data Consistency Issues**:
   - Remember DynamoDB's eventual consistency model
   - Use strong consistency for read operations when necessary
   - Review transaction logic in your application

### Getting Help

If you encounter issues not covered in this guide:

1. Check the GitHub repository issues section
2. Review AWS DynamoDB documentation
3. Consult the application's technical documentation
4. Contact the development team via the project's support channels

---

## Additional Resources

- [AWS DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Docker Documentation](https://docs.docker.com/)