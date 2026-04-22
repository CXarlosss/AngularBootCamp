import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Remove trailing /rest/v1 if present to avoid duplication in the client
const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[WAY+] Supabase credentials missing. App running in LOCAL-ONLY mode.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env or Vercel dashboard.'
  );
}

// Safe export: null when credentials missing so the rest of the app
// can detect offline/local mode without crashing at module load time.
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const isSupabaseAvailable = isConfigured;
