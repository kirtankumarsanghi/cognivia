import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbqswhmpdbojubljyinv.supabase.co';
const supabaseAnonKey = 'sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf';

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
