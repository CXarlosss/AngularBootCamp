import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

export interface TherapeuticObjective {
  id: string;
  title: string;
  description: string;
  category: 'autonomy' | 'social' | 'regulation' | 'communication' | 'persistence';
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'pending' | 'in_progress' | 'achieved';
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  diagnosis?: string;
  startDate: string;
  lastSession: string;
  currentLevel: string;
  objectives: TherapeuticObjective[];
}

interface TherapistState {
  patients: Patient[];
  selectedPatientId: string | null;
  dateRange: 'week' | 'month' | 'all';
  
  selectPatient: (id: string) => void;
  setDateRange: (range: 'week' | 'month' | 'all') => void;
  addPatient: (patient: Patient) => void;
  addObjective: (patientId: string, objective: Omit<TherapeuticObjective, 'id' | 'createdAt' | 'status'>) => void;
  updateObjective: (patientId: string, objectiveId: string, progress: number) => void;
  deleteObjective: (patientId: string, objectiveId: string) => void;
}

export const useTherapistStore = create<TherapistState>()(
  persist(
    immer((set) => ({
    patients: [
      {
        id: 'demo-1',
        name: 'Lucía',
        avatar: '🦄',
        age: 5,
        diagnosis: 'TEA Nivel 1',
        startDate: '2026-03-15',
        lastSession: '2026-04-21',
        currentLevel: 'pregamer',
        objectives: [
          {
            id: 'obj-1',
            title: 'Iniciación Social',
            description: 'Saludar a 3 compañeros al llegar.',
            category: 'social',
            targetValue: 10,
            currentValue: 4,
            unit: 'veces',
            status: 'in_progress',
            createdAt: '2026-04-15'
          }
        ]
      },
      {
        id: 'demo-2',
        name: 'Marcos',
        avatar: '🐉',
        age: 7,
        diagnosis: 'TDAH',
        startDate: '2026-04-01',
        lastSession: '2026-04-22',
        currentLevel: 'pregamer',
        objectives: []
      },
      {
        id: 'demo-3',
        name: 'Sofía',
        avatar: '🐱',
        age: 6,
        diagnosis: 'Dificultades Pragmáticas',
        startDate: '2026-04-10',
        lastSession: '2026-04-23',
        currentLevel: 'pregamer',
        objectives: []
      }
    ],
    selectedPatientId: localStorage.getItem('way-active-patient') || 'demo-1',
    dateRange: 'week',
    
    selectPatient: (id) => set((state) => { 
      state.selectedPatientId = id; 
      localStorage.setItem('way-active-patient', id);
      window.location.reload();
    }),
    setDateRange: (range) => set((state) => { state.dateRange = range; }),
    addPatient: (patient) => set((state) => { state.patients.push(patient); }),
    addObjective: (patientId, obj) => set((state) => {
      const p = state.patients.find(p => p.id === patientId);
      if (p) {
        p.objectives.push({
          ...obj,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString().split('T')[0],
          status: 'pending'
        });
      }
    }),
    updateObjective: (patientId, objId, progress) => set((state) => {
      const p = state.patients.find(p => p.id === patientId);
      if (p) {
        const o = p.objectives.find(o => o.id === objId);
        if (o) {
          o.currentValue = progress;
          if (o.currentValue >= o.targetValue) {
            o.status = 'achieved';
          } else if (o.currentValue > 0) {
            o.status = 'in_progress';
          } else {
            o.status = 'pending';
          }
        }
      }
    }),
    deleteObjective: (patientId, objId) => set((state) => {
      const p = state.patients.find(p => p.id === patientId);
      if (p) {
        p.objectives = p.objectives.filter(o => o.id !== objId);
      }
    }),
  })),
  {
    name: 'way-plus-therapist',
  }
)
);

