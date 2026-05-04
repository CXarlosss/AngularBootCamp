import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './client-layout.component';
import { workoutDayGuard } from '../../core/guards/workout-day.guard';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/client-dashboard.component')
            .then(m => m.ClientDashboardComponent),
      },
      {
        path: 'workout',
        loadComponent: () =>
          import('./today-workout/today-workout.component')
            .then(m => m.TodayWorkoutComponent),
      },
      {
        path: 'workout/:dayId',
        canActivate: [workoutDayGuard],
        loadComponent: () =>
          import('./today-workout/today-workout.component')
            .then(m => m.TodayWorkoutComponent),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./progress/client-progress.component')
            .then(m => m.ClientProgressComponent),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./chat/client-chat.component')
            .then(m => m.ClientChatComponent),
      },
      {
        path: 'rank',
        loadComponent: () =>
          import('./rank/rank-page.component')
            .then(m => m.RankPageComponent),
      },
      {
        path: 'profile/frames',
        loadComponent: () =>
          import('./profile/frame-selector/frame-selector.component')
            .then(m => m.FrameSelectorComponent),
      },
      {
        path: 'profile/banner',
        loadComponent: () =>
          import('./profile/banner-selector/banner-selector.component')
            .then(m => m.BannerSelectorComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile-edit.component')
            .then(m => m.ProfileEditComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
];
