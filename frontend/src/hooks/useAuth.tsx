import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, type Profile } from '../services/authService';

// ─── Types ───────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'educator';
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  sessionError: string | null;
  profileIncomplete: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string; retryAfter?: number }>;
  signup: (name: string, email: string, password: string, role: 'student' | 'educator') => Promise<{ success: boolean; error?: string; code?: string; retryAfter?: number }>;
  logout: () => Promise<void>;
  retryProfileFetch: () => Promise<void>;
  clearSessionError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // Derive a User object from a Profile
  const profileToUser = (p: Profile): User => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
  });

  // Clear all auth state
  const clearState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setProfileIncomplete(false);
  }, []);

  // ─── Initialize: check for existing session in localStorage ────────

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Initializing auth...');
        
        // Check for our custom session in localStorage
        // (We use this instead of supabase.auth.getSession() because the Supabase JS client hangs)
        const storedSession = localStorage.getItem('cogniva-session');
        
        if (!storedSession) {
          console.log('[AuthProvider] No stored session found');
          if (mounted) {
            clearState();
            setIsLoading(false);
          }
          return;
        }

        const session = JSON.parse(storedSession);
        console.log('[AuthProvider] Found stored session for:', session.user?.email);
        
        // Check if session is expired
        if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          console.log('[AuthProvider] Session expired, clearing');
          localStorage.removeItem('cogniva-session');
          if (mounted) {
            clearState();
            setIsLoading(false);
          }
          return;
        }

        // --- OFFLINE BYPASS CHECK ---
        if (session.offlineBypassProfile) {
          console.log('[AuthProvider] Loading offline bypass profile directly');
          if (mounted) {
            setUser(session.offlineBypassProfile);
            setSessionToken(session.access_token);
            setIsLoading(false);
          }
          return;
        }
        // -----------------------------

        // Fetch the profile using the stored access token
        const SUPABASE_URL = 'https://cbqswhmpdbojubljyinv.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf';
        
        const profileResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!mounted) return;

        if (profileResponse.ok) {
          const profiles = await profileResponse.json();
          if (profiles && profiles.length > 0) {
            const p = profiles[0] as Profile;
            console.log('[AuthProvider] Profile loaded:', p.name, p.role);
            setProfile(p);
            setUser(profileToUser(p));
            setProfileIncomplete(false);
            setIsLoading(false);
            return;
          }
        }
        
        // Profile not found but we have a user session — use metadata
        if (session.user) {
          console.log('[AuthProvider] Profile not found, using user metadata');
          const u: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'User',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'student',
          };
          setUser(u);
          setProfileIncomplete(true);
        } else {
          clearState();
        }
      } catch (err) {
        console.error('[AuthProvider] Init error:', err);
        if (mounted) clearState();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [clearState]);

  // ─── Login ─────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setSessionError(null);
    const result = await authService.signIn(email, password);

    if (result.success) {
      const p = result.data;
      setProfile(p);
      setUser(profileToUser(p));
      setProfileIncomplete(false);
      return { success: true };
    }

    return { success: false, error: result.error };
  }, []);

  // ─── Signup ────────────────────────────────────────────────────────

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'educator'
  ) => {
    setSessionError(null);
    const result = await authService.signUp(name, email, password, role);

    if (result.success) {
      const p = result.data;
      setProfile(p);
      setUser(profileToUser(p));
      setProfileIncomplete(false);
      return { success: true };
    }

    return { success: false, error: result.error, code: result.code, retryAfter: result.retryAfter };
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    // Clear our custom session
    localStorage.removeItem('cogniva-session');
    
    // Also try to sign out from Supabase (fire-and-forget, don't await)
    authService.signOut().catch(() => {});
    
    clearState();
    setSessionError(null);
  }, [clearState]);

  // ─── Retry Profile Fetch ──────────────────────────────────────────

  const retryProfileFetch = useCallback(async () => {
    if (!user) return;
    setProfileIncomplete(false);
    
    const SUPABASE_URL = 'https://cbqswhmpdbojubljyinv.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_AqQ0AZb6gH2AmWyLlN3_Zw_TFSQ1Qzf';
    
    const storedSession = localStorage.getItem('cogniva-session');
    if (!storedSession) {
      setProfileIncomplete(true);
      return;
    }
    
    const session = JSON.parse(storedSession);
    const profileResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (profileResponse.ok) {
      const profiles = await profileResponse.json();
      if (profiles && profiles.length > 0) {
        const p = profiles[0] as Profile;
        setProfile(p);
        setUser(profileToUser(p));
        setProfileIncomplete(false);
        return;
      }
    }
    
    setProfileIncomplete(true);
  }, [user]);

  // ─── Clear Session Error ──────────────────────────────────────────

  const clearSessionError = useCallback(() => {
    setSessionError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        sessionError,
        profileIncomplete,
        login,
        signup,
        logout,
        retryProfileFetch,
        clearSessionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
