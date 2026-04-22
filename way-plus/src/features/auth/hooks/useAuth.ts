import { useEffect, useState } from 'react';
import { supabase } from '@/core/services/supabaseClient';

export interface UserProfile {
  id: string;
  role: 'therapist' | 'parent' | 'admin';
  full_name: string;
  center_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error) setProfile(data);
    setLoading(false);
  };

  const signIn = (email: string, password: string) => 
    supabase?.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string, metadata: any) =>
    supabase?.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: metadata,
        emailRedirectTo: window.location.origin
      } 
    });

  const signOut = () => supabase?.auth.signOut();

  return { user, profile, loading, signIn, signUp, signOut };
}
