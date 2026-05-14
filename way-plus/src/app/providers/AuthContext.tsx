/**
 * AuthContext.tsx
 * Estado global de autenticación.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/core/services/supabaseClient';

export interface UserProfile {
  id: string;
  role: 'therapist' | 'parent' | 'admin';
  full_name: string;
  center_name?: string;
}

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    } else if (error?.code === 'PGRST116') {
      // Perfil no existe — crearlo automáticamente
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'therapist',
          full_name: user?.email?.split('@')[0] ?? 'Terapeuta',
        })
        .select()
        .single();
      if (newProfile) setProfile(newProfile);
    }
    setLoading(false);
  };

  useEffect(() => {
    // MODO DEMO: Bypass para auditorías rápidas en desarrollo
    if (localStorage.getItem('way-demo-mode') === 'true') {
      setUser({ id: 'demo-user', email: 'demo@wayplus.dev' });
      setProfile({
        id: 'demo-user',
        role: 'therapist',
        full_name: 'Maite (Demo Mode)',
        center_name: 'Clínica WayPlus'
      });
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listener para cambios de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    if (!supabase) return { error: new Error('Supabase no disponible') };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/therapist`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
