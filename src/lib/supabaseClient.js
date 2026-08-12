import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Online multiplayer will run in fallback / local mode until configured in .env.local.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
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
