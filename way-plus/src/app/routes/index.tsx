import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/RootLayout';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { ScrollToTop } from '@/app/components/ScrollToTop';

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
const PlayerLoginPage = lazy(() => import('@/features/player/pages/PlayerLoginPage').then(m => ({ default: m.PlayerLoginPage })));
const PlayerStartPage = lazy(() => import('@/features/player/pages/PlayerStartPage').then(m => ({ default: m.PlayerStartPage })));
const LevelSelectPage = lazy(() => import('@/features/player/pages/LevelSelectPage').then(m => ({ default: m.LevelSelectPage })));
const StepDetailsPage = lazy(() => import('@/features/player/pages/StepDetailsPage').then(m => ({ default: m.StepDetailsPage })));
const WayPlayerPage = lazy(() => import('@/features/content/pages/WayPlayerPage').then(m => ({ default: m.WayPlayerPage })));
const AnnexesHubPage = lazy(() => import('@/features/annexes/pages/AnnexesHubPage').then(m => ({ default: m.AnnexesHubPage })));
const RelaxationTrackerPage = lazy(() => import('@/features/annexes/pages/RelaxationTrackerPage').then(m => ({ default: m.RelaxationTrackerPage })));
const SelfCheckPage = lazy(() => import('@/features/annexes/pages/SelfCheckPage').then(m => ({ default: m.SelfCheckPage })));
const RoleplayGuidePage = lazy(() => import('@/features/annexes/pages/RoleplayGuidePage').then(m => ({ default: m.RoleplayGuidePage })));
const RewardsBackpack = lazy(() => import('@/features/rewards/pages/RewardsBackpack').then(m => ({ default: m.RewardsBackpack })));
const EscaparateIlusiones = lazy(() => import('@/features/rewards/pages/EscaparateIlusiones').then(m => ({ default: m.EscaparateIlusiones })));
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage').then(m => ({ default: m.AuthPage })));
const TherapistDashboard = lazy(() => import('@/features/therapist/pages/TherapistDashboard').then(m => ({ default: m.TherapistDashboard })));
const WayEditorPage = lazy(() => import('@/features/editor/pages/WayEditorPage').then(m => ({ default: m.WayEditorPage })));
const ZenModePage = lazy(() => import('@/features/annexes/pages/ZenModePage').then(m => ({ default: m.ZenModePage })));
const ParentsDashboard = lazy(() => import('@/features/parents/pages/ParentsDashboard').then(m => ({ default: m.ParentsDashboard })));
const FamilyDashboardPage = lazy(() => import('@/components/family/FamilyDashboardPage').then(m => ({ default: m.FamilyDashboardPage })));
const PatientDetailView = lazy(() => import('@/features/therapist/pages/PatientDetailView').then(m => ({ default: m.PatientDetailView })));
const PatientAnnexesView = lazy(() => import('@/features/therapist/pages/PatientAnnexesView').then(m => ({ default: m.PatientAnnexesView })));
const SessionPlayerPage = lazy(() => import('@/features/player/pages/SessionPlayerPage').then(m => ({ default: m.SessionPlayerPage })));
const SessionModePage = lazy(() => import('@/features/player/pages/SessionModePage').then(m => ({ default: m.SessionModePage })));

const LandingPage = lazy(() => import('@/features/player/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ProfilePickerPage = lazy(() => import('@/features/player/pages/ProfilePickerPage').then(m => ({ default: m.ProfilePickerPage })));

const Load = (Component: React.ComponentType) => (
  <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontWeight: 800, color: '#4F46E5' }}>Cargando módulo...</div>}>
    <ScrollToTop />
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorFallback error={{ message: 'Error crítico en el router' }} />,
    children: [
      { index: true, element: Load(PlayerStartPage) },
      { 
        path: 'inicio', 
        element: Load(LandingPage) 
      },
      { 
        path: 'welcome', 
        element: Load(LandingPage) 
      },
      { 
        path: 'player', 
        element: Load(PlayerStartPage) 
      },
      { 
        path: 'player/select-profile', 
        element: Load(ProfilePickerPage) 
      },
      { 
        path: 'player/login', 
        element: Load(PlayerLoginPage) 
      },
      { 
        path: 'player/home', 
        element: Load(LevelSelectPage) 
      },
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
        path: 'play/session', 
        element: Load(SessionPlayerPage) 
      },
      { 
        path: 'session/:patientId', 
        element: Load(SessionPlayerPage) 
      },


      { 
        path: 'editor', 
        element: Load(WayEditorPage) 
      },
      { 
        path: 'therapist', 
        element: <ProtectedRoute>{Load(TherapistDashboard)}</ProtectedRoute>
      },
      { 
        path: 'therapist/patient/:patientId', 
        element: <ProtectedRoute>{Load(PatientDetailView)}</ProtectedRoute>
      },
      { 
        path: 'therapist/patient/:patientId/annexes', 
        element: <ProtectedRoute>{Load(PatientAnnexesView)}</ProtectedRoute>
      },
      { 
        path: 'terapeuta', 
        element: <ProtectedRoute>{Load(TherapistDashboard)}</ProtectedRoute>
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
        element: Load(EscaparateIlusiones) 
      },
      { 
        path: 'escaparate', 
        element: Load(EscaparateIlusiones) 
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
      {
        path: 'family/:token',
        element: Load(FamilyDashboardPage)
      },
    ],
  },
]);
