import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { authService, type Profile } from '../services/authService';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

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

  // Fetch profile for a given user ID and update state
  const loadProfile = useCallback(async (userId: string) => {
    const result = await authService.getProfile(userId);
    if (result.success) {
      const p = result.data;
      setProfile(p);
      setUser(profileToUser(p));
      setProfileIncomplete(false);
    } else {
      // Auth session exists but no profile — flag it
      setProfileIncomplete(true);
      setProfile(null);
      // Set a minimal user from the session so we know WHO is incomplete
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Unknown',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'student',
        });
      }
    }
  }, []);

  // Clear all auth state
  const clearState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setProfileIncomplete(false);
  }, []);

  // ─── Initialize: resolve real session before anything renders ──────

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { session, error } = await authService.getSession();

        if (!mounted) return;

        if (error || !session) {
          clearState();
          setIsLoading(false);
          return;
        }

        // Valid session — fetch profile
        await loadProfile(session.user.id);
      } catch {
        if (mounted) clearState();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // ─── Listen for auth state changes (handles multi-tab, expiry) ──

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session?.user) {
              await loadProfile(session.user.id);
            }
            break;

          case 'SIGNED_OUT':
            clearState();
            break;

          default:
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, clearState]);

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

    // If profile not found but auth succeeded, mark as incomplete
    if (result.code === 'profile_not_found') {
      setProfileIncomplete(true);
      // Still need to set user from session
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Unknown',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'student',
        });
      }
      return { success: false, error: result.error };
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
    await authService.signOut();
    clearState();
    setSessionError(null);
  }, [clearState]);

  // ─── Retry Profile Fetch ──────────────────────────────────────────

  const retryProfileFetch = useCallback(async () => {
    if (!user) return;
    setProfileIncomplete(false);
    await loadProfile(user.id);
  }, [user, loadProfile]);

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
