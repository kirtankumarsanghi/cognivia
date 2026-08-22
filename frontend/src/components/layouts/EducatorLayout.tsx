import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { premiumEase } from '../../utils/animation';

export default function EducatorLayout() {
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

    <motion.aside
      initial={false}
      animate={{ x: isDesktop || menuOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="app-sidebar md:!translate-x-0"
    >
      <Link to="/educator" onClick={close} className="brand"><span className="brand-mark">◉</span><span>Cogniva</span></Link>
      <nav className="flex-1 px-3 py-5">
        <p className="nav-label">Educator portal</p>
        <NavLink
          to="/educator"
          end
          onClick={close}
          className={`nav-item relative ${location.pathname === '/educator' ? 'nav-item-active' : ''}`}
        >
          {location.pathname === '/educator' && (
            <motion.div
              layoutId="activeNavPillEducator"
              className="absolute inset-0 rounded-lg"
              style={{ background: 'var(--accent-dim)', zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span className="material-symbols-outlined">analytics</span>Class Analytics
        </NavLink>
        <NavLink
          to="/educator/roster"
          onClick={close}
          className={`nav-item relative ${location.pathname === '/educator/roster' ? 'nav-item-active' : ''}`}
        >
          {location.pathname === '/educator/roster' && (
            <motion.div
              layoutId="activeNavPillEducator"
              className="absolute inset-0 rounded-lg"
              style={{ background: 'var(--accent-dim)', zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span className="material-symbols-outlined">group</span>Class Roster
        </NavLink>
        <NavLink
          to="/educator/curriculum"
          onClick={close}
          className={`nav-item relative ${location.pathname === '/educator/curriculum' ? 'nav-item-active' : ''}`}
        >
          {location.pathname === '/educator/curriculum' && (
            <motion.div
              layoutId="activeNavPillEducator"
              className="absolute inset-0 rounded-lg"
              style={{ background: 'var(--accent-dim)', zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span className="material-symbols-outlined">auto_stories</span>Curriculum Builder
        </NavLink>
      </nav>
      <div className="p-4 border-t border-outline-variant/10">
        <button onClick={() => logout()} className="nav-item w-full"><span className="material-symbols-outlined">logout</span>Sign out</button>
      </div>
    </motion.aside>

    <section className="app-content">
      <header className="app-topbar">
        <button aria-label="Open navigation" className="icon-button md:hidden" onClick={() => setMenuOpen(true)}><span className="material-symbols-outlined">menu</span></button>
        <Link to="/educator" className="md:hidden brand text-lg"><span className="brand-mark">◉</span>Cogniva</Link>
        <nav className="hidden md:flex gap-2">
          <span className="view-button view-button-active">Educator View</span>
        </nav>
        <div className="ml-auto flex items-center gap-3"><button aria-label="Notifications" className="icon-button"><span className="material-symbols-outlined">notifications</span></button><div className="hidden sm:block text-right"><p className="text-sm font-bold text-on-surface">{user?.name}</p><p className="text-label-sm text-outline">Lead Instructor</p></div><div className="avatar"><span className="material-symbols-outlined">school</span></div></div>
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
    </section>
  </div>;
}
