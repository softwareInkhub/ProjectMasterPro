export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Register the service worker from /sw.js at the root
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Setup refresh logic
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
        
      } catch (error) {
        console.error('ServiceWorker registration failed: ', error);
      }
    });
  }
}