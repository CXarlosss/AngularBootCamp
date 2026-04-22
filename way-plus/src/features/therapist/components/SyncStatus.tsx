import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offlineStorage } from '@/core/services/offlineStorage';
import { registry } from '@/content/levels/registry';

export const SyncStatus: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const checkQueue = async () => {
      const queue = await offlineStorage.getSyncQueue();
      setPendingCount(queue.length);
    };
    
    checkQueue();
    const interval = setInterval(checkQueue, 5000);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    await registry.processSyncQueue();
    const queue = await offlineStorage.getSyncQueue();
    setPendingCount(queue.length);
    setSyncing(false);
  };

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-200">
      <div className={`w-3 h-3 rounded-full transition-colors ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
        {isOnline ? 'Conectado' : 'Sin Conexión'}
      </span>
      
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 ml-2"
          >
            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full uppercase">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSync}
              disabled={syncing || !isOnline}
              className={`text-[10px] font-black px-3 py-1 rounded-lg transition-all
                ${isOnline 
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
              `}
            >
              {syncing ? 'SINCRO...' : 'SINCRO AHORA'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
