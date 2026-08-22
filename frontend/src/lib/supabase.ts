import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

/**
 * Detects whether localStorage is available and writable.
 * Returns false in private browsing modes, corporate-blocked environments,
 * or when cookies/storage are disabled.
 */
export function isStorageAvailable(): boolean {
  const testKey = '__cogniva_storage_test__';
  try {
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isStorageAvailable(),
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
