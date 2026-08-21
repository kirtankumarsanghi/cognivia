import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function EducatorLayout() {
  const { user, logout, switchRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setMenuOpen(false);
  return <div className="app-frame">
    {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={close} />}
    <aside className={`app-sidebar ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <Link to="/educator" onClick={close} className="brand"><span className="brand-mark">◉</span><span>Cogniva</span></Link>
      <nav className="flex-1 px-3 py-5"><p className="nav-label">Educator portal</p><NavLink to="/educator" end onClick={close} className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><span className="material-symbols-outlined">analytics</span>Class Analytics</NavLink><p className="nav-label mt-7">Student tools</p><button className="nav-item w-full text-left" onClick={() => { switchRole('student'); navigate('/dashboard'); close(); }}><span className="material-symbols-outlined">dashboard</span>Student View</button></nav>
      <div className="p-4 border-t border-outline-variant/10"><button onClick={logout} className="nav-item w-full"><span className="material-symbols-outlined">logout</span>Sign out</button></div>
    </aside>
    <section className="app-content"><header className="app-topbar"><button aria-label="Open navigation" className="icon-button md:hidden" onClick={() => setMenuOpen(true)}><span className="material-symbols-outlined">menu</span></button><Link to="/educator" className="md:hidden brand text-lg"><span className="brand-mark">◉</span>Cogniva</Link><nav className="hidden md:flex gap-2"><button onClick={() => { switchRole('student'); navigate('/dashboard'); }} className="view-button">Student View</button><button className="view-button view-button-active">Educator View</button></nav><div className="ml-auto flex items-center gap-3"><button aria-label="Notifications" className="icon-button"><span className="material-symbols-outlined">notifications</span></button><div className="hidden sm:block text-right"><p className="text-sm font-bold text-on-surface">{user?.name}</p><p className="text-label-sm text-outline">Lead Instructor</p></div><div className="avatar"><span className="material-symbols-outlined">school</span></div></div></header><main className="app-main"><Outlet /></main></section>
  </div>;
}
