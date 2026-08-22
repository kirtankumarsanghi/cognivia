import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { premiumEase } from '../../utils/animation';

const studentLinks = [
  ['/dashboard', 'dashboard', 'Student Home'],
  ['/courses', 'menu_book', 'My Courses'],
  ['/tutor', 'psychology', 'AI Tutor'],
  ['/revision', 'event_repeat', 'Revision Plan'],
  ['/study-groups', 'group', 'Peer Study Hub'],
  ['/knowledge-graph', 'hub', 'Knowledge Graph'],
  ['/achievements', 'emoji_events', 'Achievements'],
] as const;

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const location = useLocation();
  const close = () => setMenuOpen(false);

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
        <Link to="/tutor" onClick={close} className="confused-button"><span className="material-symbols-outlined text-[18px]">emergency</span>I'm Confused</Link>
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
