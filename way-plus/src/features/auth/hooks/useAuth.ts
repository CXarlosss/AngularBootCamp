/**
 * ═══════════════════════════════════════════════════════════════
 * WAY+ useAuth — Autenticación multi-rol
 * Terapeuta (OAuth), Padre (Magic Link), Niño (PIN)
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/core/services/supabase-client';
import type { User, AuthError } from '@supabase/supabase-js';

export type AuthRole = 'therapist' | 'parent' | 'child' | null;

interface AuthState {
  user: User | null;
  role: AuthRole;
  patientId: string | null; // Solo para niños
  isLoading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    patientId: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Revisar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        detectRole(session.user.id);
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    });

    // Escuchar cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        detectRole(session.user.id);
      } else {
        setState({ user: null, role: null, patientId: null, isLoading: false, error: null });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const detectRole = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const role = profile?.role as AuthRole;

    // Si es niño, buscar su patient_id
    let patientId = null;
    if (role === 'child') {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('pin_code', userId) // O relacionar con auth.user
        .single();
      patientId = patient?.id || null;
    }

    setState({
      user: await supabase.auth.getUser().then((r) => r.data.user),
      role,
      patientId,
      isLoading: false,
      error: null,
    });
  };

  // ─── LOGIN METHODS ───

  const loginTherapist = useCallback(async (provider: 'google' | 'microsoft') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/therapist/dashboard` },
    });
    if (error) setState((s) => ({ ...s, error }));
  }, []);

  const loginParent = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/parent/dashboard` },
    });
    if (error) setState((s) => ({ ...s, error }));
    return !error;
  }, []);

  const loginChild = useCallback(async (pin: string) => {
    // El niño usa un PIN de 4 dígitos. Buscamos el paciente y creamos sesión anónima.
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, display_name, character_id')
      .eq('pin_code', pin)
      .single();

    if (patientError || !patient) {
      setState((s) => ({ ...s, error: { message: 'PIN incorrecto' } as AuthError, isLoading: false }));
      return null;
    }

    // Crear sesión anónima para el niño (sin auth real, solo local)
    setState({
      user: { id: patient.id, email: '' } as User,
      role: 'child',
      patientId: patient.id,
      isLoading: false,
      error: null,
    });

    return patient;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, role: null, patientId: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    loginTherapist,
    loginParent,
    loginChild,
    logout,
    isTherapist: state.role === 'therapist',
    isParent: state.role === 'parent',
    isChild: state.role === 'child',
  };
}
