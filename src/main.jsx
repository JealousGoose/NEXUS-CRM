import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ─── Register Service Worker for offline support ───
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[NEXUS] SW registered, scope:', registration.scope);

        // Check for updates periodically (every 60 min)
        setInterval(() => {
          registration.update();
        }, 1000 * 60 * 60);

        // Notify user when a new version is available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('[NEXUS] New version available — refresh to update.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('[NEXUS] SW registration failed:', error);
      });
  });
}
