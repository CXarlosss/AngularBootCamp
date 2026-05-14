import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { supabase } from '../../../../../core/supabase.client';

interface PhotoGroup {
  date: string;
  photos: { url: string; type: string }[];
}

@Component({
  selector: 'app-client-photos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="photos-container">
      <div class="photos-header">
        <h3 class="section-title">Fotos de Progreso</h3>
        <button class="btn-compare-mode" 
                [class.active]="comparisonMode()"
                (click)="toggleComparisonMode()">
          {{ comparisonMode() ? 'Cancelar Selección' : 'Comparar Fotos' }}
        </button>
      </div>

      @if (comparisonMode()) {
        <div class="comparison-bar" [class.visible]="selectedPhotos().length > 0">
          <p>Seleccionadas: {{ selectedPhotos().length }} / 2</p>
          @if (selectedPhotos().length === 2) {
            <button class="btn-start-comparison" (click)="showComparison.set(true)">
              Ver Comparativa
            </button>
          }
        </div>
      }

      @if (loading()) {
        <div class="skeleton-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-photo"></div>
          }
        </div>
      } @else if (!groups().length) {
        <div class="empty-state">
          <span class="empty-icon">📷</span>
          <p>Sin fotos de progreso aún</p>
        </div>
      } @else {
        @for (group of groups(); track group.date) {
          <div class="photo-group">
            <p class="group-date">{{ group.date | date:'d MMM yyyy' }}</p>
            <div class="photo-grid">
              @for (photo of group.photos; track photo.url) {
                <div class="photo-slot" 
                     [class.selectable]="comparisonMode()"
                     [class.selected]="isPhotoSelected(photo.url)"
                     (click)="onPhotoClick(photo)">
                  <img [src]="photo.url" [alt]="photo.type" loading="lazy" />
                  <span class="photo-label">{{ photo.type }}</span>
                  @if (comparisonMode()) {
                    <div class="selection-indicator">
                      @if (isPhotoSelected(photo.url)) {
                        <span class="check">✓</span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      }
    </div>

    @if (lightboxUrl()) {
      <div class="lightbox" (click)="closeLightbox()">
        <img [src]="lightboxUrl()!" />
      </div>
    }

    <!-- Modal de Comparativa -->
    @if (showComparison()) {
      <div class="comparison-overlay" (click)="showComparison.set(false)">
        <div class="comparison-modal" (click)="$event.stopPropagation()">
          <header class="comp-header">
            <h3>Comparativa de Progreso</h3>
            <button class="btn-close" (click)="showComparison.set(false)">✕</button>
          </header>
          <div class="comp-body">
            <div class="comp-item">
              <span class="comp-label">Anterior ({{ selectedPhotos()[0].date | date:'d MMM' }})</span>
              <img [src]="selectedPhotos()[0].url" />
            </div>
            <div class="comp-item">
              <span class="comp-label">Actual ({{ selectedPhotos()[1].date | date:'d MMM' }})</span>
              <img [src]="selectedPhotos()[1].url" />
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .photos-container { padding: 16px; position: relative; }
    .photos-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .section-title { font-size: 18px; font-weight: 800; color: #fff; margin: 0; }
    
    .btn-compare-mode {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ccc;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
    }
    .btn-compare-mode.active { background: #1D9E75; color: white; border-color: #1D9E75; }
    
    .comparison-bar {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(29, 158, 117, 0.95);
      backdrop-filter: blur(10px);
      margin: -16px -16px 24px;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      font-weight: 700;
      transform: translateY(-100%);
      transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .comparison-bar.visible { transform: translateY(0); }
    .btn-start-comparison {
      background: white;
      color: #1D9E75;
      border: none;
      padding: 6px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }

    .photo-group { margin-bottom: 24px; }
    .group-date { font-size: 14px; font-weight: 700; color: #888; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .photo-slot { position: relative; aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s; }
    .photo-slot:hover { transform: scale(1.02); border-color: #1D9E75; }
    .photo-slot img { width: 100%; height: 100%; object-fit: cover; }
    
    .photo-slot.selected { border: 3px solid #1D9E75; }
    .selection-indicator {
      position: absolute;
      top: 8px; right: 8px;
      width: 24px; height: 24px;
      border-radius: 50%;
      background: rgba(0,0,0,0.3);
      border: 2px solid white;
      display: flex; align-items: center; justify-content: center;
    }
    .photo-slot.selected .selection-indicator { background: #1D9E75; border-color: #1D9E75; }
    .selection-indicator .check { color: white; font-weight: 900; font-size: 14px; }

    .photo-label { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .skeleton-photo { aspect-ratio: 3/4; background: rgba(255,255,255,0.03); border-radius: 12px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    
    .empty-state { padding: 60px 20px; text-align: center; color: #444; }
    .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
    
    .lightbox { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .lightbox img { max-width: 100%; max-height: 100%; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

    /* Comparativa */
    .comparison-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .comparison-modal { background: #111; width: 100%; max-width: 1000px; border-radius: 24px; overflow: hidden; border: 1px solid #333; }
    .comp-header { padding: 20px 24px; display: flex; justify-content: space-between; border-bottom: 1px solid #222; }
    .comp-header h3 { margin: 0; color: white; }
    .btn-close { background: none; border: none; color: #666; font-size: 24px; cursor: pointer; }
    .comp-body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 24px; }
    .comp-item { display: flex; flex-direction: column; gap: 12px; }
    .comp-label { color: #888; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .comp-item img { width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 12px; border: 1px solid #333; }
  `]
})
export class ClientPhotosComponent implements OnInit {
  @Input({ required: true }) clientId!: string;

  private sb = supabase;

  loading = signal(true);
  groups = signal<PhotoGroup[]>([]);
  lightboxUrl = signal<string | null>(null);

  // Comparativa
  comparisonMode = signal(false);
  selectedPhotos = signal<{ url: string; date: string }[]>([]);
  showComparison = signal(false);

  async ngOnInit() {
    await this.loadPhotos();
  }

  toggleComparisonMode() {
    this.comparisonMode.set(!this.comparisonMode());
    this.selectedPhotos.set([]);
  }

  isPhotoSelected(url: string): boolean {
    return this.selectedPhotos().some(p => p.url === url);
  }

  onPhotoClick(photo: { url: string }, date?: string) {
    if (this.comparisonMode()) {
      const current = this.selectedPhotos();
      if (this.isPhotoSelected(photo.url)) {
        this.selectedPhotos.set(current.filter(p => p.url !== photo.url));
      } else if (current.length < 2) {
        // Necesitamos encontrar el grupo para obtener la fecha si no se pasa
        const photoDate = date || this.groups().find(g => g.photos.some(p => p.url === photo.url))?.date || '';
        this.selectedPhotos.set([...current, { url: photo.url, date: photoDate }]);
      }
    } else {
      this.openLightbox(photo.url);
    }
  }

  async loadPhotos() {
    this.loading.set(true);

    const { data: files } = await this.sb.storage
      .from('progress-photos')
      .list(this.clientId, { sortBy: { column: 'created_at', order: 'desc' } });

    if (!files?.length) {
      this.loading.set(false);
      return;
    }

    // Generar todas las signed URLs en paralelo
    const urlResults = await Promise.all(
      files.map(file =>
        this.sb.storage
          .from('progress-photos')
          .createSignedUrl(`${this.clientId}/${file.name}`, 3600)
      )
    );

    const byDate = new Map<string, { url: string; type: string }[]>();

    files.forEach((file, i) => {
      const signedUrl = urlResults[i].data?.signedUrl;
      if (!signedUrl) return;

      // Formato esperado: YYYY-MM-DD_tipo.jpg
      const nameParts = file.name.replace(/\.[^/.]+$/, '').split('_');
      const date = nameParts[0] || 'Sin fecha';
      const type = nameParts[1] || 'Foto';

      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push({ url: signedUrl, type });
    });

    this.groups.set(
      Array.from(byDate.entries()).map(([date, photos]) => ({ date, photos }))
    );
    this.loading.set(false);
  }

  openLightbox(url: string) { this.lightboxUrl.set(url); }
  closeLightbox() { this.lightboxUrl.set(null); }
}
