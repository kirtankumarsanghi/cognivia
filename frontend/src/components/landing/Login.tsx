import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease } }),
};

export default function Login() {
  const { login, user, profileIncomplete, retryProfileFetch } = useAuth();
  const location = useLocation();
  const sessionExpiredMsg = (location.state as any)?.sessionError;

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Error & loading
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState<string | null>(sessionExpiredMsg || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Redirect if already logged in (and profile is complete)
  if (user && !profileIncomplete) {
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/educator'} replace />;
  }

  // Profile incomplete state — show recovery UI
  if (user && profileIncomplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
          }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[32px] text-amber-400">warning</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Account Setup Incomplete</h2>
          <p className="text-white/50 text-sm mb-6">
            Your account exists but your profile data couldn't be loaded. This may be a temporary issue.
          </p>
          <button
            onClick={retryProfileFetch}
            className="w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm text-white flex items-center justify-center gap-2"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(232, 64, 64, 0.35)' }}
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Retry Loading Profile
          </button>
          <button
            onClick={async () => {
              const { useAuth: _ } = await import('../../hooks/useAuth');
              // We can't call logout from here directly, so use the auth context
              window.location.href = '/login';
            }}
            className="w-full mt-3 py-3 rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            Sign out and try again
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-submit guard
    if (submittingRef.current) return;

    // Client-side validation
    let hasError = false;
    setEmailError('');
    setPasswordError('');
    setServerError(null);

    if (!email.trim()) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) return;

    // Lock
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await login(email.toLowerCase().trim(), password);

      if (!result.success) {
        setServerError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3.5 rounded-xl bg-[rgba(255,255,255,0.03)] border text-white placeholder-[rgba(255,255,255,0.25)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]/40 ${
      hasError
        ? 'border-red-500/60 focus:border-red-500'
        : 'border-[rgba(255,255,255,0.06)] focus:border-[var(--accent)]/50'
    }`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#030303]">

      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-[rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#030303]/60 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#030303] z-10" />
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000&auto=format&fit=crop"
            alt="Students collaborating"
            className="w-full h-full object-cover opacity-30 grayscale sepia-[.2] hue-rotate-[-50deg] saturate-[2]"
          />
        </div>

        <div className="relative z-20 flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <span className="text-xl font-bold tracking-widest text-white" style={{ fontFamily: 'var(--font-display)' }}>COGNIVA</span>
        </div>

        <div className="relative z-20 max-w-md">
          <p className="text-white/80 text-xl leading-relaxed italic mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            "Most confusion never gets reported. We turn those silent signals into actionable learning intelligence."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-[var(--accent)]"></div>
            <span className="text-[var(--accent)] uppercase tracking-widest text-xs font-mono">The Cogniva Vision</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(232, 64, 64, 0.1) 0%, transparent 70%)' }} />

        <motion.div
          initial="hidden" animate="visible"
          className="w-full max-w-[520px] rounded-2xl p-8 md:p-12 relative z-10"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Header */}
          <motion.div custom={0} variants={fadeUp} className="text-center mb-10 flex flex-col items-center relative">
            <Link to="/" className="absolute left-0 top-0 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-mono">
              <ArrowLeft className="w-4 h-4" /> BACK
            </Link>

            <div className="lg:hidden flex items-center justify-center mt-6 mb-8 shadow-xl rounded-full bg-black/50 p-2">
              <Logo className="w-12 h-12" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-3 lg:mt-6" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em', color: '#fff' }}>
              Welcome Back
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              Turn Confusion Into Clarity
            </p>
          </motion.div>

          {/* Session expired / server error banner */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
              <span>{serverError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Email */}
            <motion.div custom={1} variants={fadeUp}>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2 font-mono">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                className={inputClass(!!emailError)}
                placeholder="you@university.edu"
                autoComplete="email"
              />
              {emailError && <p className="text-red-400 text-xs mt-1.5 font-mono">{emailError}</p>}
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp}>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2 font-mono">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  className={inputClass(!!passwordError)}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && <p className="text-red-400 text-xs mt-1.5 font-mono">{passwordError}</p>}
            </motion.div>

            {/* Submit */}
            <motion.div custom={3} variants={fadeUp} className="mt-2">
              <button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting ? 'rgba(232, 64, 64, 0.3)' : 'var(--accent)',
                  color: '#fff',
                  boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(232, 64, 64, 0.35)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </motion.div>
          </form>

          {/* Demo Accounts */}
          <motion.div custom={3.5} variants={fadeUp} className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-3 font-mono text-center">Fast Demo Login</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={async () => {
                  setEmail('educator@cognivia.demo');
                  setPassword('password123');
                  if (submittingRef.current) return;
                  submittingRef.current = true;
                  setIsSubmitting(true);
                  try {
                    const res = await login('educator@cognivia.demo', 'password123');
                    if (!res.success) setServerError(res.error || 'Something went wrong.');
                  } finally {
                    submittingRef.current = false;
                    setIsSubmitting(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-white/70 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">school</span>
                Educator
              </button>
              <button
                type="button"
                onClick={async () => {
                  setEmail('student@cognivia.demo');
                  setPassword('password123');
                  if (submittingRef.current) return;
                  submittingRef.current = true;
                  setIsSubmitting(true);
                  try {
                    const res = await login('student@cognivia.demo', 'password123');
                    if (!res.success) setServerError(res.error || 'Something went wrong.');
                  } finally {
                    submittingRef.current = false;
                    setIsSubmitting(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-white/70 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">person</span>
                Student
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div custom={4} variants={fadeUp} className="text-center mt-8">
            <p className="text-white/30 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[var(--accent)] hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
