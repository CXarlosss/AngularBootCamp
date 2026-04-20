import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnergyLevel } from '../../core/models/task.model';

@Component({
  selector: 'ff-energy-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="energy-picker">
      <p>Nivel de energía actual: {{ current }}</p>
      <button (click)="energyChange.emit('low')">Baja</button>
      <button (click)="energyChange.emit('medium')">Media</button>
      <button (click)="energyChange.emit('high')">Alta</button>
    </div>
  `
})
export class EnergyPickerComponent {
  @Input() current: EnergyLevel = 'medium';
  @Output() energyChange = new EventEmitter<EnergyLevel>();
}
