import { Component, inject, signal, computed } from '@angular/core';
import { SyncQueueService } from '../../../core/services/sync-queue.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  template: `
    @if (status() === 'offline') {
      <div class="offline-banner">
        <span class="icon">📴</span>
        <span class="text">Sin conexión. Los datos se guardarán localmente.</span>
      </div>
    } @else if (status() === 'syncing') {
      <div class="syncing-banner">
        <span class="spinner"></span>
        <span class="text">Sincronizando {{ pendingCount() }} series...</span>
      </div>
    }
  `,
  styles: [`
    .offline-banner, .syncing-banner {
      position: fixed;
      top: 0; left: 0; right: 0;
      padding: 12px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      animation: slideDown 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    .offline-banner { background: #ff9800; color: #fff; }
    .syncing-banner { background: #2196F3; color: #fff; }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
  `]
})
export class OfflineIndicatorComponent {
  private syncQueue = inject(SyncQueueService);
  protected status = this.syncQueue.status;
  protected pendingCount = this.syncQueue.pendingCount;
}
