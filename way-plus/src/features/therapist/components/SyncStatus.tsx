import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { syncService, SyncStatusState } from '@/core/services/syncService';

const STATUS_CONFIG = {
  synced: { text: '☁️ Guardado', color: '#10B981', bg: '#D1FAE5' },
  syncing: { text: '💾 Guardando...', color: '#4F46E5', bg: '#E0E7FF' },
  offline: { text: '⚠️ Sin conexión', color: '#EF4444', bg: '#FEE2E2' }
};

export const SyncStatus: React.FC = () => {
  const [status, setStatus] = useState<SyncStatusState>('synced');

  useEffect(() => {
    return syncService.subscribeToSyncStatus((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  const config = STATUS_CONFIG[status];

  return (
    <motion.div 
      initial={false}
      animate={{ backgroundColor: config.bg }}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 6, 
        padding: '6px 12px', borderRadius: 20,
        fontSize: 12, fontWeight: 700, color: config.color,
        border: `1px solid ${config.color}30`
      }}
    >
      {config.text}
    </motion.div>
  );
};
