import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/routes';
import { SyncManager } from './core/components/SyncManager';
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="flex items-center justify-center h-screen font-bold text-indigo-600">Cargando WAY+...</div>}>
        <SyncManager />
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  );
}
