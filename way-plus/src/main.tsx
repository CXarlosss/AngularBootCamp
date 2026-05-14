import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/way-typography.css'
import './styles/progress-fix.css'
import './styles/legibility.css'
import './app/providers/i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)

// Unregister stale Service Workers to avoid 'Failed to convert value to Response' errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}
