import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapistStore } from '../store/therapistStore';
import { SoundToggle } from '@/core/components/SoundToggle';
import { SyncStatus } from '../components/SyncStatus';
import { SecurityGate } from '@/shared/components/SecurityGate';
import { patientService } from '@/core/services/patientService';
import { seedClinicalData } from '@/core/utils/seedData';
import { flushOfflineAnnexes } from '@/services/clinicalAnnexService';

import { analyticsService } from '@/core/services/analyticsService';
import { supabase } from '@/core/services/supabaseClient';

import { 
  Users, 
  Search, 
  ChevronRight, 
  Plus, 
  Trophy,
  Brain,
  Palette,
  Activity
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RESPONSIVE, rw } from '@/shared/lib/wayResponsive';

export function TherapistDashboard() {
  const navigate = useNavigate();
  const { selectPatient, addPatient, patients, loadPatients } = useTherapistStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: 6, avatar: 'base-unicorn' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [globalKPIs, setGlobalKPIs] = useState({ activePatientsThisWeek: 0, totalWaysCompleted: 0 });

  useEffect(() => {
    if (isAuthorized) {
      loadPatients();
      flushOfflineAnnexes().catch(console.error);

      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            analyticsService.getGlobalTherapistKPIs(user.id).then(kpis => {
              setGlobalKPIs(kpis);
            });
          }
        });
      }
    }
  }, [isAuthorized, loadPatients]);

  if (!isAuthorized) {
    return (
      <SecurityGate 
        onSuccess={() => setIsAuthorized(true)}
        onCancel={() => navigate('/')}
        title="Panel de Maite"
      />
    );
  }

  const handleAddPatient = async () => {
    if (!newPatient.name || isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const created = await patientService.create({
        name: newPatient.name,
        age: newPatient.age,
        avatar: newPatient.avatar,
      });

      if (!created) throw new Error('No se pudo crear el paciente');

      addPatient({
        ...created,
        startDate: new Date().toISOString().split('T')[0],
        lastSession: new Date().toISOString().split('T')[0],
        objectives: [],
        sessionQueue: [],
      });

      setShowAddModal(false);
      setNewPatient({ name: '', age: 6, avatar: 'base-unicorn' });

      selectPatient(created.id);
    } catch (e) {
      console.error('[Dashboard] Error creating patient:', e);
      setCreateError('No se pudo guardar el paciente. Inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 forced-colors:bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm forced-colors:border-b-2 forced-colors:border-[#1E1B4B]">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-600 forced-colors:text-[#1E1B4B]" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 m-0 forced-colors:text-[#1E1B4B]">Panel Terapéutico</h1>
            <p className="text-xs font-medium text-slate-500 m-0">Gestión clínica y seguimiento</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              const res = await seedClinicalData();
              if (res.success) loadPatients();
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none forced-colors:border-2 forced-colors:border-[#1E1B4B]"
          >
            🌱 Seed Demo
          </button>
          
          <button
            onClick={() => navigate('/editor')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 outline-none forced-colors:bg-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]"
          >
            <Palette size={16} /> Editor de Ways
          </button>
          
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 forced-colors:border-[#1E1B4B]">
            <SoundToggle />
            <SyncStatus />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Global KPIs */}
        <section aria-label="Estadísticas Generales" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-start gap-4 forced-colors:border-2 forced-colors:border-[#1E1B4B]">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 forced-colors:border-2 forced-colors:border-[#1E1B4B]">
              <Users size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pacientes (Semana)</div>
              <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                {globalKPIs.activePatientsThisWeek}
                <span className="text-sm font-bold text-emerald-600">+</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-start gap-4 forced-colors:border-2 forced-colors:border-[#1E1B4B]">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 forced-colors:border-2 forced-colors:border-[#1E1B4B]">
              <Trophy size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ways Completados</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {globalKPIs.totalWaysCompleted}
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-start gap-4 forced-colors:border-2 forced-colors:border-[#1E1B4B]">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0 forced-colors:border-2 forced-colors:border-[#1E1B4B]">
              <Activity size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Registrados</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {patients.length}
              </div>
            </div>
          </div>
        </section>

        {/* Patients List Section */}
        <section aria-label="Lista de Pacientes">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 m-0">Mis Pacientes</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" aria-hidden="true" />
                <input 
                  type="text" 
                  placeholder="Buscar paciente..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors forced-colors:border-2 forced-colors:border-[#1E1B4B]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar pacientes"
                />
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 outline-none forced-colors:bg-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B] shrink-0"
              >
                <Plus size={18} /> <span className="hidden sm:inline">Añadir Paciente</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden forced-colors:border-2 forced-colors:border-[#1E1B4B]">
            <div className="overflow-x-auto">
              <table className={rw("tableMinWidth", "w-full text-left border-collapse")}>
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider forced-colors:border-b-2 forced-colors:border-[#1E1B4B]">Paciente</th>
                    <th scope="col" className="px-6 py-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider forced-colors:border-b-2 forced-colors:border-[#1E1B4B]">Edad</th>
                    <th scope="col" className="px-6 py-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider forced-colors:border-b-2 forced-colors:border-[#1E1B4B]">Nivel Actual</th>
                    <th scope="col" className="px-6 py-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider forced-colors:border-b-2 forced-colors:border-[#1E1B4B]"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <tr 
                        key={patient.id} 
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer focus-within:bg-slate-50 outline-none focus-visible:bg-slate-100 forced-colors:border-b-2 forced-colors:border-[#1E1B4B]"
                        onClick={() => selectPatient(patient.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectPatient(patient.id);
                          }
                        }}
                      >
                        <td className={rw("tableCell", "whitespace-nowrap align-middle")}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-slate-100 w-10 h-10 flex items-center justify-center rounded-full forced-colors:border-2 forced-colors:border-[#1E1B4B]" aria-hidden="true">
                              {patient.avatar === 'base-unicorn' ? '🦄' : 
                               patient.avatar === 'base-dragon' ? '🐉' : 
                               patient.avatar === 'base-puppy' ? '🐶' : 
                               patient.avatar === 'base-kitten' ? '🐱' : patient.avatar || '👤'}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{patient.name}</span>
                              <span className="text-xs text-slate-500 font-medium block mt-0.5">ID: {patient.id.split('-')[0]}</span>
                            </div>
                          </div>
                        </td>
                        <td className={rw("tableCell", "whitespace-nowrap align-middle")}>
                          <span className="text-sm font-medium text-slate-700">{patient.age} años</span>
                        </td>
                        <td className={rw("tableCell", "whitespace-nowrap align-middle")}>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 forced-colors:border-2 forced-colors:border-[#1E1B4B]">
                            {patient.currentLevel || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle text-right">
                          <ChevronRight className="inline text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                        {patients.length === 0 ? 'No hay pacientes registrados.' : 'No se encontraron pacientes que coincidan con la búsqueda.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Añadir Paciente Simple */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 forced-colors:border-4 forced-colors:border-[#1E1B4B]"
            >
              <h3 className="text-2xl font-bold text-slate-900 m-0 mb-6">Añadir Paciente</h3>
              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="patient-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nombre</label>
                  <input 
                    id="patient-name"
                    value={newPatient.name}
                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="Ej: Daniel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-shadow forced-colors:border-2 forced-colors:border-[#1E1B4B]"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patient-age" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Edad</label>
                    <input 
                      id="patient-age"
                      type="number"
                      min="1"
                      max="99"
                      value={newPatient.age}
                      onChange={e => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-shadow forced-colors:border-2 forced-colors:border-[#1E1B4B]"
                    />
                  </div>
                  <div>
                    <label htmlFor="patient-avatar" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Avatar</label>
                    <select 
                      id="patient-avatar"
                      value={newPatient.avatar}
                      onChange={e => setNewPatient({ ...newPatient, avatar: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-shadow bg-white forced-colors:border-2 forced-colors:border-[#1E1B4B]"
                    >
                      <option value="base-unicorn">🦄 Unicornio</option>
                      <option value="base-dragon">🐉 Dragón</option>
                      <option value="base-puppy">🐶 Perrito</option>
                      <option value="base-kitten">🐱 Gatito</option>
                    </select>
                  </div>
                </div>

                {createError && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold forced-colors:border-2 forced-colors:border-[#1E1B4B]">
                    {createError}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-slate-500 outline-none forced-colors:border-2 forced-colors:border-[#1E1B4B]"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddPatient}
                    disabled={isCreating || !newPatient.name}
                    className="flex-1 py-3 px-4 rounded-xl border border-transparent bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 outline-none forced-colors:bg-[#1E1B4B] forced-colors:border-2 forced-colors:border-[#1E1B4B]"
                  >
                    {isCreating ? 'Guardando...' : 'Guardar Paciente'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
