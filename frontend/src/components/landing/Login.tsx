import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/educator'} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-surface-bright/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant/20 p-10 shadow-2xl relative z-10">
        
        <div className="text-center mb-10 flex flex-col items-center">
          <span className="material-symbols-outlined text-[48px] text-primary mb-4">psychology</span>
          <h1 className="font-headline-xl text-headline-xl text-on-background mb-2">Cogniva</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Turn Confusion Into Clarity</p>
        </div>
        
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Select demo role</span>
            <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
          </div>
          
          <button 
            onClick={() => login('student')}
            className="group w-full bg-surface hover:bg-surface-bright text-on-surface font-body-md py-4 px-5 rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-all flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">school</span>
              <span className="font-medium">Login as Student</span>
            </div>
            <span className="font-label-sm text-label-sm bg-surface-container-high px-2 py-1 rounded text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-outline-variant/10">Ada Lovelace</span>
          </button>
          
          <button 
            onClick={() => login('educator')}
            className="group w-full bg-surface hover:bg-surface-bright text-on-surface font-body-md py-4 px-5 rounded-xl border border-outline-variant/20 hover:border-secondary/50 transition-all flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">history_edu</span>
              <span className="font-medium">Login as Educator</span>
            </div>
            <span className="font-label-sm text-label-sm bg-surface-container-high px-2 py-1 rounded text-on-surface-variant group-hover:bg-secondary/10 group-hover:text-secondary transition-colors border border-outline-variant/10">Prof. Turing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
