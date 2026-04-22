import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  diagnosis?: string;
  startDate: string;
  lastSession: string;
  currentLevel: string;
}

interface TherapistState {
  patients: Patient[];
  selectedPatientId: string | null;
  dateRange: 'week' | 'month' | 'all';
  
  selectPatient: (id: string) => void;
  setDateRange: (range: 'week' | 'month' | 'all') => void;
  addPatient: (patient: Patient) => void;
}

export const useTherapistStore = create<TherapistState>()(
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
        currentLevel: 'PREGAMER',
      },
    ],
    selectedPatientId: 'demo-1',
    dateRange: 'week',
    
    selectPatient: (id) => set((state) => { 
      state.selectedPatientId = id; 
      localStorage.setItem('way-active-patient', id);
    }),
    setDateRange: (range) => set((state) => { state.dateRange = range; }),
    addPatient: (patient) => set((state) => { state.patients.push(patient); }),
  }))
);
