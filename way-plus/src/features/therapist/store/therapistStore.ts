import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { patientService } from '@/core/services/patientService';

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
  playerPin?: string;
  sessionQueue?: string[];
  homeworkWayIds?: string[];
  gender?: 'male' | 'female';
  completedWays?: string[];
  inventory?: string[];
  coins?: number;
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
  updatePatient: (id: string, changes: Partial<Patient>) => void;
  loadPatients: () => Promise<void>;
}


export const useTherapistStore = create<TherapistState>()(
  persist(
    immer((set) => ({
    patients: [],
    selectedPatientId: sessionStorage.getItem('way-active-patient') || null,
    dateRange: 'week',
    
    selectPatient: (id) => set((state) => { 
      state.selectedPatientId = id; 
      sessionStorage.setItem('way-active-patient', id);
      // Navigate and reload to ensure all stores (player, rewards) reload with the new patient ID
      window.location.href = `/therapist/patient/${id}`;
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
    updatePatient: (id, changes) => set((state) => {
      const p = state.patients.find(p => p.id === id);
      if (p) {
        Object.assign(p, changes);
      }
    }),

    loadPatients: async () => {
      const profiles = await patientService.getAll();
      set((state) => {
        state.patients = profiles.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          age: p.age,
          startDate: new Date().toISOString(),
          lastSession: '-',
          currentLevel: p.currentLevel,
          objectives: [],
          coins: p.coins,
          completedWays: p.completedWays,
          inventory: p.inventory,
        }));
      });
    },


  })),
  {
    name: 'way-plus-therapist',
  }
)
);

