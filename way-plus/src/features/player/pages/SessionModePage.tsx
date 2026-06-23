import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useRewardsStore } from '@/features/rewards/store/rewardsStore';
import { registry } from '@/content/registry';
import { sessionService, type PlannedSession, type SessionSummary } from '@/core/services/sessionService';
import { WayRenderer } from '@/features/content/components/WayRenderer';
const CelebrationOverlay = React.lazy(() => import('@/features/rewards/components/CelebrationOverlay').then(m => ({ default: m.CelebrationOverlay })));
import { type Way } from '@/core/engine/types';

export function SessionModePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { completeWay, profile } = usePlayerStore();
  const { addCoins } = useRewardsStore();

  const [session, setSession] = useState<PlannedSession | null>(null);
  const [queue, setQueue] = useState<Way[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<{ show: boolean, xp: number, coins: number }>({
    show: false, xp: 0, coins: 0
  });
  const [sessionResults, setSessionResults] = useState<{ completed: string[] }>({ completed: [] });

  useEffect(() => {
    async function initSession() {
      if (!patientId) return;
      setLoading(true);
      
      const activeSession = await sessionService.getActiveSession(patientId);
      if (!activeSession) {
        setLoading(false);
        return;
      }

      setSession(activeSession);
      
      // Load ways from registry
      const loadedWays: Way[] = [];
      const steps = await registry.getStepsForLevel(profile.currentLevel);
      
      for (const wayId of activeSession.way_ids) {
        let found = false;
        for (const step of steps) {
          const way = step.ways.find(w => w.id === wayId);
          if (way) {
            loadedWays.push(way);
            found = true;
            break;
          }
        }
      }
      
      setQueue(loadedWays);
      setLoading(false);
    }
    initSession();
  }, [patientId, profile.currentLevel]);

  const handleComplete = useCallback(async () => {
    const currentWay = queue[currentIdx];
    if (!currentWay) return;

    // Log internally
    completeWay(currentWay.id, 1);
    setSessionResults(prev => ({ completed: [...prev.completed, currentWay.id] }));
    
    const coinReward = 10;
    // addCoins automatically adds XP (coins / 2)
    addCoins(coinReward, 'session_mode');

    setCelebration({ show: true, xp: 5, coins: coinReward });

    setTimeout(async () => {
      setCelebration(prev => ({ ...prev, show: false }));
      
      if (currentIdx < queue.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // FINISH SESSION
        if (session) {
          const summary: SessionSummary = {
            ways_completed: [...sessionResults.completed, currentWay.id],
            ways_skipped: [],
            duration_seconds: 0, // Placeholder
            per_way: {}
          };
          await sessionService.completeSession(session.id, patientId!, summary);
        }
        navigate('/', { replace: true });
      }
    }, 4000);
  }, [currentIdx, queue, completeWay, addCoins, navigate, session, sessionResults, patientId]);

  if (loading) {
    return (
      <div className="h-screen bg-indigo-50 flex flex-col items-center justify-center p-8 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-4xl mb-4">🌀</motion.div>
        <h2 className="text-indigo-950 font-black text-xl uppercase">Preparando tu sesión...</h2>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-12 text-center">
        <div className="w-64 h-64 bg-indigo-50 rounded-full flex items-center justify-center text-8xl mb-8">🧘</div>
        <h1 className="text-indigo-950 font-black text-2xl mb-4 uppercase">Esperando a Maite</h1>
        <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Relájate un poco mientras preparamos los retos de hoy.</p>
        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-lg shadow-indigo-100">Volver al mapa</button>
      </div>
    );
  }

  const currentWay = queue[currentIdx];
  if (!currentWay) return null;

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Session Progress bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl border-2 border-slate-100 shadow-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">{currentIdx + 1}</div>
           <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black text-indigo-900 uppercase">Progreso de Sesión</span>
                <span className="text-[10px] font-black text-slate-400 uppercase">{currentIdx + 1} / {queue.length}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIdx + 1) / queue.length) * 100}%` }}
                    className="h-full bg-indigo-500 rounded-full"
                 />
              </div>
           </div>
        </div>
      </div>

      {/* Welcome Message (Only on first way) */}
      {currentIdx === 0 && session.notes && (
        <motion.div 
           initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
           className="absolute bottom-12 left-6 right-6 z-30 pointer-events-none"
        >
          <div className="max-w-md mx-auto bg-indigo-950 text-white p-6 rounded-[32px] shadow-2xl border-4 border-indigo-800">
             <div className="flex gap-4 items-start">
                <div className="text-3xl">👩‍🏫</div>
                <div>
                   <div className="text-[10px] font-black opacity-50 uppercase mb-1">Maite dice:</div>
                   <div className="font-bold text-sm leading-relaxed">{session.notes}</div>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWay.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen"
        >
          <WayRenderer way={currentWay} onComplete={handleComplete} />
        </motion.div>
      </AnimatePresence>

      <React.Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]"><div className="w-32 h-32 rounded-full bg-yellow-400 animate-pulse" /></div>}>
        <CelebrationOverlay 
          show={celebration.show} 
          type="happy"
          coins={celebration.coins} 
          onComplete={() => {}} 
        />
      </React.Suspense>
    </div>
  );
}
