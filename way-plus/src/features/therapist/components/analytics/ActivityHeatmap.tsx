import React from 'react';

interface HeatmapData {
  day: string;
  hour: string;
  value: number;
  dayIndex: number;
  hourIndex: number;
}

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const getColor = (value: number) => {
    if (value === 0) return '#f3f4f6'; // Gris muy claro
    if (value < 3) return '#c7d2fe'; // Indigo claro
    if (value < 6) return '#818cf8'; // Indigo medio
    return '#4f46e5'; // Indigo oscuro
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 10 }}>
      <div style={{ minWidth: 400, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Header Horas */}
        <div style={{ display: 'flex', paddingLeft: 40, gap: 4 }}>
          {HOURS.map(h => (
            <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af' }}>
              {h}
            </div>
          ))}
        </div>
        
        {/* Grid Días */}
        {DAYS.map((day, dIdx) => (
          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 36, fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'right', paddingRight: 8 }}>
              {day}
            </div>
            {HOURS.map((hour, hIdx) => {
              const cellData = data.find(d => d.dayIndex === dIdx && d.hourIndex === hIdx);
              const val = cellData?.value || 0;
              return (
                <div 
                  key={`${day}-${hour}`}
                  title={`${val} WAYs iniciados el ${day} a las ${hour}`}
                  style={{
                    flex: 1,
                    height: 28,
                    backgroundColor: getColor(val),
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
