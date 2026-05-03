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
                <div class="photo-slot" (click)="openLightbox(photo.url)">
                  <img [src]="photo.url" [alt]="photo.type" loading="lazy" />
                  <span class="photo-label">{{ photo.type }}</span>
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
  `,
  styles: [`
    .photos-container { padding: 16px; }
    .photo-group { margin-bottom: 24px; }
    .group-date { font-size: 14px; font-weight: 700; color: #888; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .photo-slot { position: relative; aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s; }
    .photo-slot:hover { transform: scale(1.02); border-color: #1D9E75; }
    .photo-slot img { width: 100%; height: 100%; object-fit: cover; }
    
    .photo-label { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .skeleton-photo { aspect-ratio: 3/4; background: rgba(255,255,255,0.03); border-radius: 12px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    
    .empty-state { padding: 60px 20px; text-align: center; color: #444; }
    .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
    
    .lightbox { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .lightbox img { max-width: 100%; max-height: 100%; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
  `]
})
export class ClientPhotosComponent implements OnInit {
  @Input({ required: true }) clientId!: string;

  private sb = supabase;

  loading = signal(true);
  groups = signal<PhotoGroup[]>([]);
  lightboxUrl = signal<string | null>(null);

  async ngOnInit() {
    await this.loadPhotos();
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
