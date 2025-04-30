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
}

// Force using memory storage for development to avoid DynamoDB errors
const FORCE_MEM_STORAGE = true;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Create a global instance of MemStorage immediately to avoid timeout
global.storageInstance = new MemStorage();
console.log("Using in-memory storage for initial startup");

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
  log(`serving on port ${port}`);
});

// Setup routes asynchronously after server is started (without WebSocket initialization)
registerRoutes(app).then(() => {
  // Initialize Vite immediately for faster UI loading
  if (app.get("env") === "development") {
    setupVite(app, httpServer).catch(error => {
      console.error("Error setting up Vite:", error);
    });
  } else {
    serveStatic(app);
  }
  
  // WebSocket is now initialized only in routes.ts, not here
});

// Initialize storage after server is already running
(async () => {
  try {
    console.log("Using in-memory storage for development environment - creating session table");
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
})();
