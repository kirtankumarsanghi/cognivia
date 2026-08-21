import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const studentLinks = [
  ['/dashboard', 'dashboard', 'Student Home'],
  ['/courses', 'menu_book', 'My Courses'],
  ['/tutor', 'psychology', 'AI Tutor'],
  ['/revision', 'event_repeat', 'Revision Plan'],
] as const;

export default function StudentLayout() {
  const { user, logout, switchRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const itemClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'nav-item-active' : ''}`;
  const close = () => setMenuOpen(false);

  return <div className="app-frame">
    {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={close} />}
    <aside className={`app-sidebar ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <Link to="/dashboard" onClick={close} className="brand"><span className="brand-mark">◉</span><span>Cogniva</span></Link>
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="nav-label">Main dashboard</p>
        {studentLinks.map(([to, icon, label]) => <NavLink end={to === '/dashboard'} key={to} to={to} onClick={close} className={itemClass}><span className="material-symbols-outlined">{icon}</span>{label}</NavLink>)}
        <p className="nav-label mt-7">Educator tools</p>
        <button className="nav-item w-full text-left" onClick={() => { switchRole('educator'); navigate('/educator'); close(); }}><span className="material-symbols-outlined">analytics</span>Educator Insights</button>
      </nav>
      <div className="p-4 border-t border-outline-variant/10 space-y-2">
        <Link to="/tutor" onClick={close} className="confused-button"><span className="material-symbols-outlined text-[18px]">emergency</span>I’m Confused</Link>
        <button onClick={logout} className="nav-item w-full"><span className="material-symbols-outlined">logout</span>Sign out</button>
      </div>
    </aside>
    <section className="app-content">
      <header className="app-topbar">
        <button aria-label="Open navigation" className="icon-button md:hidden" onClick={() => setMenuOpen(true)}><span className="material-symbols-outlined">menu</span></button>
        <Link to="/dashboard" className="md:hidden brand text-lg"><span className="brand-mark">◉</span>Cogniva</Link>
        <nav className="hidden md:flex gap-2"><button className="view-button view-button-active">Student View</button><button onClick={() => { switchRole('educator'); navigate('/educator'); }} className="view-button">Educator View</button></nav>
        <div className="ml-auto flex items-center gap-3"><button aria-label="Notifications" className="icon-button"><span className="material-symbols-outlined">notifications</span></button><div className="hidden sm:block text-right"><p className="text-sm font-bold text-on-surface">{user?.name}</p><p className="text-label-sm text-outline">Pro Scholar</p></div><div className="avatar"><span className="material-symbols-outlined">person</span></div></div>
      </header>
      <main className="app-main"><Outlet /></main>
      <nav className="mobile-nav md:hidden">{studentLinks.map(([to, icon, label]) => <NavLink end={to === '/dashboard'} key={to} to={to} className={({ isActive }: { isActive: boolean }) => `mobile-nav-item ${isActive ? 'text-primary' : ''}`}><span className="material-symbols-outlined">{icon}</span><span>{label.split(' ')[0]}</span></NavLink>)}</nav>
    </section>
  </div>;
}
