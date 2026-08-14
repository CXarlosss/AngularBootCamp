import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CoachClientStore } from './coach-client.store';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { ProgressPhotoService } from '../../../core/services/progress-photo.service';

import { ClientHeaderComponent } from './components/client-header/client-header.component';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { PhotoGalleryComponent, PhotoIndexItem } from './components/photo-comparison/photo-gallery.component';
import { PhotoComparisonComponent } from './components/photo-comparison/photo-comparison.component';
import { CoachNotesComponent } from './components/coach-notes/coach-notes.component';
import { CollapsibleSectionComponent } from '../../../shared/components/collapsible-section/collapsible-section.component';

@Component({
  selector: 'app-client-progress-page',
  standalone: true,
  imports: [
    CommonModule,
    ClientHeaderComponent,
    KpiCardsComponent,
    PhotoGalleryComponent,
    PhotoComparisonComponent,
    CoachNotesComponent,
    CollapsibleSectionComponent
  ],
  template: `
    @if (store.loading()) {
      <div class="p-6 space-y-4 animate-pulse">
        <div class="h-20 bg-gray-200 rounded-lg"></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="h-24 bg-gray-200 rounded-lg"></div>
          <div class="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    } @else if (store.error()) {
      <div class="p-6 text-center">
        <p class="text-red-500 mb-4">{{ store.error() }}</p>
        <button (click)="reload()" class="px-4 py-2 bg-blue-600 text-white rounded">Reintentar</button>
      </div>
    } @else {
      <div class="client-progress-container max-w-3xl mx-auto bg-gray-50 min-h-screen pb-20">
        <!-- Sticky Header -->
        <app-client-header 
          [profile]="store.snapshot()?.profile!"
          [isAtRisk]="store.isAtRisk()"
          [daysSince]="store.daysSinceLastWorkout()"
          [lastActive]="store.snapshot()?.profile?.last_active ?? null"
          (action)="onHeaderAction($event)"
        />
        
        <!-- KPIs -->
        <app-kpi-cards 
          [data]="kpiData()"
        />
        
        <div class="sections-accordion mt-4 bg-white border-t border-b border-gray-200">
          
          <!-- PRs recientes (Mock for Accordion default) -->
          <app-collapsible-section 
            title="🏋️ PRs Recientes" 
            [badge]="store.snapshot()?.recent_prs?.length"
            sectionId="prs"
            [clientId]="store.clientId()!"
            [forceOpen]="store.isAtRisk()"
            (toggled)="onSectionToggled('prs', $event)"
          >
            @if (store.snapshot()?.recent_prs?.length === 0) {
              <p class="text-sm text-gray-500 p-2">No hay récords personales recientes.</p>
            } @else {
              <ul class="text-sm space-y-2 px-2">
                @for (pr of store.snapshot()?.recent_prs; track pr.exercise) {
                  <li class="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span class="font-medium">{{ pr.exercise }}</span>
                    <span class="text-gray-600">{{ pr.weight }} kg</span>
                  </li>
                }
              </ul>
            }
          </app-collapsible-section>
          
          <!-- Fotos de progreso -->
          <app-collapsible-section 
            title="📸 Fotos de Progreso"
            [badge]="photosIndex().length || 'sin fotos aún'"
            sectionId="photos"
            [clientId]="store.clientId()!"
            (toggled)="onSectionToggled('photos', $event)"
          >
            <app-photo-gallery 
              [photos]="photosIndex()"
              (openComparison)="onOpenComparison()"
              (selectedPhotos)="onPhotosSelected($event)"
            />
          </app-collapsible-section>
          
          <!-- Notas del coach -->
          <app-collapsible-section 
            title="📝 Notas Privadas"
            sectionId="notes"
            [clientId]="store.clientId()!"
            (toggled)="onSectionToggled('notes', $event)"
          >
            <app-coach-notes [clientId]="store.clientId()!" />
          </app-collapsible-section>
          
        </div>
      </div>
    }

    <!-- Lightbox de Comparación -->
    @if (isComparisonOpen() && comparisonUrls()) {
      <app-photo-comparison 
        [beforeUrl]="comparisonUrls()!.before"
        [afterUrl]="comparisonUrls()!.after"
        [beforeDate]="comparisonDates().before"
        [afterDate]="comparisonDates().after"
        (close)="closeComparison()"
        (reloadUrl)="reloadPhotoUrl($event)"
      />
    }
  `
})
export default class ClientProgressPage {
  store = inject(CoachClientStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private telemetry = inject(TelemetryService);
  private photoService = inject(ProgressPhotoService);
  
  photosIndex = computed(() => {
    // Transform to internal interface
    return this.store.photosIndex().map(p => ({
      ...p,
      has_thumbnail: !!p.thumbnail_path
    })) as PhotoIndexItem[];
  });

  kpiData = computed(() => ({
    adherence: this.store.adherenceRate(),
    adherenceTrend: this.store.adherenceTrend(),
    volumeTrend: this.store.volumeTrend(),
    daysSince: this.store.daysSinceLastWorkout(),
    prsCount: this.store.snapshot()?.recent_prs?.length ?? 0,
    lastWorkoutDate: this.store.snapshot()?.last_workout?.date ?? null,
    targetWeight: this.store.snapshot()?.profile?.target_weight ?? null,
    currentWeight: this.store.snapshot()?.weight_logs?.[0]?.weight ?? null,
    lastVolume: this.store.snapshot()?.volume_trend?.[0]?.total_volume
  }));

  selectedPhotosForComparison = signal<PhotoIndexItem[]>([]);
  isComparisonOpen = signal(false);
  comparisonUrls = signal<{ before: string, after: string } | null>(null);

  comparisonDates = computed(() => {
    const photos = this.selectedPhotosForComparison();
    if (photos.length === 2) {
      return { before: photos[0].created_at, after: photos[1].created_at };
    }
    return { before: '', after: '' };
  });

  constructor() {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (!clientId) {
      this.router.navigate(['/coach/dashboard']);
      return;
    }
    
    this.store.loadClient(clientId);
    
    // Telemetry - Detail viewed
    effect(() => {
      if (!this.store.loading() && this.store.snapshot()) {
        this.telemetry.track('coach_client_detail_viewed', { 
          client_id: clientId,
          is_at_risk: this.store.isAtRisk() 
        });
      }
    });
  }
  
  reload() {
    const id = this.store.clientId();
    if (id) this.store.loadClient(id);
  }
  
  onHeaderAction(action: string) {
    const clientId = this.store.clientId();
    if (!clientId) return;

    this.telemetry.track('coach_intervention_sent', { client_id: clientId, type: action });

    if (action === 'chat' || action === 'send-reminder') {
      this.router.navigate(['/coach/inbox', clientId], { state: { returnUrl: this.router.url } });
    } else if (action === 'adjust-routine') {
      // Navegar preseleccionando rutina actual
      this.router.navigate(['/coach/routines/builder'], { queryParams: { clientId }, state: { returnUrl: this.router.url } });
    }
  }

  onSectionToggled(sectionId: string, isOpen: boolean) {
    if (isOpen) {
      this.telemetry.track('coach_section_toggled', { client_id: this.store.clientId(), section: sectionId });
    }
  }

  onPhotosSelected(photos: PhotoIndexItem[]) {
    this.selectedPhotosForComparison.set(photos);
  }

  async onOpenComparison() {
    const photos = this.selectedPhotosForComparison();
    if (photos.length !== 2) return;

    this.telemetry.track('coach_photo_compared', { client_id: this.store.clientId() });

    try {
      const urls = await this.photoService.getComparisonUrls({
        before: photos[0].has_thumbnail ? photos[0].thumbnail_path! : photos[0].storage_path,
        after: photos[1].has_thumbnail ? photos[1].thumbnail_path! : photos[1].storage_path
      });
      this.comparisonUrls.set(urls);
      this.isComparisonOpen.set(true);
    } catch (e) {
      console.error('Error al generar URLs de comparación', e);
    }
  }

  closeComparison() {
    this.isComparisonOpen.set(false);
  }

  async reloadPhotoUrl(type: 'before' | 'after') {
    const photos = this.selectedPhotosForComparison();
    if (photos.length !== 2) return;

    const photo = type === 'before' ? photos[0] : photos[1];
    try {
      const url = await this.photoService.getSignedUrl(
        photo.has_thumbnail ? photo.thumbnail_path! : photo.storage_path,
        3600
      );
      
      this.comparisonUrls.update(current => {
        if (!current) return current;
        return { ...current, [type]: url };
      });
    } catch (e) {
      console.error('Failed to reload photo URL', e);
    }
  }
}
