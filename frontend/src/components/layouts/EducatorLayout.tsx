import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function EducatorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col border-r border-outline-variant/10 shadow-2xl hidden md:flex">
        <div className="h-20 flex items-center px-8 gap-stack-md">
          <img alt="Cogniva Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHI0LZ8UW9ECct8w2k-2DqU8NDfeG3N2NFCkvA1EauW0dOIP_JofbfLrcnbwI95878MlbvRqTkp5jw8kAvn6VLGiJFFri6zCiDmLRdOW-OyFZ2EDZTHg8_YvqZAxoQFPKFFPW5E4JwX3FZqiUPDvkR1G8DLcXTF0n1C9dBlR7W_Ay0mWq1Up_CMV9fBwe2uzJ0R_5VtzoAeNayMb1cbCczg7Pt_4QlTsd5UgGASMsJ3L_Tg0UI_aEn"/>
          <span className="font-headline-md text-headline-md text-primary tracking-tight">Cogniva</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-stack-md">
          <div className="px-4 mb-stack-sm text-label-sm font-label-sm text-outline uppercase tracking-widest opacity-60">Educator Portal</div>
          <Link 
            to="/educator" 
            className={`flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all ${isActive('/educator') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-body-md">Class Analytics</span>
          </Link>
          
          <div 
            className={`flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all text-on-surface-variant/30 cursor-not-allowed`}
          >
            <span className="material-symbols-outlined">groups</span>
            <span className="font-body-md">Students Roster</span>
          </div>

          <div className="px-4 mt-stack-lg mb-stack-sm text-label-sm font-label-sm text-outline uppercase tracking-widest opacity-60">Student Tools</div>
          
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Student View</span>
          </Link>
        </nav>
        
        <div className="p-6 border-t border-outline-variant/10 flex flex-col gap-4">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-surface-container-high text-on-surface-variant py-3 px-4 rounded-xl font-label-md hover:bg-surface-bright transition-all">
            <span className="material-symbols-outlined text-[18px]">logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="pl-0 md:pl-72 w-full flex flex-col min-h-screen relative">
        <header className="sticky md:fixed top-0 md:left-72 right-0 h-20 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 z-40 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-12">
            <nav className="flex gap-8">
              <span className="transition-colors text-primary font-bold">Educator View</span>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-body-sm font-bold text-on-surface">{user?.name || 'Educator'}</div>
                <div className="text-label-sm text-outline">Lead Instructor</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[20px]">school</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="relative pt-20 bg-background flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
