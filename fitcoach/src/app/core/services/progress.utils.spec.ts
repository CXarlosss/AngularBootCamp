import { calcWeightImproved, SetLogRow } from './progress.utils';

describe('calcWeightImproved', () => {
  it('should return 0 when rows list is empty', () => {
    const result = calcWeightImproved([]);
    expect(result).toBe(0);
  });

  it('should return 0 when there is only one session for an exercise', () => {
    const rows: SetLogRow[] = [
      {
        exercise_name: 'Press de Banca',
        weight_kg: 80,
        workout_logs: { logged_date: '2026-05-01T10:00:00Z' }
      }
    ];
    const result = calcWeightImproved(rows);
    expect(result).toBe(0);
  });

  it('should calculate improvement correctly for exactly two sessions (slice size = 1)', () => {
    const rows: SetLogRow[] = [
      {
        exercise_name: 'Press de Banca',
        weight_kg: 80,
        workout_logs: { logged_date: '2026-05-01T10:00:00Z' }
      },
      {
        exercise_name: 'Press de Banca',
        weight_kg: 90,
        workout_logs: { logged_date: '2026-05-08T10:00:00Z' }
      }
    ];
    const result = calcWeightImproved(rows);
    expect(result).toBe(10);
  });

  it('should handle rows out of chronological order and sort them correctly before calculation', () => {
    const rows: SetLogRow[] = [
      {
        exercise_name: 'Sentadilla',
        weight_kg: 110,
        workout_logs: { logged_date: '2026-05-10T10:00:00Z' } // Última fecha
      },
      {
        exercise_name: 'Sentadilla',
        weight_kg: 100,
        workout_logs: { logged_date: '2026-05-01T10:00:00Z' } // Primera fecha
      }
    ];
    const result = calcWeightImproved(rows);
    expect(result).toBe(10);
  });

  it('should calculate terciles correctly for a larger list of sessions (e.g. 9 sessions, slice = 2)', () => {
    // Para 9 sesiones, el 33% (floor) es 2.
    // Primeras 2 sesiones: 100, 102. Max = 102.
    // Últimas 2 sesiones: 118, 120. Max = 120.
    // Mejora = 120 - 102 = 18.
    const dates = [
      '2026-05-01', '2026-05-02', '2026-05-03',
      '2026-05-04', '2026-05-05', '2026-05-06',
      '2026-05-07', '2026-05-08', '2026-05-09'
    ];
    const weights = [100, 102, 105, 108, 110, 112, 115, 118, 120];

    const rows: SetLogRow[] = dates.map((date, index) => ({
      exercise_name: 'Peso Muerto',
      weight_kg: weights[index],
      workout_logs: { logged_date: date }
    }));

    const result = calcWeightImproved(rows);
    expect(result).toBe(18);
  });

  it('should handle multiple exercises, summing their individual improvements', () => {
    const rows: SetLogRow[] = [
      // Press de Banca: mejora de 80 a 95 (+15)
      {
        exercise_name: 'Press de Banca',
        weight_kg: 80,
        workout_logs: { logged_date: '2026-05-01T10:00:00Z' }
      },
      {
        exercise_name: 'Press de Banca',
        weight_kg: 95,
        workout_logs: { logged_date: '2026-05-15T10:00:00Z' }
      },
      // Sentadilla: mejora de 100 a 125 (+25)
      {
        exercise_name: 'Sentadilla',
        weight_kg: 100,
        workout_logs: { logged_date: '2026-05-01T10:00:00Z' }
      },
      {
        exercise_name: 'Sentadilla',
        weight_kg: 125,
        workout_logs: { logged_date: '2026-05-15T10:00:00Z' }
      }
    ];

    const result = calcWeightImproved(rows);
    expect(result).toBe(40); // 15 + 25
  });

  it('should ignore negative deltas (regresiones o pérdidas de fuerza) and not let them subtract from other improvements', () => {
    const rows: SetLogRow[] = [
      // Press de Banca: mejora de 80 a 90 (+10)
      {
        exercise_name: 'Press de Banca',
        weight_kg: 80,
        workout_logs: { logged_date: '2026-05-01T10:00:00Z' }
      },
      {
        exercise_name: 'Press de Banca',
        weight_kg: 90,
        workout_logs: { logged_date: '2026-05-15T10:00:00Z' }
      },
      // Sentadilla: empeora de 120 a 100 (-20, debe ser ignorado/0)
      {
        exercise_name: 'Sentadilla',
        weight_kg: 120,
        workout_logs: { logged_date: '2026-05-01T10:00:00Z' }
      },
      {
        exercise_name: 'Sentadilla',
        weight_kg: 100,
        workout_logs: { logged_date: '2026-05-15T10:00:00Z' }
      }
    ];

    const result = calcWeightImproved(rows);
    expect(result).toBe(10); // Solo el +10 de Press de Banca cuenta
  });

  it('should support robust parsing of nested Supabase arrays in workout_logs', () => {
    const rows: SetLogRow[] = [
      {
        exercise_name: 'Curl de Bíceps',
        weight_kg: 12,
        workout_logs: [{ logged_date: '2026-05-01T10:00:00Z' }]
      },
      {
        exercise_name: 'Curl de Bíceps',
        weight_kg: 16,
        workout_logs: [{ logged_date: '2026-05-15T10:00:00Z' }]
      }
    ];

    const result = calcWeightImproved(rows);
    expect(result).toBe(4);
  });
});
