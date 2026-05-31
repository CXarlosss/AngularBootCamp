import { Component, input, output, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntersectionObserverService } from '../../../../../shared/services/intersection-observer.service';
import { ProgressPhotoService } from '../../../../../core/services/progress-photo.service';

export interface PhotoIndexItem {
  id: string;
  storage_path: string;
  created_at: string;
  has_thumbnail: boolean;
  thumbnail_path?: string; // Si aplicas transforms de Supabase o pre-generas
  thumbUrl?: string; // Propiedad añadida dinámicamente
  loaded?: boolean; // Propiedad añadida dinámicamente
  visible?: boolean; // Propiedad añadida dinámicamente
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="photo-grid grid grid-cols-3 gap-2 p-4">
      @for (photo of photos(); track photo.id) {
        <div 
          class="photo-cell aspect-[4/5] rounded-lg overflow-hidden relative bg-gray-100"
          [class.ring-2]="isSelected(photo)"
          [class.ring-blue-500]="isSelected(photo)"
          [class.ring-offset-2]="isSelected(photo)"
          [attr.data-photo-id]="photo.id"
          #photoCell
          (click)="toggleSelection(photo)"
        >
          @if (photo.visible && photo.thumbUrl) {
            <img 
              [src]="photo.thumbUrl" 
              class="w-full h-full object-cover transition-opacity duration-300"
              [class.opacity-0]="!photo.loaded"
              [class.opacity-100]="photo.loaded"
              loading="lazy"
              (load)="onImageLoaded(photo)"
              alt="Foto de progreso del {{ photo.created_at | date:'dd/MM' }}"
            />
          } @else {
            <div class="skeleton-photo shimmer w-full h-full bg-gray-200 animate-pulse"></div>
          }
          
          <!-- Badge de fecha -->
          <span class="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
            {{ photo.created_at | date:'dd/MM' }}
          </span>
          
          <!-- Indicador de selección -->
          @if (isSelected(photo)) {
            <div class="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {{ selectionIndex(photo) }}
            </div>
          }
        </div>
      }
    </div>
    
    <!-- Barra de acción de comparación -->
    @if (selectedPhotosArray().length === 2) {
      <div class="sticky bottom-4 mx-4 p-3 bg-blue-600 text-white rounded-xl shadow-lg flex justify-between items-center z-40">
        <span class="text-sm">Comparar {{ selectedPhotosArray()[0].created_at | date:'dd/MM' }} vs {{ selectedPhotosArray()[1].created_at | date:'dd/MM' }}</span>
        <button (click)="openComparison.emit()" class="font-semibold text-sm bg-white/20 px-3 py-1.5 rounded hover:bg-white/30 transition-colors">Ver →</button>
      </div>
    }
  `
})
export class PhotoGalleryComponent {
  photos = input.required<PhotoIndexItem[]>();
  selectedPhotos = output<PhotoIndexItem[]>();
  openComparison = output<void>();
  
  private observer = inject(IntersectionObserverService);
  private photoService = inject(ProgressPhotoService);
  
  // Estado local de selección (máximo 2)
  private selection = signal<Set<string>>(new Set());
  
  selectedPhotosArray = signal<PhotoIndexItem[]>([]);

  constructor() {
    afterNextRender(() => {
      const cells = document.querySelectorAll('.photo-cell');
      this.observer.observe(cells, (entry) => {
        const photoId = entry.target.getAttribute('data-photo-id');
        const photo = this.photos().find(p => p.id === photoId);
        if (photo && entry.isIntersecting) {
          this.loadThumbnail(photo, entry.target);
        }
      }, { rootMargin: '200px', threshold: 0.1 });
    });
  }
  
  private async loadThumbnail(photo: PhotoIndexItem, element: Element) {
    if (photo.visible) return; // Ya cargado
    
    // Unobserve immediately so we don't refetch on scroll
    this.observer.unobserve(element);
    
    try {
      const signedUrl = await this.photoService.getSignedUrl(
        photo.has_thumbnail && photo.thumbnail_path ? photo.thumbnail_path : photo.storage_path,
        3600
      );
      
      photo.thumbUrl = signedUrl;
      photo.visible = true;
    } catch (e) {
      console.error('Error loading thumbnail for photo', photo.id, e);
    }
  }

  onImageLoaded(photo: PhotoIndexItem) {
    photo.loaded = true;
  }
  
  toggleSelection(photo: PhotoIndexItem) {
    const current = this.selection();
    const next = new Set(current);
    
    if (next.has(photo.id)) {
      next.delete(photo.id);
    } else if (next.size < 2) {
      next.add(photo.id);
    } else {
      // Reemplazar el más antiguo si ya hay 2 seleccionados
      const [first] = next;
      next.delete(first);
      next.add(photo.id);
    }
    
    this.selection.set(next);
    
    const selectedItems = this.photos().filter(p => next.has(p.id));
    // Sort chronological (oldest first) so Before vs After makes sense
    selectedItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    this.selectedPhotosArray.set(selectedItems);
    this.selectedPhotos.emit(selectedItems);
  }
  
  isSelected(photo: PhotoIndexItem) {
    return this.selection().has(photo.id);
  }
  
  selectionIndex(photo: PhotoIndexItem) {
    // We get index from the sorted array
    const items = this.selectedPhotosArray();
    const idx = items.findIndex(p => p.id === photo.id);
    return idx !== -1 ? idx + 1 : -1;
  }
}
