import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/RootLayout';

// Error Boundary Fallback Component
const ErrorFallback = ({ error }: { error: any }) => (
  <div style={{
    padding: 40, textAlign: 'center', background: '#FFF1F2', color: '#BE123C',
    borderRadius: 24, margin: 20, border: '2px solid #FECDD3'
  }}>
    <h2 style={{ fontWeight: 900 }}>🚨 Error al cargar esta página</h2>
    <p style={{ opacity: 0.8 }}>{error?.message || 'Error desconocido'}</p>
    <p style={{ fontSize: 12, marginTop: 10 }}>Verifica que el archivo del componente exista en la ruta especificada.</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        background: '#BE123C', color: '#fff', border: 'none', padding: '10px 20px',
        borderRadius: 12, fontWeight: 700, marginTop: 10, cursor: 'pointer'
      }}
    >
      Reintentar
    </button>
  </div>
);

// Lazy imports (Handling named exports)
const LevelSelectPage = lazy(() => import('@/features/player/pages/LevelSelectPage').then(m => ({ default: m.LevelSelectPage })));
const StepDetailsPage = lazy(() => import('@/features/player/pages/StepDetailsPage').then(m => ({ default: m.StepDetailsPage })));
const WayPlayerPage = lazy(() => import('@/features/content/pages/WayPlayerPage').then(m => ({ default: m.WayPlayerPage })));
const AnnexesHubPage = lazy(() => import('@/features/annexes/pages/AnnexesHubPage').then(m => ({ default: m.AnnexesHubPage })));
const RelaxationTrackerPage = lazy(() => import('@/features/annexes/pages/RelaxationTrackerPage').then(m => ({ default: m.RelaxationTrackerPage })));
const SelfCheckPage = lazy(() => import('@/features/annexes/pages/SelfCheckPage').then(m => ({ default: m.SelfCheckPage })));
const RoleplayGuidePage = lazy(() => import('@/features/annexes/pages/RoleplayGuidePage').then(m => ({ default: m.RoleplayGuidePage })));
const RewardsBackpack = lazy(() => import('@/features/rewards/pages/RewardsBackpack').then(m => ({ default: m.RewardsBackpack })));
const RewardsShopPage = lazy(() => import('@/features/rewards/pages/RewardsShopPage').then(m => ({ default: m.RewardsShopPage })));
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage').then(m => ({ default: m.AuthPage })));
const TherapistDashboard = lazy(() => import('@/features/therapist/pages/TherapistDashboard').then(m => ({ default: m.TherapistDashboard })));
const WayEditorPage = lazy(() => import('@/features/editor/pages/WayEditorPage').then(m => ({ default: m.WayEditorPage })));
const ZenModePage = lazy(() => import('@/features/annexes/pages/ZenModePage').then(m => ({ default: m.ZenModePage })));
const ParentsDashboard = lazy(() => import('@/features/parents/pages/ParentsDashboard').then(m => ({ default: m.ParentsDashboard })));

const Load = (Component: React.ComponentType) => (
  <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontWeight: 800, color: '#4F46E5' }}>Cargando módulo...</div>}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorFallback error={{ message: 'Error crítico en el router' }} />,
    children: [
      { index: true, element: Load(LevelSelectPage) },
      { 
        path: 'auth', 
        element: Load(AuthPage) 
      },
      { 
        path: 'play/:levelId/:stepId', 
        element: Load(StepDetailsPage) 
      },
      { 
        path: 'play/:levelId/:stepId/:wayId', 
        element: Load(WayPlayerPage) 
      },
      { 
        path: 'editor', 
        element: Load(WayEditorPage) 
      },
      { 
        path: 'dashboard', 
        element: Load(TherapistDashboard) 
      },
      { 
        path: 'therapist', 
        element: Load(TherapistDashboard) 
      },
      { 
        path: 'terapeuta', 
        element: Load(TherapistDashboard) 
      },
      { 
        path: 'annexes', 
        element: Load(AnnexesHubPage) 
      },
      { 
        path: 'backpack', 
        element: Load(RewardsBackpack) 
      },
      { 
        path: 'shop', 
        element: Load(RewardsShopPage) 
      },
      { 
        path: 'annexes/relaxation', 
        element: Load(RelaxationTrackerPage) 
      },
      { 
        path: 'annexes/self-check', 
        element: Load(SelfCheckPage) 
      },
      { 
        path: 'annexes/role-play', 
        element: Load(RoleplayGuidePage) 
      },
      { 
        path: 'album', 
        element: Load(RewardsBackpack) 
      },
      {
        path: 'zen',
        element: Load(ZenModePage)
      },
      {
        path: 'family',
        element: Load(ParentsDashboard)
      },
      {
        path: 'padres',
        element: Load(ParentsDashboard)
      },
    ],
  },
]);
