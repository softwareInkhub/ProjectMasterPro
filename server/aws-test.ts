// Simple test script to verify AWS configuration
import { s3Client, dynamoClient, iamClient } from './aws-config';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { ListUsersCommand } from '@aws-sdk/client-iam';

async function testS3() {
  try {
    console.log('Testing S3 client...');
    const response = await s3Client.send(new ListBucketsCommand({}));
    console.log('S3 buckets:', response.Buckets?.map(b => b.Name));
    return true;
  } catch (error) {
    console.error('S3 client test failed:', error);
    return false;
  }
}

async function testDynamoDB() {
  try {
    console.log('Testing DynamoDB client...');
    const response = await dynamoClient.send(new ListTablesCommand({}));
    console.log('DynamoDB tables:', response.TableNames);
    return true;
  } catch (error) {
    console.error('DynamoDB client test failed:', error);
    return false;
  }
}

async function testIAM() {
  try {
    console.log('Testing IAM client...');
    const response = await iamClient.send(new ListUsersCommand({}));
    console.log('IAM users:', response.Users?.map(u => u.UserName));
    return true;
  } catch (error) {
    console.error('IAM client test failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting AWS integration tests...');
  
  const s3Result = await testS3();
  const dynamoResult = await testDynamoDB();
  const iamResult = await testIAM();
  
  console.log('Test results:');
  console.log('S3:', s3Result ? 'PASS' : 'FAIL');
  console.log('DynamoDB:', dynamoResult ? 'PASS' : 'FAIL');
  console.log('IAM:', iamResult ? 'PASS' : 'FAIL');
  
  const allPassed = s3Result && dynamoResult && iamResult;
  console.log(`Overall result: ${allPassed ? 'PASS' : 'FAIL'}`);
  
  return allPassed;
}

// Run the tests
runTests().then(result => {
  process.exit(result ? 0 : 1);
});

// Export for use in other files
export { runTests };