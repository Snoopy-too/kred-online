import { createClient } from '@supabase/supabase-js';

const defaultSupabaseUrl = 'https://ynunrzbcnmxagcxwcpoh.supabase.co';
const defaultSupabaseAnonKey = 'sb_publishable_VY4S5qTlOD9MsIs1D3i9cg_K2eKVSYp';

const supabaseUrl = (typeof window !== 'undefined' && (window.VITE_SUPABASE_URL || window.SUPABASE_URL)) || import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = (typeof window !== 'undefined' && (window.VITE_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY)) || import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

/**
 * Ensures the user has an active Supabase session using Anonymous Guest Login.
 * If no session exists, calls signInAnonymously.
 * 
 * @returns {Promise<{ user: object|null, error: object|null }>}
 */
export async function ensureAnonymousAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return { user: session.user, error: null };
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Failed anonymous guest login:', error.message);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Error during anonymous authentication:', err);
    return { user: null, error: err };
  }
}
