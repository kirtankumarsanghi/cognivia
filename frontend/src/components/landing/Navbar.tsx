import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from '../common/Logo';

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#methodology' },
  { label: 'Students', href: '#students' },
  { label: 'Educators', href: '#educators' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 180], [0, 0.92]);
  const borderOpacity = useTransform(scrollY, [0, 180], [0, 0.1]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = () => { if (mq.matches) setMenuOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[60]"
        style={{
          backgroundColor: useTransform(bgOpacity, v => `rgba(0,0,0,${v})`),
          backdropFilter: useTransform(scrollY, [0, 180], ['blur(0px)', 'blur(16px)']),
          borderBottom: useTransform(borderOpacity, v => `1px solid rgba(255,255,255,${v})`),
        }}
      >
        <nav className="flex items-center justify-between h-[64px] px-5 lg:px-10 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline shrink-0"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.04em', color: 'var(--text)' }}
          >
            <Logo className="w-8 h-8" />
            COGNIVA
          </Link>

          {/* Desktop center nav */}
          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map(link => (
              <a key={link.href} href={link.href}
                className="transition-colors duration-200 hover:text-white"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dimmer)', textDecoration: 'none' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/login" className="transition-colors duration-200 hover:text-white"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              LOG IN
            </Link>
            <Link to="/login" className="btn-primary" style={{ padding: '10px 24px', letterSpacing: '0.1em' }}>
              GET STARTED
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden relative w-10 h-10" onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ position: 'absolute', left: '50%', width: 20, height: 1, background: '#fff',
              transition: 'all 0.4s var(--ease-premium)',
              transform: menuOpen ? 'translateX(-50%) rotate(45deg)' : 'translateX(-50%) translateY(-4px)',
              top: menuOpen ? 20 : 17 }} />
            <span style={{ position: 'absolute', left: '50%', width: 20, height: 1, background: '#fff',
              top: 20, transform: 'translateX(-50%)',
              transition: 'opacity 0.2s ease', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ position: 'absolute', left: '50%', width: 20, height: 1, background: '#fff',
              transition: 'all 0.4s var(--ease-premium)',
              transform: menuOpen ? 'translateX(-50%) rotate(-45deg)' : 'translateX(-50%) translateY(4px)',
              top: menuOpen ? 20 : 23 }} />
          </button>
        </nav>
      </motion.header>

      {/* Mobile overlay */}
      <div role="dialog" aria-modal={menuOpen} aria-hidden={!menuOpen}
        style={{
          position: 'fixed', inset: 0, zIndex: 55,
          background: 'rgba(0,0,0,0.96)',
          backdropFilter: 'blur(20px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.4s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
        }}
        onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}
      >
        {navLinks.map((link, i) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 20, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text)', textDecoration: 'none',
              opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.3s ease ${150 + i * 60}ms, transform 0.4s var(--ease-premium) ${150 + i * 60}ms`,
            }}
          >
            {link.label}
          </a>
        ))}
        <Link to="/login" onClick={() => setMenuOpen(false)}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#000', background: 'var(--accent)', textDecoration: 'none', padding: '14px 36px',
            opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 0.3s ease ${150 + 4 * 60}ms, transform 0.4s var(--ease-premium) ${150 + 4 * 60}ms`,
          }}
        >
          GET STARTED
        </Link>
      </div>
    </>
  );
}
