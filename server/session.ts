import { pool } from './db';

export async function createSessionTable() {
  try {
    // Create session table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    console.log("Session table created or verified");
  } catch (error) {
    console.error("Error creating session table:", error);
    throw error;
  }
}