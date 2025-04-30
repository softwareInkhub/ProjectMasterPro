/**
 * Storage factory - creates the appropriate storage implementation 
 * based on available configuration
 */

import { IStorage } from "./storage";
import { MemStorage } from "./storage";
import { DynamoDBStorage } from "./dynamodb-storage";
import { createAllTables } from "./dynamodb-tables";

// Use global storage instance to ensure consistency across files
declare global {
  var storageInstance: IStorage | undefined;
}

/**
 * Determines if AWS credentials are available
 */
function hasAwsCredentials(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

/**
 * Creates and initializes the appropriate storage implementation
 * Falls back to MemStorage if DynamoDB fails
 */
export async function createStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // Always check for AWS credentials first
  if (hasAwsCredentials()) {
    try {
      console.log("AWS credentials found, attempting to use DynamoDB storage");
      
      // Try to initialize DynamoDB tables (even if this fails, we'll handle it)
      try {
        await createAllTables();
        console.log("Successfully created DynamoDB tables");
      } catch (tableError) {
        console.error("Error creating DynamoDB tables:", tableError);
        // Continue anyway - tables might already exist
      }
      
      // Try to create a DynamoDB storage instance
      try {
        console.log("Initializing DynamoDB storage...");
        const dynamoDbStorage = new DynamoDBStorage();
        
        // Test connection by trying a simple operation
        console.log("Testing DynamoDB connection...");
        const companies = await dynamoDbStorage.getCompanies();
        console.log(`DynamoDB connection successful, found ${companies.length} companies`);
        
        // If we get here, DynamoDB is working
        storageInstance = dynamoDbStorage;
        return storageInstance;
      } catch (connectionError) {
        console.error("Error connecting to DynamoDB:", connectionError);
        console.log("Falling back to in-memory storage");
      }
    } catch (error) {
      console.error("Error initializing DynamoDB storage:", error);
      console.log("Falling back to in-memory storage");
    }
  } else {
    console.log("No AWS credentials found, using in-memory storage");
  }

  // Default to in-memory storage if DynamoDB setup failed
  console.log("Initializing in-memory storage");
  storageInstance = new MemStorage();
  return storageInstance;
}

/**
 * Gets the current storage instance
 * Creates a new one if none exists
 */
export async function getStorage(): Promise<IStorage> {
  if (!storageInstance) {
    return createStorage();
  }
  return storageInstance;
}