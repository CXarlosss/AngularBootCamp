import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Chart.js tree-shaking: solo registramos lo que usamos
import {
  Chart,
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale,
  Filler, Tooltip
} from 'chart.js';

Chart.register(
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale,
  Filler, Tooltip
);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
