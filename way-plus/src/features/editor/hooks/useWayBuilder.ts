import { useState, useCallback } from 'react';
import type { Way } from '@/core/engine/types';

export type EditorWayType = 'double-choice' | 'sequencing' | 'memory' | 'tracing';

export interface DraftWay {
  id: string;
  type: EditorWayType;
  stepId: string;
  order: number;
  stimulus: {
    image: string;
    text: string;
    audio?: string;
  };
  options: any[];
  metadata: {
    skillTag: string;
    difficulty: 1 | 2 | 3;
    estimatedTime: number;
  };
}

const DEFAULT_DRAFT: DraftWay = {
  id: '',
  type: 'double-choice',
  stepId: '',
  order: 1,
  stimulus: { image: '', text: '' },
  options: [],
  metadata: { skillTag: '', difficulty: 1, estimatedTime: 30 },
};

export function useWayBuilder() {
  const [draft, setDraft] = useState<DraftWay>(DEFAULT_DRAFT);
  const [errors, setErrors] = useState<string[]>([]);

  const updateField = useCallback(<K extends keyof DraftWay>(
    field: K,
    value: DraftWay[K]
  ) => {
    setDraft(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }, []);

  const updateStimulus = useCallback((updates: Partial<DraftWay['stimulus']>) => {
    setDraft(prev => ({
      ...prev,
      stimulus: { ...prev.stimulus, ...updates },
    }));
  }, []);

  const updateMetadata = useCallback((updates: Partial<DraftWay['metadata']>) => {
    setDraft(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...updates },
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const errs: string[] = [];
    
    if (!draft.stimulus.text.trim()) errs.push('El enunciado es obligatorio');
    if (!draft.stimulus.image) errs.push('Debes subir un pictograma de estímulo');
    if (draft.options.length < 2) errs.push('Mínimo 2 opciones');
    
    if (draft.type === 'double-choice') {
      const correctCount = draft.options.filter((o: any) => o.isCorrect).length;
      if (correctCount !== 1) errs.push('Debe haber exactamente 1 respuesta correcta');
    }
    
    if (draft.type === 'sequencing') {
      const orders = draft.options.map((o: any) => o.order);
      const uniqueOrders = new Set(orders);
      if (uniqueOrders.size !== orders.length) errs.push('Los órdenes deben ser únicos');
    }
    
    if (draft.type === 'memory' && draft.options.length < 2) {
      errs.push('Memoria necesita al menos 2 parejas (4 cartas)');
    }
    
    if (draft.type === 'tracing') {
      const hasCorrect = draft.options.some((o: any) => o.isCorrect);
      if (!hasCorrect) errs.push('Debe haber un destino correcto');
    }

    setErrors(errs);
    return errs.length === 0;
  }, [draft]);

  const generateJSON = useCallback((): Way | null => {
    if (!validate()) return null;
    
    return {
      ...draft,
      id: `custom-${Date.now()}`,
    } as Way;
  }, [draft, validate]);

  const reset = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
    setErrors([]);
  }, []);

  return {
    draft,
    errors,
    updateField,
    updateStimulus,
    updateMetadata,
    validate,
    generateJSON,
    reset,
  };
}
