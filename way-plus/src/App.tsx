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

import { audioService } from '@/core/utils/audioService';

export default function App() {
  React.useEffect(() => {
    const handleInteraction = () => {
      audioService.unlock();
      // Una vez desbloqueado, ya no necesitamos el listener
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
    };

    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('mousedown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<div className="flex items-center justify-center h-screen font-bold text-indigo-600">Cargando WAY+...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}
