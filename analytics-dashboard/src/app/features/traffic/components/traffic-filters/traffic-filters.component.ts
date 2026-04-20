import { Component, Output, EventEmitter, inject, DestroyRef, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrafficFilters } from '../../services/traffic-data.service';

@Component({
  selector: 'app-traffic-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="filterForm" class="filter-form">
      <div class="form-group">
        <label for="dateRange" class="filter-label">
          <span class="label-icon">📅</span> 
          Date Range
        </label>
        <div class="select-wrapper">
          <select id="dateRange" formControlName="dateRange" class="custom-select">
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <div class="select-arrow">▼</div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="source" class="filter-label">
          <span class="label-icon">🌐</span>
          Traffic Source
        </label>
        <div class="select-wrapper">
          <select id="source" formControlName="source" class="custom-select">
            <option value="all">All Sources</option>
            <option value="organic">Organic Search</option>
            <option value="paid">Paid Traffic</option>
            <option value="direct">Direct</option>
          </select>
          <div class="select-arrow">▼</div>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .filter-form { 
      display: flex; 
      flex-wrap: wrap;
      gap: 2rem; 
    }
    
    .form-group { 
      display: flex; 
      flex-direction: column; 
      gap: 0.75rem; 
      min-width: 200px;
    }
    
    .filter-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .label-icon {
      font-size: 1rem;
      opacity: 0.8;
    }
    
    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .custom-select { 
      width: 100%;
      padding: 0.75rem 3rem 0.75rem 1rem;
      border-radius: 8px; 
      border: 1px solid #cbd5e1; 
      background-color: #f8fafc;
      color: #1e293b;
      font-size: 0.95rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .custom-select:hover {
      border-color: #94a3b8;
      background-color: white;
    }

    .custom-select:focus {
      outline: none;
      border-color: #3b82f6;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .select-arrow {
      position: absolute;
      right: 1rem;
      pointer-events: none;
      font-size: 0.75rem;
      color: #64748b;
    }
  `]
})
export class TrafficFiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<Partial<TrafficFilters>>();

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  filterForm = this.fb.group({
    dateRange: ['7d'],
    source: ['all']
  });

  ngOnInit() {
    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.filtersChanged.emit(value as Partial<TrafficFilters>);
      });
  }
}
