import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function QuickLogin() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('Logging in...');
  const [error, setError] = useState('');

  useEffect(() => {
    const doLogin = async () => {
      if (!role || (role !== 'student' && role !== 'educator')) {
        setError('Invalid role. Use ?role=student or ?role=educator');
        return;
      }

      const email = role === 'student' ? 'student_demo@cognivia.com' : 'educator_demo@cognivia.com';
      const password = 'password123!';

      setStatus(`Logging in as ${role}...`);
      
      try {
        const result = await login(email, password);
        
        if (result.success) {
          setStatus('Success! Redirecting...');
          setTimeout(() => {
            navigate(role === 'student' ? '/dashboard' : '/educator', { replace: true });
          }, 500);
        } else {
          setError(result.error || 'Login failed');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      } catch (err) {
        setError('Unexpected error occurred');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    doLogin();
  }, [role, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303]">
      <div className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
        }}
      >
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[32px] text-red-400">error</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Login Failed</h2>
            <p className="text-white/50 text-sm mb-6">{error}</p>
            <p className="text-white/30 text-xs">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Quick Login</h2>
            <p className="text-white/50 text-sm">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
