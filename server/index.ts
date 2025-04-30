import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createSessionTable } from "./session";
import { createStorage } from "./storage-factory";
import { MemStorage, IStorage } from "./storage";

// Add global declaration for typescript
declare global {
  // eslint-disable-next-line no-var
  var storageInstance: IStorage | undefined;
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

(async () => {
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
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 3000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
