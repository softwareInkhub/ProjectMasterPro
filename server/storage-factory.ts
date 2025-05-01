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
 */
export async function createStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // Check if AWS credentials are available
  if (hasAwsCredentials()) {
    try {
      console.log("Using real AWS credentials for DynamoDB");
      // First create all required tables if they don't exist
      await createAllTables();
      
      // Initialize DynamoDB storage
      console.log("Initializing DynamoDB storage");
      storageInstance = new DynamoDBStorage();
      return storageInstance;
    } catch (error) {
      console.error("Error setting up DynamoDB storage:", error);
      console.log("Falling back to in-memory storage");
    }
  } else {
    console.log("AWS credentials not found - using in-memory storage");
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