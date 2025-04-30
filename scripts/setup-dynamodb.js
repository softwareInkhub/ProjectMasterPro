/**
 * Script to initialize DynamoDB tables for the application
 */

const { DynamoDBClient, ListTablesCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Define the tables to create
const TABLES = [
  {
    name: 'Companies',
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    indexes: []
  },
  {
    name: 'Users',
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    attributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    indexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ]
  }
];

// Function to create tables
async function createTables() {
  try {
    // First check what tables already exist
    const existingTables = await dynamoClient.send(new ListTablesCommand({}));
    const tableNames = existingTables.TableNames || [];
    
    console.log('Existing tables:', tableNames);
    
    // Create each table if it doesn't exist
    for (const table of TABLES) {
      if (!tableNames.includes(table.name)) {
        console.log(`Creating table: ${table.name}`);
        
        const params = {
          TableName: table.name,
          KeySchema: table.keySchema,
          AttributeDefinitions: table.attributeDefinitions,
          BillingMode: 'PAY_PER_REQUEST',
          GlobalSecondaryIndexes: table.indexes.length > 0 ? table.indexes : undefined
        };
        
        try {
          await dynamoClient.send(new CreateTableCommand(params));
          console.log(`Table ${table.name} created successfully.`);
        } catch (err) {
          console.error(`Error creating table ${table.name}:`, err);
        }
      } else {
        console.log(`Table ${table.name} already exists.`);
      }
    }
    
    console.log('DynamoDB setup complete!');
  } catch (err) {
    console.error('Error setting up DynamoDB tables:', err);
  }
}

// Execute the function
createTables();