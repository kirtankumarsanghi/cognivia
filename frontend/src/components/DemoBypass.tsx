import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, User, GraduationCap, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function DemoBypass() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'educator' | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const accounts = {
    student: { email: 'student_demo@cognivia.com', password: 'password123!' },
    educator: { email: 'educator_demo@cognivia.com', password: 'password123!' }
  };

  useEffect(() => {
    if (!selectedRole) return;

    const doLogin = async () => {
      const { email, password } = accounts[selectedRole];
      setStatus(`Logging in as ${selectedRole}...`);
      setError('');

      try {
        const result = await login(email, password);

        if (result.success) {
          setStatus('Success! Redirecting...');
          setTimeout(() => {
            navigate(selectedRole === 'student' ? '/dashboard' : '/educator', { replace: true });
          }, 800);
        } else {
          setError(result.error || 'Login failed. Please try again.');
          setSelectedRole(null);
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Unexpected error occurred. Please try again.');
        setSelectedRole(null);
      }
    };

    doLogin();
  }, [selectedRole, login, navigate]);

  if (selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
          }}
        >
          <Loader2 className="w-16 h-16 text-[#e84040] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Quick Login</h2>
          <p className="text-white/50 text-sm">{status}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full rounded-2xl p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block mb-4"
          >
            <span className="text-5xl">🧠</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Cognivia Demo</h1>
          <p className="text-white/50 text-sm">
            Choose your role to explore the platform
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium mb-1">Login Failed</p>
              <p className="text-red-400/70 text-xs">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Role Selection Buttons */}
        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedRole('student')}
            className="w-full p-6 rounded-xl text-left transition-all duration-200 group"
            style={{
              background: 'linear-gradient(135deg, rgba(232, 64, 64, 0.15), rgba(192, 32, 32, 0.1))',
              border: '1px solid rgba(232, 64, 64, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(232, 64, 64, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e84040]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-[#e84040]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">Student View</h3>
                <p className="text-white/50 text-sm">
                  Experience personalized learning and AI-powered tutoring
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setSelectedRole('educator')}
            className="w-full p-6 rounded-xl text-left transition-all duration-200 group"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(232, 64, 64, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(232, 64, 64, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#e84040]/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-white/70 group-hover:text-[#e84040] transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">Educator View</h3>
                <p className="text-white/50 text-sm">
                  Manage courses, track student progress, and build curriculum
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-6 border-t border-white/5"
        >
          <p className="text-white/30 text-xs text-center">
            Demo accounts are pre-configured with sample data.
            <br />
            No signup required.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
