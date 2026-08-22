import { supabase } from '../lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'educator';
  avatar: string | null;
  created_at?: string;
}

export type AuthResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code: string; retryAfter?: number };

// ─── Error Mapping ───────────────────────────────────────────────────

function mapAuthError(err: AuthError | Error | unknown): { message: string; code: string; retryAfter?: number } {
  // Handle Supabase AuthError objects
  if (err && typeof err === 'object' && 'message' in err) {
    const authErr = err as AuthError;
    const msg = (authErr.message || '').toLowerCase();
    const status = 'status' in authErr ? (authErr as any).status : undefined;

    // Log full error for debugging
    console.error('[AuthService] Error details:', {
      message: authErr.message,
      status,
      code: 'code' in authErr ? (authErr as any).code : undefined,
      name: authErr.name,
      fullError: authErr,
    });

    // Duplicate user
    if (msg.includes('user already registered') || msg.includes('already been registered')) {
      return { message: 'An account with this email already exists. Try logging in instead.', code: 'user_already_exists' };
    }

    // Invalid / malformed email
    if (msg.includes('unable to validate email') || msg.includes('invalid email') || msg.includes('provide a valid email')) {
      return { message: 'Please enter a valid email address.', code: 'invalid_email' };
    }

    // Weak password
    if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('at least'))) {
      return { message: 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.', code: 'weak_password' };
    }

    // Wrong credentials (login)
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return { message: 'Incorrect email or password. Please try again.', code: 'invalid_credentials' };
    }

    // Email not confirmed
    if (msg.includes('email not confirmed') || msg.includes('confirm your email')) {
      return { message: 'Please check your inbox and confirm your email address before logging in.', code: 'email_not_confirmed' };
    }

    // Rate limited - detect actual rate limit errors
    if (status === 429 || msg.includes('email rate limit') || msg.includes('over_email_send_rate_limit') || msg.includes('too many requests')) {
      // Try to extract retry-after from headers if available
      let retryAfter = 60; // Default 60 seconds
      
      // Check if there's a specific rate limit message
      if (msg.includes('email rate limit')) {
        retryAfter = 300; // 5 minutes for email rate limits
      }
      
      console.warn('[AuthService] GENUINE RATE LIMIT DETECTED:', {
        status,
        message: authErr.message,
        retryAfter,
        type: msg.includes('email') ? 'email_rate_limit' : 'request_rate_limit'
      });
      
      return { 
        message: 'Too many signup attempts. Please wait before trying again.', 
        code: 'rate_limited',
        retryAfter 
      };
    }

    // Network / fetch errors
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch') || msg.includes('unable to connect')) {
      return { message: 'Unable to reach the server. Please check your internet connection and try again.', code: 'network_error' };
    }

    // Catch-all: never expose raw error text
    console.error('[AuthService] Unmapped error:', { message: authErr.message, status });
    return { message: 'Something went wrong. Please try again.', code: 'unknown_error' };
  }

  // Plain Error objects (e.g. network failures)
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return { message: 'Unable to reach the server. Please check your internet connection and try again.', code: 'network_error' };
  }

  return { message: 'Something went wrong. Please try again.', code: 'unknown_error' };
}

// ─── Retry Helper ────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelayMs = 200): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(4, attempt))); // 200ms, 800ms
      }
    }
  }
  throw lastError;
}

// ─── Auth Service ────────────────────────────────────────────────────

export const authService = {

  async signUp(
    name: string,
    email: string,
    password: string,
    role: 'student' | 'educator'
  ): Promise<AuthResult<Profile>> {
    try {
      // Step 1: Create user and profile via backend to bypass rate limits and auto-confirm email
      const profile = await withRetry(async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/complete-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        });
        
        const json = await res.json();
        if (!res.ok) {
          throw { isApiError: true, message: json.error || 'Failed to create account', code: json.code };
        }
        return json.profile as Profile;
      });

      // Step 2: Sign in to get the session locally
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Very unlikely to fail if Step 1 succeeded, but handle it gracefully
        console.error('Failed to sign in after account creation:', authError);
        return { success: false, error: 'Account created but failed to log in automatically. Please try logging in manually.', code: 'auto_login_failed' };
      }

      return { success: true, data: profile };
    } catch (err: any) {
      if (err.isApiError) {
        if (err.code === 'user_already_exists' || (err.message && err.message.toLowerCase().includes('already registered'))) {
          return { success: false, error: 'An account with this email already exists. Try logging in instead.', code: 'user_already_exists' };
        }
        return { success: false, error: err.message, code: err.code || 'signup_failed' };
      }
      const mapped = mapAuthError(err);
      return { success: false, error: mapped.message, code: mapped.code, retryAfter: mapped.retryAfter };
    }
  },

  /**
   * Sign in with email/password.
   * Returns the profile on success — never leaves partial state.
   */
  async signIn(email: string, password: string): Promise<AuthResult<Profile>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const mapped = mapAuthError(authError);
        return { success: false, error: mapped.message, code: mapped.code, retryAfter: mapped.retryAfter };
      }

      if (!authData.user) {
        return { success: false, error: 'Login succeeded but no user was returned. Please try again.', code: 'no_user_returned' };
      }

      // Fetch profile
      const profileResult = await this.getProfile(authData.user.id);
      if (!profileResult.success) {
        // Auth succeeded but profile is missing — do NOT sign out here,
        // let the caller handle the "profile incomplete" state
        return {
          success: false,
          error: 'Your account exists but your profile data is missing. Please contact support or try signing up again.',
          code: 'profile_not_found',
        };
      }

      return { success: true, data: profileResult.data };
    } catch (err) {
      const mapped = mapAuthError(err);
      return { success: false, error: mapped.message, code: mapped.code, retryAfter: mapped.retryAfter };
    }
  },

  /**
   * Sign out. Confirms session is actually invalidated server-side.
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const mapped = mapAuthError(error);
        return { success: false, error: mapped.message, code: mapped.code };
      }
      return { success: true, data: undefined };
    } catch (err) {
      // Even if signOut fails on the server, clear local state
      const mapped = mapAuthError(err);
      return { success: false, error: mapped.message, code: mapped.code };
    }
  },

  /**
   * Fetch a user's profile from the profiles table.
   */
  async getProfile(userId: string): Promise<AuthResult<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return { success: false, error: 'Profile not found.', code: 'profile_not_found' };
      }

      return { success: true, data: data as Profile };
    } catch (err) {
      const mapped = mapAuthError(err);
      return { success: false, error: mapped.message, code: mapped.code };
    }
  },

  /**
   * Get current session. Wrapper with consistent error shape.
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return { session: null, error: mapAuthError(error).message };
      }
      return { session: data.session, error: null };
    } catch (err) {
      return { session: null, error: mapAuthError(err).message };
    }
  },

  /**
   * Get the current access token for API calls.
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    } catch {
      return null;
    }
  },
};
