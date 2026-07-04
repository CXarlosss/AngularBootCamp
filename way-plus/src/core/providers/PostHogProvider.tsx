import React, { useEffect, useRef } from 'react';
import posthog from 'posthog-js';

// Idealmente leer de variables de entorno
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_mock_key_for_development_replace_me';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // En un entorno de salud, no capturamos texto por defecto para evitar PHI
        capture_pageview: true, 
        capture_pageleave: true,
        autocapture: false, // Desactivado por privacidad médica
        loaded: (ph) => {
          if (import.meta.env.DEV) {
            ph.debug(); // Solo debug en dev
          }
        }
      });
      initialized.current = true;
    }
  }, []);

  return <>{children}</>;
}
