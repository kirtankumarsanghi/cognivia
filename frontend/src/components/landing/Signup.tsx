import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';
import { isStorageAvailable } from '../../lib/supabase';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease } }),
};

// ─── Validation ──────────────────────────────────────────────────────

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

function validateFields(name: string, email: string, password: string, confirmPassword: string, role: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!role) {
    errors.role = 'Please select a role.';
  }

  return errors;
}

// ─── Component ───────────────────────────────────────────────────────

export default function Signup() {
  const { signup, user } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'educator' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Error & loading state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false); // Prevents double-submit even if state lags

  // Storage detection
  const storageOk = isStorageAvailable();

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCountdown(rateLimitCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (rateLimitCountdown === 0 && isRateLimited) {
      setIsRateLimited(false);
    }
  }, [rateLimitCountdown, isRateLimited]);

  // Already logged in? Redirect.
  if (user) {
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/educator'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-submit guard
    if (submittingRef.current || isRateLimited) return;

    // Client-side validation — no network call if invalid
    const errors = validateFields(name, email, password, confirmPassword, role);
    setFieldErrors(errors);
    setServerError(null);

    if (Object.keys(errors).length > 0) return;

    // Lock
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await signup(name.trim(), email.toLowerCase().trim(), password, role as 'student' | 'educator');

      if (!result.success) {
        // Check if it's a rate limit error
        if (result.code === 'rate_limited' && result.retryAfter) {
          setIsRateLimited(true);
          setRateLimitCountdown(result.retryAfter);
          setServerError(`Too many signup attempts. Please wait ${result.retryAfter} seconds before trying again.`);
        } else {
          setServerError(result.error || 'Something went wrong. Please try again.');
        }
      }
      // On success, the auth state change triggers redirect via the Navigate check above
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-3.5 rounded-xl bg-[rgba(255,255,255,0.03)] border text-white placeholder-[rgba(255,255,255,0.25)] outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]/40 ${
      fieldErrors[field]
        ? 'border-red-500/60 focus:border-red-500'
        : 'border-[rgba(255,255,255,0.06)] focus:border-[var(--accent)]/50'
    }`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#030303]">

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-[rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#030303]/60 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#030303] z-10" />
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop"
            alt="Students studying together"
            className="w-full h-full object-cover opacity-30 grayscale sepia-[.2] hue-rotate-[-50deg] saturate-[2]"
          />
        </div>

        <div className="relative z-20 flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <span className="text-xl font-bold tracking-widest text-white" style={{ fontFamily: 'var(--font-display)' }}>COGNIVA</span>
        </div>

        <div className="relative z-20 max-w-md">
          <p className="text-white/80 text-xl leading-relaxed italic mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            "Join thousands of learners and educators who've transformed how they teach and study."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-[1px] bg-[var(--accent)]"></div>
            <span className="text-[var(--accent)] uppercase tracking-widest text-xs font-mono">Start Learning Today</span>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
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
          <motion.div custom={0} variants={fadeUp} className="text-center mb-8 relative">
            <Link to="/" className="absolute left-0 top-0 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-mono">
              <ArrowLeft className="w-4 h-4" /> BACK
            </Link>

            <div className="lg:hidden flex items-center justify-center mt-6 mb-6 shadow-xl rounded-full bg-black/50 p-2">
              <Logo className="w-12 h-12" />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-2 lg:mt-6" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em', color: '#fff' }}>
              Create Account
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              Start your learning journey
            </p>
          </motion.div>

          {/* Storage Warning */}
          {!storageOk && (
            <motion.div custom={0.5} variants={fadeUp} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="font-bold">Cookies Required:</span> Please enable cookies and localStorage in your browser settings to create an account.
            </motion.div>
          )}

          {/* Server Error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                isRateLimited 
                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {isRateLimited ? (
                <Clock className="w-5 h-5 mt-0.5 shrink-0 animate-pulse" />
              ) : (
                <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
              )}
              <div className="flex-1">
                <div className="font-semibold mb-1">
                  {isRateLimited ? '⏳ Rate Limit Active' : 'Error'}
                </div>
                <div>
                  {isRateLimited && rateLimitCountdown > 0 ? (
                    <>
                      Too many signup attempts. Try again in{' '}
                      <span className="font-bold font-mono text-lg">
                        {rateLimitCountdown}s
                      </span>
                    </>
                  ) : (
                    serverError
                  )}
                </div>
                {isRateLimited && (
                  <div className="mt-2 text-xs opacity-75">
                    This is a security measure. Your account data is safe.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Name */}
            <motion.div custom={1} variants={fadeUp}>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2 font-mono">Full Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: undefined })); }}
                className={inputClass('name')}
                placeholder="Your full name"
                autoComplete="name"
              />
              {fieldErrors.name && <p className="text-red-400 text-xs mt-1.5 font-mono">{fieldErrors.name}</p>}
            </motion.div>

            {/* Email */}
            <motion.div custom={1.5} variants={fadeUp}>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2 font-mono">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })); }}
                className={inputClass('email')}
                placeholder="you@university.edu"
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-red-400 text-xs mt-1.5 font-mono">{fieldErrors.email}</p>}
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp}>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2 font-mono">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  className={inputClass('password')}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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
              {fieldErrors.password && <p className="text-red-400 text-xs mt-1.5 font-mono">{fieldErrors.password}</p>}
            </motion.div>

            {/* Confirm Password */}
            <motion.div custom={2.5} variants={fadeUp}>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-2 font-mono">Confirm Password</label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: undefined })); }}
                  className={inputClass('confirmPassword')}
                  placeholder="Type your password again"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1.5 font-mono">{fieldErrors.confirmPassword}</p>}
            </motion.div>

            {/* Role */}
            <motion.div custom={3} variants={fadeUp}>
              <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'educator'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setFieldErrors(p => ({ ...p, role: undefined })); }}
                    className={`py-3.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-3 text-sm font-medium ${
                      role === r
                        ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-white/50 hover:border-[rgba(255,255,255,0.15)] hover:text-white/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{r === 'student' ? 'school' : 'history_edu'}</span>
                    {r === 'student' ? 'Student' : 'Educator'}
                  </button>
                ))}
              </div>
              {fieldErrors.role && <p className="text-red-400 text-xs mt-1.5 font-mono">{fieldErrors.role}</p>}
            </motion.div>

            {/* Submit */}
            <motion.div custom={3.5} variants={fadeUp} className="mt-2">
              <button
                id="signup-submit"
                type="submit"
                disabled={isSubmitting || !storageOk || isRateLimited}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting || isRateLimited ? 'rgba(232, 64, 64, 0.3)' : 'var(--accent)',
                  color: '#fff',
                  boxShadow: isSubmitting || isRateLimited ? 'none' : '0 4px 14px rgba(232, 64, 64, 0.35)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : isRateLimited ? (
                  <>
                    <Clock className="w-4 h-4 animate-pulse" />
                    Wait {rateLimitCountdown}s
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer link */}
          <motion.div custom={4} variants={fadeUp} className="text-center mt-8">
            <p className="text-white/30 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--accent)] hover:underline font-medium">
                Log in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
