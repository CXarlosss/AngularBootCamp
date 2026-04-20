import { EnergyLevel } from './task.model';

export interface EnergySnapshot {
  level: EnergyLevel;
  recordedAt: Date;
}

// El engine de priorización usa estos pesos
export const ENERGY_WEIGHTS: Record<EnergyLevel, number> = {
  high:   1.0,
  medium: 0.65,
  low:    0.3,
};
