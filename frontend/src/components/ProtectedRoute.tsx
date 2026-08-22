import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Logo } from './common/Logo';

export const ProtectedRoute = ({ allowedRole }: { allowedRole?: 'student' | 'educator' }) => {
  const { user, isLoading, sessionError, profileIncomplete, retryProfileFetch, logout } = useAuth();
  const location = useLocation();

  // ─── Loading: full-screen spinner while resolving session ──────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Logo className="w-16 h-16 opacity-60" />
        </motion.div>
        <p className="text-white/30 text-sm font-mono tracking-widest uppercase">Loading session...</p>
      </div>
    );
  }

  // ─── Session expired: redirect with message ────────────────────────
  if (sessionError) {
    return <Navigate to="/login" state={{ sessionError }} replace />;
  }

  // ─── Not logged in: redirect to login ──────────────────────────────
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ─── Profile incomplete: recovery UI ──────────────────────────────
  if (profileIncomplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
          }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[32px] text-amber-400">person_alert</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Profile Setup Required
          </h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Your account is authenticated, but your profile data couldn't be loaded.
            This might be a temporary issue — try fetching it again.
          </p>
          <button
            onClick={retryProfileFetch}
            className="w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm text-white flex items-center justify-center gap-2 mb-3"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(232, 64, 64, 0.35)' }}
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Retry
          </button>
          <button
            onClick={() => logout()}
            className="w-full py-3 rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors border border-[rgba(255,255,255,0.05)]"
          >
            Sign out
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Wrong role: redirect to their home ───────────────────────────
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/educator'} replace />;
  }

  return <Outlet />;
};
