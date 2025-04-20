import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { registerServiceWorker } from "./pwa-register";

// Register service worker for PWA support
registerServiceWorker();

// Create the root element
const rootElement = document.getElementById("root");

// Render the app with providers
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
