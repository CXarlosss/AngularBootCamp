import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';

export interface ActivityEvent {
  id: string;
  metricId: string;
  change: number;
  timestamp: Date;
  type: 'increase' | 'decrease';
}

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cdk-virtual-scroll-viewport 
      itemSize="80" 
      class="activity-feed-viewport"
      style="height: 480px; overflow-y: auto"
    >
      <div 
        *cdkVirtualFor="let event of events; trackBy: trackById"
        class="activity-item"
      >
        <div class="activity-timeline">
          <div class="activity-dot" [class]="'activity-dot--' + event.type"></div>
          <div class="activity-line"></div>
        </div>
        <div class="activity-item__content-wrapper">
          <div class="activity-item__icon-box" [class]="'activity-item__icon-box--' + event.type">
            {{ event.type === 'increase' ? '📈' : '📉' }}
          </div>
          <div class="activity-item__content">
            <span class="activity-item__metric">
              {{ event.metricId | titlecase }} update
            </span>
            <span class="activity-item__value">
              <span [class]="'text-' + event.type">
                {{ event.type === 'increase' ? '+' : '' }}{{ event.change | number }}
              </span>
              change detected
            </span>
          </div>
          <span class="activity-item__time">
            {{ event.timestamp | date:'shortTime' }}
          </span>
        </div>
      </div>

      @if (events.length === 0) {
        <div class="empty-feed">
          <span class="empty-feed-icon">⚡</span>
          <p>Listening for incoming events...</p>
        </div>
      }
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .activity-feed-viewport { 
      width: 100%; 
      border-radius: 12px; 
      background: #f8fafc;
      padding: 1rem 0;
    }

    /* Scrollbar styling */
    .activity-feed-viewport::-webkit-scrollbar {
      width: 6px;
    }
    .activity-feed-viewport::-webkit-scrollbar-track {
      background: transparent;
    }
    .activity-feed-viewport::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 20px;
    }

    .activity-item {
      height: 80px;            
      display: flex;
      align-items: center;
      padding: 0 1rem;
      box-sizing: border-box; 
      position: relative;
    }

    .activity-item:hover .activity-item__content-wrapper {
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border-color: transparent;
      transform: translateX(4px);
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 24px;
      height: 100%;
      position: relative;
      margin-right: 1rem;
    }

    .activity-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 35px;
      z-index: 2;
      background: #94a3b8;
      border: 2px solid #f8fafc;
    }
    
    .activity-dot--increase { background: #10b981; }
    .activity-dot--decrease { background: #ef4444; }

    .activity-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
      z-index: 1;
    }

    /* hide line for last element if it was possible in virtual scroll easily, but we just leave it for now */

    .activity-item__content-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: transparent;
      border-radius: 10px;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .activity-item__icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      background: #f1f5f9;
    }
    
    .activity-item__icon-box--increase { background: rgba(16, 185, 129, 0.1); }
    .activity-item__icon-box--decrease { background: rgba(225, 29, 72, 0.1); }

    .activity-item__content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    
    .activity-item__metric { 
      font-size: 0.95rem; 
      font-weight: 600; 
      color: #1e293b; 
      letter-spacing: -0.01em;
    }
    
    .activity-item__value { 
      font-size: 0.8rem; 
      color: #64748b; 
    }

    .text-increase { color: #059669; font-weight: 600; }
    .text-decrease { color: #e11d48; font-weight: 600; }

    .activity-item__time { 
      font-size: 0.75rem; 
      color: #94a3b8; 
      font-weight: 500;
      white-space: nowrap;
    }

    .empty-feed {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      gap: 1rem;
    }
    
    .empty-feed-icon {
      font-size: 2.5rem;
      opacity: 0.4;
    }
  `]
})
export class ActivityFeedComponent {
  @Input({ required: true }) events: ActivityEvent[] = [];

  trackById(index: number, event: ActivityEvent): string {
    return event.id;
  }
}
