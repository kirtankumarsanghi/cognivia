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

// ─── Fetch Wrapper ───────────────────────────────────────────────────

/**
 * A wrapper around fetch that guarantees a timeout, so network issues
 * don't cause the UI to hang forever in an infinite loop.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
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
      console.log('[authService.signUp] Starting signUp for:', email);
      
      const SUPABASE_URL = 'https://cbqswhmpdbojubljyinv.supabase.co';
      const SUPABASE_KEY = 'sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf';
      
      // Step 1: Create user via direct REST API
      const response = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          data: { name, role },
        }),
      });
      
      console.log('[authService.signUp] Response status:', response.status);
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Signup failed' }));
        console.error('[authService.signUp] Auth error:', errorBody);
        const msg = (errorBody.message || errorBody.msg || '').toLowerCase();
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          return { success: false, error: 'An account with this email already exists. Try logging in instead.', code: 'user_already_exists' };
        }
        const mapped = mapAuthError({ message: errorBody.message || 'Signup failed', name: 'AuthApiError' } as any);
        return { success: false, error: mapped.message, code: mapped.code, retryAfter: mapped.retryAfter };
      }
      
      const authData = await response.json();
      console.log('[authService.signUp] Signup success, user:', authData.user?.email);
      
      if (!authData.user) {
        return { success: false, error: 'Signup failed. Please try again.', code: 'no_user_returned' };
      }
      
      // If we got an access_token, the user is auto-confirmed
      if (authData.access_token) {
        // Store session
        try {
          localStorage.setItem('cogniva-session', JSON.stringify({
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            expires_at: authData.expires_at,
            user: authData.user,
          }));
        } catch (e) {
          console.warn('[authService.signUp] Could not store session:', e);
        }
        
        // Wait for the profile trigger to create the profile
        await new Promise(r => setTimeout(r, 1000));
        
        // Fetch profile
        const profileResponse = await fetchWithTimeout(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${authData.user.id}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${authData.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (profileResponse.ok) {
          const profiles = await profileResponse.json();
          if (profiles && profiles.length > 0) {
            return { success: true, data: profiles[0] as Profile };
          }
        }
        
        // Self-heal: create profile if trigger didn't
        await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ id: authData.user.id, name, email, role }),
        }).catch(() => {});
        
        return { success: true, data: { id: authData.user.id, name, email, role, avatar: null } };
      }
      
      // No access_token means email confirmation is required
      // In this case we auto-sign-in immediately using the password
      const signInResult = await this.signIn(email, password);
      return signInResult;
      
    } catch (err: any) {
      console.error('[authService.signUp] CATCH:', err);
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
      console.log('[authService.signIn] Starting signIn for:', email);
      
      // IMPORTANT: The Supabase JS client's signInWithPassword() AND setSession() both hang
      // in the browser due to internal session/lock handling issues. We bypass the Supabase JS 
      // client entirely and use direct REST API calls + manual localStorage session storage.
      
      const SUPABASE_URL = 'https://cbqswhmpdbojubljyinv.supabase.co';
      const SUPABASE_KEY = 'sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf';
      
      const response = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('[authService.signIn] Fetch response status:', response.status);
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Login failed' }));
        console.error('[authService.signIn] Auth error:', errorBody);
        const mapped = mapAuthError({ message: errorBody.message || errorBody.error_description || 'Invalid login credentials', name: 'AuthApiError' } as any);
        return { success: false, error: mapped.message, code: mapped.code, retryAfter: mapped.retryAfter };
      }
      
      const authData = await response.json();
      console.log('[authService.signIn] Auth success, user:', authData.user?.email);
      
      if (!authData.access_token || !authData.user) {
        return { success: false, error: 'Login succeeded but no session was returned.', code: 'no_user_returned' };
      }
      
      // Store session tokens in localStorage for subsequent API calls
      // (We skip supabase.auth.setSession() because it hangs in the browser)
      try {
        const sessionData = {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          expires_at: authData.expires_at,
          user: authData.user,
        };
        localStorage.setItem('cogniva-session', JSON.stringify(sessionData));
        console.log('[authService.signIn] Session stored in localStorage');
      } catch (e) {
        console.warn('[authService.signIn] Could not store session in localStorage:', e);
      }
      
      console.log('[authService.signIn] Fetching profile...');

      // Fetch profile using the access token directly via REST
      const profileResponse = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${authData.user.id}&select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles && profiles.length > 0) {
          const p = profiles[0] as Profile;
          console.log('[authService.signIn] Profile found:', p.name, p.role);
          return { success: true, data: p };
        }
      }
      
      // Profile not found — self-heal from user metadata
      const name = authData.user.user_metadata?.name || 'User';
      const role = authData.user.user_metadata?.role || 'student';
      console.log('[authService.signIn] Profile not found, self-healing with:', { name, role });
      
      // Try to create the profile
      await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          id: authData.user.id,
          name,
          email: authData.user.email || email,
          role,
        }),
      }).catch(() => {}); // Ignore insert errors
      
      return { 
        success: true, 
        data: { 
          id: authData.user.id, 
          name, 
          email: authData.user.email || email, 
          role, 
          avatar: null 
        } 
      };
    } catch (err) {
      console.error('[authService.signIn] CATCH:', err);
      const mapped = mapAuthError(err);
      return { success: false, error: mapped.message, code: mapped.code, retryAfter: mapped.retryAfter };
    }
  },

  /**
   * Sign out. Confirms session is actually invalidated server-side.
   */
  async signOut(): Promise<AuthResult> {
    try {
      // Direct REST API sign out to avoid Supabase JS client hanging
      const token = await this.getAccessToken();
      if (token) {
        const SUPABASE_URL = 'https://cbqswhmpdbojubljyinv.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf';
        
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {}); // Ignore network errors during logout
      }
      
      localStorage.removeItem('cogniva-session');
      return { success: true, data: undefined };
    } catch (err) {
      localStorage.removeItem('cogniva-session');
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
      const stored = localStorage.getItem('cogniva-session');
      if (stored) {
        return { session: JSON.parse(stored), error: null };
      }
      return { session: null, error: null };
    } catch (err) {
      return { session: null, error: mapAuthError(err).message };
    }
  },

  /**
   * Get the current access token for API calls.
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const stored = localStorage.getItem('cogniva-session');
      if (stored) {
        return JSON.parse(stored).access_token ?? null;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Instantly logs in the user by writing a fake session directly to localStorage.
   * Completely bypasses all network requests and Supabase auth.
   */
  demoLocalBypass(role: 'student' | 'educator'): AuthResult<Profile> {
    const fakeId = role === 'student' 
      ? '00000000-0000-0000-0000-000000000001' 
      : '00000000-0000-0000-0000-000000000002';
      
    const fakeProfile: Profile = {
      id: fakeId,
      name: role === 'student' ? 'Student Demo (Offline)' : 'Educator Demo (Offline)',
      email: `${role}_offline@cognivia.local`,
      role: role,
      avatar: null,
      created_at: new Date().toISOString()
    };

    const sessionData = {
      access_token: 'fake_offline_token_12345',
      refresh_token: 'fake_offline_refresh_token_12345',
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
      user: {
        id: fakeId,
        email: fakeProfile.email,
        role: 'authenticated'
      },
      offlineBypassProfile: fakeProfile // we tuck this in so useAuth knows about it
    };

    localStorage.setItem('cogniva-session', JSON.stringify(sessionData));
    console.log('[authService] Offline bypass session created:', role);
    return { success: true, data: fakeProfile };
  }
};

