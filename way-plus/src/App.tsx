import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/routes';
import { SyncManager } from './core/components/SyncManager';
import { AuthProvider } from '@/app/providers/AuthContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Filtro de errores espurios de extensiones del navegador
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    if (message.includes('tabs:outgoing.message.ready')) return;
    if (message.includes('No Listener')) return;
    originalError.apply(console, args);
  };
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<div className="flex items-center justify-center h-screen font-bold text-indigo-600">Cargando WAY+...</div>}>
          <SyncManager />
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}
