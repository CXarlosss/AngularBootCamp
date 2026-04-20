// core/models/metric.model.ts

export type MetricId = 
  | 'active_users' 
  | 'revenue' 
  | 'conversion_rate' 
  | 'page_views';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface Metric {
  id: MetricId;
  label: string;
  value: number;
  previousValue: number;
  unit: 'number' | 'currency' | 'percentage';
  updatedAt: Date;
}

export interface MetricViewModel extends Metric {
  trend: TrendDirection;
  changePercent: number;
  formattedValue: string;
}

export interface TrafficDataPoint {
  timestamp: Date;
  sessions: number;
  bounceRate: number;
  avgDuration: number; // segundos
}

export interface MetricUpdateEvent {
  metricId: MetricId;
  newValue: number;
  timestamp: Date;
}

export interface DashboardState {
  metrics: Map<MetricId, Metric>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
