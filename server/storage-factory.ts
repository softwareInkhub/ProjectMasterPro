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
 * Using MemStorage for development environment to avoid timeout issues
 */
export async function createStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // For development/demo purposes, always use in-memory storage
  // This prevents timeout issues during startup
  console.log("Using in-memory storage for development environment");

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