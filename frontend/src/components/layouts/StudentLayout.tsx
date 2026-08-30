import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { premiumEase } from '../../utils/animation';

const studentLinks = [
  ['/dashboard', 'dashboard', 'Student Home'],
  ['/courses', 'menu_book', 'My Courses'],
  ['/tutor', 'psychology', 'AI Tutor'],
  ['/revision', 'event_repeat', 'Revision Plan'],
  ['/study-groups', 'group', 'Peer Study Hub'],
  ['/knowledge-graph', 'hub', 'Knowledge Graph'],
  ['/ml-insights', 'memory', 'ML Insights'],
  ['/achievements', 'emoji_events', 'Achievements'],
] as const;

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [isSubmittingSignal, setIsSubmittingSignal] = useState(false);
  const location = useLocation();
  const close = () => setMenuOpen(false);

  const handleConfusedClick = async () => {
    const conceptId = localStorage.getItem('cognivia_current_concept_id');
    if (!conceptId) {
      // No concept active, route to tutor to let them pick
      close();
      navigate('/tutor');
      return;
    }

    setIsSubmittingSignal(true);
    try {
      await api.post('/confusion/signal', {
        concept_id: conceptId,
        signal: 'Confused'
      });
    } catch (err) {
      console.error('Failed to post confusion signal', err);
    } finally {
      setIsSubmittingSignal(false);
      close();
      navigate(`/tutor?concept=${conceptId}`);
    }
  };

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => { setIsDesktop(query.matches); if (query.matches) setMenuOpen(false); };
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return <div className="app-frame">
    {/* Animated backdrop */}
    <AnimatePresence>
      {menuOpen && (
        <motion.button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>

    {/* Animated sidebar */}
    <motion.aside
      initial={false}
      animate={{ x: isDesktop || menuOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="app-sidebar md:!translate-x-0"
    >
      <Link to="/dashboard" onClick={close} className="brand"><span className="brand-mark">◉</span><span>Cogniva</span></Link>
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="nav-label">Main dashboard</p>
        {studentLinks.map(([to, icon, label]) => {
          const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/dashboard');
          return (
            <NavLink
              end={to === '/dashboard'}
              key={to}
              to={to}
              onClick={close}
              className={`nav-item relative ${isActive ? 'nav-item-active' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'var(--accent-dim)', zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined">{icon}</span>{label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-outline-variant/10 space-y-2">
        <button 
          onClick={handleConfusedClick} 
          disabled={isSubmittingSignal}
          className={`confused-button w-full flex items-center gap-2 ${isSubmittingSignal ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmittingSignal ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">emergency</span>
          )}
          {isSubmittingSignal ? 'Sending...' : "I'm Confused"}
        </button>
        <button onClick={() => logout()} className="nav-item w-full"><span className="material-symbols-outlined">logout</span>Sign out</button>
      </div>
    </motion.aside>

    <section className="app-content">
      <header className="app-topbar">
        <button aria-label="Open navigation" className="icon-button md:hidden" onClick={() => setMenuOpen(true)}><span className="material-symbols-outlined">menu</span></button>
        <Link to="/dashboard" className="md:hidden brand text-lg"><span className="brand-mark">◉</span>Cogniva</Link>
        <nav className="hidden md:flex gap-2">
          <span className="view-button view-button-active">Student View</span>
        </nav>
        <div className="ml-auto flex items-center gap-3"><button aria-label="Notifications" className="icon-button"><span className="material-symbols-outlined">notifications</span></button><div className="hidden sm:block text-right"><p className="text-sm font-bold text-on-surface">{user?.name}</p><p className="text-label-sm text-outline">{user?.role === 'student' ? 'Student' : 'Educator'}</p></div><div className="avatar"><span className="material-symbols-outlined">person</span></div></div>
      </header>
      <main className="app-main">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: premiumEase as unknown as number[] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <nav className="mobile-nav md:hidden">{studentLinks.map(([to, icon, label]) => <NavLink end={to === '/dashboard'} key={to} to={to} className={({ isActive }: { isActive: boolean }) => `mobile-nav-item ${isActive ? 'text-primary' : ''}`}><span className="material-symbols-outlined">{icon}</span><span>{label.split(' ')[0]}</span></NavLink>)}</nav>
    </section>
  </div>;
}
