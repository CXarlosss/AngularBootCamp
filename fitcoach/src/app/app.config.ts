import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FRAME_CELEBRATION_SERVICE } from './core/services/frame-celebration.contract';
import { FrameCelebrationService } from './core/services/frame-celebration.service';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: FRAME_CELEBRATION_SERVICE, useExisting: FrameCelebrationService },
  ],
};
