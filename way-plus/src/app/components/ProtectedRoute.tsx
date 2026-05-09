/**
 * ProtectedRoute.tsx
 * Guard que protege rutas que requieren autenticación.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';

const C = {
  indigo: '#4F46E5',
  bg: '#F8FAFF',
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg,
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `3px solid ${C.indigo}`,
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 14, color: '#6B7280', fontWeight: 600 }}>
          Verificando sesión…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
