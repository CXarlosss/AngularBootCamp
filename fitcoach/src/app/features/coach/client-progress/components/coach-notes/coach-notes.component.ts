import { Component, input, signal, computed, inject, DestroyRef, afterNextRender } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CoachNotesService, CoachNote } from '../../../../../core/services/coach-notes.service';

@Component({
  selector: 'app-coach-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="coach-notes-container p-4">
      <!-- Input Area -->
      <div class="input-area mb-4 relative">
        <textarea
          [(ngModel)]="draftText"
          (ngModelChange)="onTextChange($event)"
          class="w-full min-h-[100px] max-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm transition-shadow"
          placeholder="Escribe una nota privada sobre este cliente..."
          maxlength="2000"
        ></textarea>
        
        <div class="flex justify-between items-center mt-2">
          <select [(ngModel)]="selectedCategory" class="text-xs border border-gray-300 rounded-md py-1.5 px-2 bg-white shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            @for (cat of categories; track cat.value) {
              <option [value]="cat.value">{{ cat.label }}</option>
            }
          </select>
          
          <span class="text-xs font-medium transition-colors duration-300" 
                [class.text-gray-400]="saveState() === 'idle'" 
                [class.text-blue-600]="saveState() === 'saving'" 
                [class.text-green-600]="saveState() === 'saved'" 
                [class.text-orange-500]="saveState() === 'offline'"
                [class.text-red-500]="saveState() === 'error' || (draftText().length > 1900 && saveState() === 'idle')">
            {{ stateLabel() }}
          </span>
        </div>
        
        <button 
          (click)="submitNote()"
          [disabled]="!canSubmit()"
          class="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
        >
          Añadir Nota
        </button>
      </div>
      
      <!-- Historial -->
      <div class="history-area max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
        @if (notes().length === 0) {
          <p class="text-center text-gray-400 text-sm py-4 italic">Sin notas previas</p>
        } @else {
          @for (group of groupedNotes(); track group.label) {
            <div class="mb-4 relative">
              <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-white/95 backdrop-blur py-1 z-10">{{ group.label }}</h4>
              @for (note of group.items; track note.id) {
                <div class="note-item p-3 bg-gray-50 border border-gray-100 rounded-lg mb-2 text-sm relative group hover:bg-gray-100 transition-colors">
                  <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">{{ note.content }}</p>
                  <div class="flex justify-between items-center mt-3">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide" [class]="categoryClass(note.category)">
                      {{ categoryLabel(note.category) }}
                    </span>
                    @if (isDeletable(note)) {
                      <button (click)="deleteNote(note.id)" class="text-gray-300 hover:text-red-500 transition-colors text-xs p-1" title="Eliminar nota">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class CoachNotesComponent {
  clientId = input.required<string>();
  
  private notesService = inject(CoachNotesService);
  private destroyRef = inject(DestroyRef);
  private datePipe = inject(DatePipe);
  
  // Estado del formulario
  draftText = signal('');
  selectedCategory = signal<'general' | 'injury' | 'nutrition' | 'motivation' | 'technique'>('general');
  saveState = signal<'idle' | 'saving' | 'saved' | 'offline' | 'error'>('idle');
  
  // Historial
  notes = signal<CoachNote[]>([]);
  
  // Draft local persistence
  private storageKey = computed(() => \`fitcoach_note_draft_\${this.clientId()}\`);
  
  categories = [
    { value: 'general', label: '📝 General' },
    { value: 'injury', label: '🩹 Lesión' },
    { value: 'nutrition', label: '🥗 Nutrición' },
    { value: 'motivation', label: '💪 Motivación' },
    { value: 'technique', label: '🏋️ Técnica' }
  ];
  
  constructor() {
    afterNextRender(() => {
      this.restoreDraft();
      this.loadNotes();
    });
    
    toObservable(this.draftText).pipe(
      debounceTime(800),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(text => {
      if (text.trim() || this.saveState() !== 'idle') {
        localStorage.setItem(this.storageKey(), JSON.stringify({
          text,
          category: this.selectedCategory(),
          timestamp: Date.now()
        }));
        if (this.saveState() !== 'saving') {
          this.saveState.set('idle');
        }
      }
    });
  }
  
  private restoreDraft() {
    const raw = localStorage.getItem(this.storageKey());
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        this.draftText.set(draft.text ?? '');
        this.selectedCategory.set(draft.category ?? 'general');
      } catch (e) {
        // Ignorar JSON invalido
      }
    }
  }
  
  async submitNote() {
    const text = this.draftText().trim();
    if (!text || text.length > 2000) return;
    
    this.saveState.set('saving');
    
    try {
      await this.notesService.addNote(this.clientId(), text, this.selectedCategory());
      
      this.draftText.set('');
      this.selectedCategory.set('general');
      localStorage.removeItem(this.storageKey());
      this.saveState.set(navigator.onLine ? 'saved' : 'offline');
      
      await this.loadNotes();
      
      setTimeout(() => {
        if (this.saveState() === 'saved' || this.saveState() === 'offline') {
          this.saveState.set('idle');
        }
      }, 2500);
    } catch (e) {
      this.saveState.set('error');
    }
  }
  
  async loadNotes() {
    try {
      const data = await this.notesService.getNotes(this.clientId());
      this.notes.set(data);
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  }
  
  async deleteNote(noteId: string) {
    if (!confirm('¿Seguro que deseas eliminar esta nota?')) return;
    try {
      await this.notesService.deleteNote(noteId);
      await this.loadNotes();
    } catch (e) {
      console.error('Failed to delete note', e);
    }
  }
  
  groupedNotes = computed(() => {
    const groups = new Map<string, { label: string; items: CoachNote[] }>();
    const now = new Date();
    const todayStr = this.datePipe.transform(now, 'yyyy-MM-dd');
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.datePipe.transform(yesterday, 'yyyy-MM-dd');
    
    for (const note of this.notes()) {
      const noteDate = new Date(note.created_at);
      const noteDateStr = this.datePipe.transform(noteDate, 'yyyy-MM-dd');
      
      let label = '';
      if (noteDateStr === todayStr) {
        label = 'Hoy';
      } else if (noteDateStr === yesterdayStr) {
        label = 'Ayer';
      } else {
        label = this.datePipe.transform(noteDate, 'dd MMM, yyyy') ?? 'Fecha desconocida';
      }
      
      if (!groups.has(label)) {
        groups.set(label, { label, items: [] });
      }
      groups.get(label)!.items.push(note);
    }
    
    return Array.from(groups.values());
  });
  
  canSubmit = computed(() => {
    const len = this.draftText().trim().length;
    return len > 0 && len <= 2000 && this.saveState() !== 'saving';
  });
  
  stateLabel = computed(() => {
    switch (this.saveState()) {
      case 'saving': return 'Añadiendo...';
      case 'saved': return 'Guardado';
      case 'offline': return 'Sin conexión. Se sincronizará.';
      case 'error': return 'Error al guardar';
      default: return \`\${this.draftText().length}/2000\`;
    }
  });
  
  isDeletable(note: CoachNote) {
    const hoursSince = (Date.now() - new Date(note.created_at).getTime()) / 36e5;
    return hoursSince < 24;
  }
  
  categoryClass(cat: string) {
    const map: Record<string, string> = {
      general: 'bg-gray-100 text-gray-700',
      injury: 'bg-red-100 text-red-700',
      nutrition: 'bg-green-100 text-green-700',
      motivation: 'bg-blue-100 text-blue-700',
      technique: 'bg-purple-100 text-purple-700'
    };
    return map[cat] ?? map.general;
  }
  
  categoryLabel(cat: string) {
    return this.categories.find(c => c.value === cat)?.label ?? cat;
  }
  
  onTextChange(value: string) {
    this.draftText.set(value);
    if (this.saveState() === 'saved' || this.saveState() === 'error' || this.saveState() === 'offline') {
      this.saveState.set('idle');
    }
  }
}
