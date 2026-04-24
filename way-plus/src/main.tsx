import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './app/providers/i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}
