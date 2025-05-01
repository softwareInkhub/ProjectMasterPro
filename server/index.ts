import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createSessionTable } from "./session";
import { createStorage } from "./storage-factory";
import { MemStorage, IStorage } from "./storage";
import { createServer } from "http";
import { setupWebSocketServer } from "./websocket";

// Add global declaration for typescript
declare global {
  // eslint-disable-next-line no-var
  var storageInstance: IStorage | undefined;
  // Flag to track if WebSocket server has been initialized
  var webSocketInitialized: boolean;
  // Flag to check if port has been opened
  var portOpened: boolean;
}

// Use DynamoDB for storage
const FORCE_MEM_STORAGE = false;
const app = express();

// Use minimal middleware for faster startup
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Create a global instance of MemStorage immediately to avoid timeout
global.storageInstance = new MemStorage();
console.log("Using in-memory storage for initial startup");

// Initialize global flags
global.webSocketInitialized = false;
global.portOpened = false;

// Simplified logging middleware to improve startup time
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
  }
  next();
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

// Create HTTP server directly
const httpServer = createServer(app);
const port = 3000;

// Store the server reference in the app for later use by WebSockets
app.set('http-server', httpServer);

// Start the server immediately without waiting for other initialization
httpServer.listen(port, "0.0.0.0", () => {
  // Signal that the port is open
  global.portOpened = true;
  log(`serving on port ${port}`);
});

// Run the most important parts of startup process in parallel
Promise.all([
  // Setup routes asynchronously
  registerRoutes(app),
  // Setup Vite in parallel (if in development)
  app.get("env") === "development" ? setupVite(app, httpServer) : Promise.resolve(serveStatic(app))
]).catch(error => {
  console.error("Error during parallel initialization:", error);
});

// Initialize storage in a non-blocking way after server is already running
setTimeout(async () => {
  try {
    console.log("Creating session table for DynamoDB storage");
    // Create session table if it doesn't exist
    await createSessionTable();
    
    // Initialize storage with appropriate implementation
    try {
      console.log("Initializing storage...");
      if (FORCE_MEM_STORAGE) {
        console.log("Forcing in-memory storage for development environment");
        // Set the global storage instance to MemStorage
        global.storageInstance = new MemStorage();
      } else {
        await createStorage();
      }
      console.log("Storage initialization complete");
    } catch (error) {
      console.error("Error initializing storage:", error);
      console.log("Falling back to in-memory storage");
      global.storageInstance = new MemStorage();
    }
  } catch (error) {
    console.error("Error during background initialization:", error);
  }
}, 0); // Execute immediately but after current call stack
