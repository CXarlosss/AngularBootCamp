import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { LevelSelectPage } from '@/features/player/pages/LevelSelectPage';
import { WayPlayerPage } from '@/features/content/pages/WayPlayerPage';
import { AnnexesHubPage } from '@/features/annexes/pages/AnnexesHubPage';
import { RelaxationTrackerPage } from '@/features/annexes/pages/RelaxationTrackerPage';
import { SelfCheckPage } from '@/features/annexes/pages/SelfCheckPage';
import { RoleplayGuidePage } from '@/features/annexes/pages/RoleplayGuidePage';
import { RewardsBackpack } from '@/features/rewards/pages/RewardsBackpack';
import { RewardsShopPage } from '@/features/rewards/pages/RewardsShopPage';
import { AuthPage } from '@/features/auth/pages/AuthPage';
import { TherapistDashboard } from '@/features/therapist/pages/TherapistDashboard';
import { WayEditorPage } from '@/features/editor/pages/WayEditorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LevelSelectPage /> },
      { 
        path: 'auth', 
        element: <AuthPage /> 
      },
      { 
        path: 'play/:levelId/:stepId/:wayId', 
        element: <WayPlayerPage /> 
      },
      { 
        path: 'editor', 
        element: <WayEditorPage /> 
      },
      { 
        path: 'dashboard', 
        element: <TherapistDashboard /> 
      },
      { 
        path: 'therapist', 
        element: <TherapistDashboard /> 
      },
      { 
        path: 'annexes', 
        element: <AnnexesHubPage /> 
      },
      { 
        path: 'backpack', 
        element: <RewardsBackpack /> 
      },
      { 
        path: 'shop', 
        element: <RewardsShopPage /> 
      },
      { 
        path: 'anexos/relajacion', 
        element: <RelaxationTrackerPage /> 
      },
      { 
        path: 'anexos/autocomprobacion', 
        element: <SelfCheckPage /> 
      },
      { 
        path: 'anexos/roleplaying', 
        element: <RoleplayGuidePage /> 
      },
    ],
  },
]);
