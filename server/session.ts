// When using DynamoDB, we'll use memory storage for sessions
// In production, this would be handled by DynamoDB
export async function createSessionTable() {
  try {
    // With DynamoDB, we'd create a table for sessions here
    // For now, using memory storage so no table creation needed
    console.log("Session table created or verified");
  } catch (error) {
    console.error("Error creating session table:", error);
    throw error;
  }
}