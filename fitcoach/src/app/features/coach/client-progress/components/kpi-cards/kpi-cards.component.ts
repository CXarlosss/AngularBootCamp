import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KpiData {
  adherence: number;
  adherenceTrend: number;
  volumeTrend: number;
  daysSince: number | null;
  prsCount: number;
  lastWorkoutDate: string | null;
  targetWeight: number | null;
  currentWeight: number | null;
  lastVolume?: number; // Optional for tooltip
}

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
      
      <!-- Tarjeta 1: Adherencia -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between h-[100px]">
        <div class="flex justify-between items-start">
          <span class="text-sm font-medium text-gray-500">📊 Adherencia</span>
          <span class="text-xs font-semibold" [ngClass]="adherenceTrendColor()">
            {{ data().adherenceTrend > 0 ? '↑' : (data().adherenceTrend < 0 ? '↓' : '') }}
            {{ data().adherenceTrend > 0 ? '+' : ''}}{{ data().adherenceTrend }}%
          </span>
        </div>
        <div class="flex flex-col gap-1 mt-1">
          @if (data().adherence > 0) {
            <span class="text-2xl font-bold" [ngClass]="adherenceColor()">{{ data().adherence }}%</span>
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="h-1.5 rounded-full" [ngClass]="adherenceBgColor()" [style.width.%]="data().adherence"></div>
            </div>
          } @else {
            <span class="text-2xl font-bold text-gray-400">—</span>
            <span class="text-xs text-gray-400">Sin datos aún</span>
          }
        </div>
      </div>

      <!-- Tarjeta 2: Volumen -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between h-[100px]"
           [title]="data().lastVolume ? data().lastVolume + ' kg total' : ''">
        <span class="text-sm font-medium text-gray-500">📉 Volumen</span>
        <div class="flex flex-col">
          @if (data().volumeTrend !== 0 || data().lastWorkoutDate) {
            <span class="text-2xl font-bold" [ngClass]="volumeTrendColor()">
              {{ data().volumeTrend > 0 ? '↑ +' : (data().volumeTrend < 0 ? '↓ ' : '') }}{{ data().volumeTrend }}%
            </span>
            <span class="text-xs text-gray-400">vs semana ant</span>
          } @else {
            <span class="text-2xl font-bold text-gray-400">—</span>
          }
        </div>
      </div>

      <!-- Tarjeta 3: PRs recientes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between h-[100px] cursor-pointer hover:bg-gray-50 transition-colors">
        <span class="text-sm font-medium text-gray-500">🏋️ PRs recientes</span>
        <div class="flex flex-col">
          <span class="text-2xl font-bold" [class.text-gray-400]="data().prsCount === 0">
            {{ data().prsCount }}
          </span>
          <span class="text-xs text-gray-400">
            {{ data().prsCount === 0 ? 'Sin PRs recientes' : 'últimos 14 días' }}
          </span>
        </div>
      </div>

      <!-- Tarjeta 4: Peso / Alternativa -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between h-[100px]">
        @if (data().targetWeight) {
          <span class="text-sm font-medium text-gray-500">⚖️ Peso</span>
          <div class="flex flex-col">
            @if (data().currentWeight) {
              <span class="text-2xl font-bold text-gray-900">{{ data().currentWeight | number:'1.1-1' }} kg</span>
              <span class="text-xs font-medium" [ngClass]="weightDeltaColor()">
                {{ weightDelta() > 0 ? '+' : '' }}{{ weightDelta() | number:'1.1-1' }} vs meta
              </span>
            } @else {
              <span class="text-2xl font-bold text-gray-400">—</span>
              <button class="text-xs text-blue-600 font-medium text-left hover:underline">Pedir registro</button>
            }
          </div>
        } @else {
          <!-- Alternativa -->
          <span class="text-sm font-medium text-gray-500">📅 Días inactivos</span>
          <div class="flex flex-col">
            <span class="text-2xl font-bold" [class.text-gray-400]="data().daysSince === null">
              {{ data().daysSince ?? '—' }}
            </span>
            <span class="text-xs text-gray-400">desde último entreno</span>
          </div>
        }
      </div>

    </div>
  `
})
export class KpiCardsComponent {
  data = input.required<KpiData>();

  adherenceColor = computed(() => {
    const adh = this.data().adherence;
    if (adh >= 80) return 'text-green-600';
    if (adh >= 50) return 'text-yellow-600';
    return 'text-red-600';
  });

  adherenceBgColor = computed(() => {
    const adh = this.data().adherence;
    if (adh >= 80) return 'bg-green-600';
    if (adh >= 50) return 'bg-yellow-500';
    return 'bg-red-600';
  });

  adherenceTrendColor = computed(() => {
    const trend = this.data().adherenceTrend;
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-400';
  });

  volumeTrendColor = computed(() => {
    const trend = this.data().volumeTrend;
    if (trend >= 5) return 'text-green-600';
    if (trend <= -5) return 'text-red-600';
    return 'text-yellow-600';
  });

  weightDelta = computed(() => {
    const current = this.data().currentWeight;
    const target = this.data().targetWeight;
    if (current && target) {
      return current - target;
    }
    return 0;
  });

  weightDeltaColor = computed(() => {
    const delta = this.weightDelta();
    if (delta < 0) return 'text-green-600'; // Simplifying: loss is green
    if (delta > 0) return 'text-gray-600'; 
    return 'text-gray-400';
  });
}
