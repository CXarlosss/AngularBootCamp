import { Component, Input, ContentChild, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[fcCardActions]',
  standalone: true
})
export class FcCardActionsDirective {}

@Component({
  selector: 'fc-card',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './fc-card.component.css',
  template: `
    @if (title || hasActions) {
      <div class="fc-card-header">
        @if (title) {
          <h3 class="fc-card-title">{{ title }}</h3>
        }
        <div class="fc-card-actions" [style.display]="hasActions ? 'flex' : 'none'">
          <ng-content select="[fcCardActions]"></ng-content>
        </div>
      </div>
    }
    
    <div class="fc-card-content">
      <ng-content></ng-content>
    </div>
  `
})
export class FcCardComponent {
  @Input() title?: string;
  @ContentChild(FcCardActionsDirective, { static: true }) hasActions?: FcCardActionsDirective;
}
