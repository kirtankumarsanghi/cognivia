import { useAuth } from '../../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease } }),
};

export default function Login() {
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/educator'} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#030303]">
      
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-[rgba(255,255,255,0.05)]">
        {/* Background Image with Dark Overlay */}
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

        {/* Top left branding */}
        <div className="relative z-20 flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <span className="text-xl font-bold tracking-widest text-white" style={{ fontFamily: 'var(--font-display)' }}>COGNIVA</span>
        </div>

        {/* Bottom left quote */}
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
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(232, 64, 64, 0.1) 0%, transparent 70%)' }} />
        
        <motion.div 
          initial="hidden" animate="visible"
          className="w-full max-w-[520px] rounded-2xl p-12 relative z-10"
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <motion.div custom={0} variants={fadeUp} className="text-center mb-12 flex flex-col items-center relative">
            <Link to="/" className="absolute left-0 top-0 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-mono">
              <ArrowLeft className="w-4 h-4" />
              BACK
            </Link>
            
            {/* Show logo only on mobile since desktop has it on the left */}
            <div className="lg:hidden flex items-center justify-center mt-6 mb-8 shadow-xl rounded-full bg-black/50 p-2">
              <Logo className="w-12 h-12" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 lg:mt-6" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em', color: '#fff' }}>Welcome Back</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Turn Confusion Into Clarity</p>
          </motion.div>
          
          <div className="flex flex-col gap-5">
            <motion.div custom={1} variants={fadeUp} className="flex items-center gap-4 mb-4">
              <div className="h-[1px] flex-1" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dimmer)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Select Demo Role</span>
              <div className="h-[1px] flex-1" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
            </motion.div>
            
            <motion.button custom={2} variants={fadeUp}
              onClick={() => login('student')}
              className="group w-full py-6 px-8 rounded-xl transition-all flex items-center justify-between relative overflow-hidden text-left"
              style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#fff'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(232, 64, 64, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="flex items-center gap-5 relative z-10">
                <span className="material-symbols-outlined text-[28px] text-[rgba(255,255,255,0.3)] group-hover:text-[var(--accent)] transition-colors">school</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 500, letterSpacing: '0.02em' }}>Login as Student</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 4, color: 'var(--text-dimmer)', letterSpacing: '0.05em' }} className="group-hover:text-[var(--accent)] transition-colors border border-[rgba(255,255,255,0.03)] shadow-inner">Ada Lovelace</span>
            </motion.button>
            
            <motion.button custom={3} variants={fadeUp}
              onClick={() => login('educator')}
              className="group w-full py-6 px-8 rounded-xl transition-all flex items-center justify-between relative overflow-hidden text-left"
              style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#fff'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(232, 64, 64, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="flex items-center gap-5 relative z-10">
                <span className="material-symbols-outlined text-[28px] text-[rgba(255,255,255,0.3)] group-hover:text-[var(--accent)] transition-colors">history_edu</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 500, letterSpacing: '0.02em' }}>Login as Educator</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 4, color: 'var(--text-dimmer)', letterSpacing: '0.05em' }} className="group-hover:text-[var(--accent)] transition-colors border border-[rgba(255,255,255,0.03)] shadow-inner">Prof. Turing</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
