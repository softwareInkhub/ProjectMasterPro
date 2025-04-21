// Using memory storage since DynamoDB is being used separately
import * as schema from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";

// Create a mock pool and db interface for compatibility
class MockPool {
  query() {
    return Promise.resolve({ rows: [] });
  }
}

export const pool = new MockPool();
export const db = drizzle({ client: pool as any, schema });

console.log("Using DynamoDB for data storage - PostgreSQL connection removed");
