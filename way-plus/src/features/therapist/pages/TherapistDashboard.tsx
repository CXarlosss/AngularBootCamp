/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ Refactor — TherapistDashboard.tsx
 * Panel de control del terapeuta
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GLASS,
  BTN,
  TEXT,
  STATUS,
  DECORATIVE,
  A11Y,
  way,
} from '@/shared/lib/wayTheme';
import { rw, RESPONSIVE, TABLE, CONTAINER, SAFE } from '@/shared/lib/wayResponsive';
import { hapticService } from '@/core/services/hapticService';
import { Button } from '@/shared/components/Button';

// ─── TYPES ───
export interface Patient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  lastSession: string;
  progress: number;
  status: 'active' | 'inactive' | 'needs_attention';
  nextAppointment?: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

// ─── MOCK DATA ───
const MOCK_STATS: StatCard[] = [
  { label: 'Pacientes activos', value: 24, change: '+3 esta semana', trend: 'up', icon: '👥' },
  { label: 'Sesiones hoy', value: 8, change: '2 pendientes', trend: 'neutral', icon: '📅' },
  { label: 'Promedio de progreso', value: '68%', change: '+5% vs mes pasado', trend: 'up', icon: '📈' },
  { label: 'Alertas', value: 3, change: 'Requieren atención', trend: 'down', icon: '🔔' },
];

const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Lucía Martínez', avatar: '👧', age: 7, lastSession: 'Hoy, 10:30', progress: 85, status: 'active', nextAppointment: 'Mañana, 09:00' },
  { id: 'p2', name: 'Tomás Gómez', avatar: '👦', age: 9, lastSession: 'Ayer, 14:00', progress: 62, status: 'active' },
  { id: 'p3', name: 'Sofía Ruiz', avatar: '👧', age: 6, lastSession: 'Hace 3 días', progress: 45, status: 'needs_attention', nextAppointment: 'Hoy, 16:00' },
  { id: 'p4', name: 'Mateo López', avatar: '👦', age: 8, lastSession: 'Hace 5 días', progress: 78, status: 'active' },
  { id: 'p5', name: 'Valentina Cruz', avatar: '👧', age: 7, lastSession: 'Hace 1 semana', progress: 30, status: 'inactive' },
];

// ─── COMPONENT ───
export const TherapistDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: Patient['status']) => {
    switch (status) {
      case 'active':
        return { label: 'Activo', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'inactive':
        return { label: 'Inactivo', className: 'bg-slate-100 text-slate-500 border-slate-200' };
      case 'needs_attention':
        return { label: 'Atención', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-slate-50 to-indigo-50/20">
      <div className={DECORATIVE.orb('indigo', 'top-right')} aria-hidden="true" />
      <div className={DECORATIVE.orb('emerald', 'bottom-left')} aria-hidden="true" />

      <header className={way(GLASS.header, 'sticky top-0 z-40')}>
        <div className={way(CONTAINER.containerMobile, 'py-4')}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={TEXT.title}>Panel del Terapeuta</h1>
              <p className={TEXT.micro}>Bienvenido de vuelta, Dra. García</p>
            </div>
            <Button variant="icon" aria-label="Notificaciones" onClick={() => hapticService.click()}>
              <BellIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className={way(CONTAINER.containerMobile, SAFE.safeBottom, 'pb-8 pt-4')}>
        {/* Stats grid */}
        <section className={way(RESPONSIVE.gridShop, 'mb-6')}>
          {MOCK_STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={way(GLASS.card, 'rounded-2xl p-4')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={way(TEXT.micro, 'mb-1')}>{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className={way(
                    'mt-1 text-xs font-medium',
                    stat.trend === 'up' && 'text-emerald-600',
                    stat.trend === 'down' && 'text-rose-600',
                    stat.trend === 'neutral' && 'text-slate-500'
                  )}>
                    {stat.change}
                  </p>
                </div>
                <span className="text-2xl" role="img" aria-hidden="true">{stat.icon}</span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Search */}
        <div className="mb-4">
          <div className={way(GLASS.card, 'flex items-center gap-3 rounded-2xl px-4 py-3')}>
            <SearchIcon className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={way(
                'flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none',
                'min-h-[44px]'
              )}
              aria-label="Buscar paciente"
            />
          </div>
        </div>

        {/* Patients */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className={TEXT.subtitle}>Pacientes</h2>
            <Button variant="secondary" size="sm" onClick={() => hapticService.click()}>
              <PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
              Nuevo
            </Button>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {filteredPatients.map((patient, index) => {
              const statusConfig = getStatusConfig(patient.status);
              return (
                <motion.div
                  key={patient.id}
                  className={way(GLASS.card, 'rounded-2xl p-4')}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                      {patient.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{patient.name}</p>
                      <p className={TEXT.micro}>{patient.age} años • {patient.lastSession}</p>
                    </div>
                    <span className={way('rounded-full px-2.5 py-0.5 text-xs font-bold border', statusConfig.className)}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between">
                      <span className={TEXT.micro}>Progreso</span>
                      <span className={way(TEXT.micro, 'font-semibold')}>{patient.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
                      <div
                        className={way(
                          'h-full rounded-full transition-all duration-500',
                          patient.progress >= 80 && 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
                          patient.progress >= 50 && patient.progress < 80 && 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
                          patient.progress < 50 && 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        )}
                        style={{ width: `${patient.progress}%` }}
                      />
                    </div>
                  </div>
                  {patient.nextAppointment && (
                    <p className={way(TEXT.micro, 'mt-2 text-indigo-600')}>
                      📅 Próxima: {patient.nextAppointment}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <div className={way(GLASS.card, 'overflow-hidden rounded-2xl')}>
              <div className={TABLE.tableScroll}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200/60">
                      <th className={way(TABLE.tableCell, 'text-left font-semibold text-slate-600')}>Paciente</th>
                      <th className={way(TABLE.tableCell, 'text-left font-semibold text-slate-600')}>Edad</th>
                      <th className={way(TABLE.tableCell, 'text-left font-semibold text-slate-600')}>Progreso</th>
                      <th className={way(TABLE.tableCell, 'text-left font-semibold text-slate-600')}>Estado</th>
                      <th className={way(TABLE.tableCell, 'text-left font-semibold text-slate-600')}>Última sesión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => {
                      const statusConfig = getStatusConfig(patient.status);
                      return (
                        <tr
                          key={patient.id}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className={TABLE.tableCell}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl" role="img" aria-hidden="true">{patient.avatar}</span>
                              <span className="font-medium text-slate-800">{patient.name}</span>
                            </div>
                          </td>
                          <td className={TABLE.tableCell}>{patient.age} años</td>
                          <td className={TABLE.tableCell}>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200/60">
                                <div
                                  className={way(
                                    'h-full rounded-full',
                                    patient.progress >= 80 && 'bg-emerald-500',
                                    patient.progress >= 50 && patient.progress < 80 && 'bg-indigo-500',
                                    patient.progress < 50 && 'bg-amber-500'
                                  )}
                                  style={{ width: `${patient.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-600">{patient.progress}%</span>
                            </div>
                          </td>
                          <td className={TABLE.tableCell}>
                            <span className={way('rounded-full px-2.5 py-0.5 text-xs font-bold border', statusConfig.className)}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className={TABLE.tableCell}>{patient.lastSession}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// ─── ICONOS INLINE ───
const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default TherapistDashboard;
