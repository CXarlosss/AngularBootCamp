import {
  Component, Input, AfterViewInit,
  ElementRef, ViewChild, OnChanges, signal, effect
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

export interface WeightEntry {
  recorded_at: string;
  weight_kg: number;
}

@Component({
  selector: 'app-weight-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="chart-wrap">
      <div class="chart-header">
        <span class="chart-title">Evolución de peso</span>
        @if (entries.length > 0) {
          <span class="chart-delta" [class.down]="totalDelta() < 0" [class.up]="totalDelta() > 0">
            {{ totalDelta() > 0 ? '↑' : '↓' }} {{ absDelta() | number:'1.1-1' }} kg total
          </span>
        }
      </div>
      @if (entries.length < 2) {
        <div class="no-data">Sin suficientes registros de peso</div>
      } @else {
        <div class="canvas-container">
          <canvas #chart></canvas>
        </div>
        <div class="x-labels">
          @for (label of xLabels(); track label.x) {
            <span [style.left.px]="label.x">{{ label.text }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-wrap { padding: 4px 0 8px; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .chart-title { font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    .chart-delta { font-size: 13px; font-weight: 700; }
    .chart-delta.down { color: #1D9E75; }
    .chart-delta.up   { color: #E24B4A; }
    
    .canvas-container { position: relative; height: 100px; width: 100%; }
    canvas { width: 100%; height: 100%; display: block; }
    
    .x-labels { position: relative; height: 20px; margin-top: 8px; }
    .x-labels span { position: absolute; font-size: 10px; color: #444; transform: translateX(-50%); font-weight: 600; }
    
    .no-data { font-size: 13px; color: #444; padding: 32px 0; text-align: center; border: 1px dashed rgba(255,255,255,0.05); border-radius: 12px; }
  `]
})
export class WeightChartComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) entries: WeightEntry[] = [];
  @ViewChild('chart') canvasRef!: ElementRef<HTMLCanvasElement>;

  xLabels = signal<{ x: number; text: string }[]>([]);
  totalDelta = signal(0);
  absDelta = signal(0);

  constructor() {
    // Redraw on window resize
    effect(() => {
      // This is a placeholder if we wanted to react to signal changes, 
      // but we use ngOnChanges and AfterViewInit
    });
  }

  ngAfterViewInit() { this.draw(); }
  ngOnChanges() { this.draw(); }

  private draw() {
    if (this.entries.length < 2 || !this.canvasRef) return;

    const data = this.entries;
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    
    // Get dimensions from container
    const W = canvas.parentElement?.clientWidth || canvas.offsetWidth;
    const H = 100;
    
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const weights = data.map(e => e.weight_kg);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    
    // Padding and range adjustment
    const range = maxW - minW || 2;
    const paddingVal = range * 0.2 || 1;
    const yMin = minW - paddingVal;
    const yMax = maxW + paddingVal;

    const PAD = { top: 15, right: 20, bottom: 10, left: 20 };

    const toX = (i: number) =>
      PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
    const toY = (w: number) =>
      PAD.top + (1 - (w - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Area Gradient
    const gradient = ctx.createLinearGradient(0, PAD.top, 0, H);
    gradient.addColorStop(0, 'rgba(29, 158, 117, 0.15)');
    gradient.addColorStop(1, 'rgba(29, 158, 117, 0)');

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(weights[0]));
    for (let i = 1; i < weights.length; i++) {
      const x = toX(i);
      const y = toY(weights[i]);
      const prevX = toX(i - 1);
      const prevY = toY(weights[i - 1]);
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
    ctx.lineTo(toX(weights.length - 1), H);
    ctx.lineTo(toX(0), H);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(weights[0]));
    for (let i = 1; i < weights.length; i++) {
      const x = toX(i);
      const y = toY(weights[i]);
      const prevX = toX(i - 1);
      const prevY = toY(weights[i - 1]);
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
    ctx.strokeStyle = '#1D9E75';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Points (only first and last, and maybe some in between)
    const drawPoint = (i: number) => {
      const x = toX(i);
      const y = toY(weights[i]);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1D9E75';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    };

    drawPoint(0);
    drawPoint(data.length - 1);

    // Labels X
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const fmt = (d: string) => {
      const dt = new Date(d);
      return `${dt.getDate()} ${months[dt.getMonth()]}`;
    };

    const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
    const uniqueIndices = [...new Set(labelIndices)];
    
    this.xLabels.set(uniqueIndices.map(i => ({ x: toX(i), text: fmt(data[i].recorded_at) })));
    
    const dValue = weights[weights.length - 1] - weights[0];
    this.totalDelta.set(dValue);
    this.absDelta.set(Math.abs(dValue));
  }
}
