import { Injectable, signal, effect } from '@angular/core';

export interface ChartThemeTokens {
  lineColor: string;
  lineWidth: number;
  pointColor: string;
  pointHoverColor: string;
  pointHoverBorderColor: string;
  pointHoverRadius: number;
  pointHoverBorderWidth: number;
  gridColor: string;
  gridBorderColor: string;
  tickColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipTitle: string;
  areaGradientStart: string;
  areaGradientEnd: string;
  prLineColor: string;
  prLabelColor: string;
  prLabelBg: string;
}

@Injectable({ providedIn: 'root' })
export class ChartThemeService {
  private isDark = signal(true);

  tokens = signal<ChartThemeTokens>(this.getDarkTokens());

  constructor() {
    // Detectar tema inicial
    this.detectTheme();

    // Escuchar cambios de tema
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        this.detectTheme();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
  }

  private detectTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const dark = theme !== 'light';
    this.isDark.set(dark);
    this.tokens.set(dark ? this.getDarkTokens() : this.getLightTokens());
  }

  private getDarkTokens(): ChartThemeTokens {
    return {
      lineColor: '#34d399',
      lineWidth: 3,
      pointColor: '#34d399',
      pointHoverColor: '#ffffff',
      pointHoverBorderColor: '#34d399',
      pointHoverRadius: 8,
      pointHoverBorderWidth: 3,
      gridColor: 'rgba(255, 255, 255, 0.04)',
      gridBorderColor: 'rgba(255, 255, 255, 0.06)',
      tickColor: '#94a3b8',
      tooltipBg: 'rgba(15, 19, 26, 0.95)',
      tooltipBorder: 'rgba(255, 255, 255, 0.08)',
      tooltipText: '#f1f5f9',
      tooltipTitle: '#fbbf24',
      areaGradientStart: 'rgba(52, 211, 153, 0.20)',
      areaGradientEnd: 'rgba(52, 211, 153, 0.01)',
      prLineColor: '#fbbf24',
      prLabelColor: '#fbbf24',
      prLabelBg: 'rgba(251, 191, 36, 0.10)',
    };
  }

  private getLightTokens(): ChartThemeTokens {
    return {
      lineColor: '#059669',
      lineWidth: 3,
      pointColor: '#059669',
      pointHoverColor: '#ffffff',
      pointHoverBorderColor: '#059669',
      pointHoverRadius: 8,
      pointHoverBorderWidth: 3,
      gridColor: 'rgba(0, 0, 0, 0.06)',
      gridBorderColor: 'rgba(0, 0, 0, 0.08)',
      tickColor: '#475569',
      tooltipBg: 'rgba(255, 255, 255, 0.95)',
      tooltipBorder: 'rgba(0, 0, 0, 0.08)',
      tooltipText: '#1e293b',
      tooltipTitle: '#d97706',
      areaGradientStart: 'rgba(5, 150, 105, 0.15)',
      areaGradientEnd: 'rgba(5, 150, 105, 0.01)',
      prLineColor: '#d97706',
      prLabelColor: '#d97706',
      prLabelBg: 'rgba(217, 119, 6, 0.10)',
    };
  }

  // Helper para crear gradiente de área
  createAreaGradient(ctx: CanvasRenderingContext2D, chartArea: any): CanvasGradient {
    const tokens = this.tokens();
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, tokens.areaGradientStart);
    gradient.addColorStop(1, tokens.areaGradientEnd);
    return gradient;
  }
}
