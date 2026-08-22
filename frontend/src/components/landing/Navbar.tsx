import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Logo } from '../common/Logo';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#methodology' },
  { label: 'Students', href: '#students' },
  { label: 'Educators', href: '#educators' },
];

const features = [
  { icon: 'psychology', label: 'AI Tutoring', description: 'Personalized learning' },
  { icon: 'analytics', label: 'Analytics', description: 'Real-time insights' },
  { icon: 'groups', label: 'Collaboration', description: 'Team learning' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 180], [0, 0.92]);
  const borderOpacity = useTransform(scrollY, [0, 180], [0, 0.1]);
  const logoScale = useTransform(scrollY, [0, 180], [1, 0.85]);

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
        className="fixed top-0 left-0 right-0 z-[60] shadow-lg"
        style={{
          backgroundColor: useTransform(bgOpacity, v => `rgba(0,0,0,${v})`),
          backdropFilter: useTransform(scrollY, [0, 180], ['blur(0px)', 'blur(20px)']),
          borderBottom: useTransform(borderOpacity, v => `1px solid rgba(232,64,64,${v})`),
        }}
      >
        <nav className="flex items-center justify-between h-[72px] px-5 lg:px-12 max-w-[1600px] mx-auto">
          {/* Logo with animation */}
          <motion.div style={{ scale: logoScale }}>
            <Link to="/" className="flex items-center gap-3 no-underline shrink-0 group"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '0.04em', color: 'var(--text)' }}
            >
              <Logo className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent">
                COGNIVA
              </span>
            </Link>
          </motion.div>

          {/* Desktop center nav with dropdown */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.label === 'Product' && setActiveDropdown('product')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                  className="flex items-center gap-1 transition-all duration-300 hover:text-white group relative py-2"
                  style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: 11, 
                    fontWeight: 500, 
                    letterSpacing: '0.14em', 
                    textTransform: 'uppercase', 
                    color: 'var(--text-dimmer)', 
                    textDecoration: 'none' 
                  }}
                >
                  {link.label}
                  {link.label === 'Product' && (
                    <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                  )}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-red-300 group-hover:w-full transition-all duration-300" />
                </a>

                {/* Product Dropdown */}
                {link.label === 'Product' && (
                  <AnimatePresence>
                    {activeDropdown === 'product' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/20 overflow-hidden"
                      >
                        <div className="p-4 space-y-2">
                          {features.map((feature, i) => (
                            <motion.a
                              key={feature.label}
                              href={link.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors group/item"
                            >
                              <span className="material-symbols-outlined text-red-400 text-[24px] group-hover/item:scale-110 transition-transform">
                                {feature.icon}
                              </span>
                              <div>
                                <div className="text-white font-medium text-sm">{feature.label}</div>
                                <div className="text-gray-400 text-xs">{feature.description}</div>
                              </div>
                            </motion.a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Desktop right with enhanced features */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </motion.button>

            <div className="w-px h-6 bg-white/10" />

            <Link 
              to="/demo" 
              className="transition-all duration-200 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5"
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: 11, 
                fontWeight: 500, 
                letterSpacing: '0.14em', 
                textTransform: 'uppercase', 
                color: '#34c759', 
                textDecoration: 'none' 
              }}
            >
              🧠 DEMO
            </Link>
            
            <Link 
              to="/login" 
              className="transition-all duration-200 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5"
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: 11, 
                fontWeight: 500, 
                letterSpacing: '0.14em', 
                textTransform: 'uppercase', 
                color: 'var(--text-dim)', 
                textDecoration: 'none' 
              }}
            >
              LOG IN
            </Link>
            <Link 
              to="/login" 
              className="btn-primary relative overflow-hidden group" 
              style={{ padding: '12px 28px', letterSpacing: '0.1em' }}
            >
              <span className="relative z-10">GET STARTED</span>
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Mobile hamburger with enhanced animation */}
          <button 
            className="lg:hidden relative w-10 h-10 flex items-center justify-center" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen} 
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <motion.span 
              animate={{ 
                rotate: menuOpen ? 45 : 0,
                y: menuOpen ? 0 : -6
              }}
              className="absolute w-6 h-0.5 bg-white"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span 
              animate={{ 
                opacity: menuOpen ? 0 : 1,
                x: menuOpen ? -20 : 0
              }}
              className="absolute w-6 h-0.5 bg-white"
              transition={{ duration: 0.2 }}
            />
            <motion.span 
              animate={{ 
                rotate: menuOpen ? -45 : 0,
                y: menuOpen ? 0 : 6
              }}
              className="absolute w-6 h-0.5 bg-white"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </button>
        </nav>

        {/* Enhanced Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 overflow-hidden"
            >
              <div className="max-w-[1600px] mx-auto px-5 lg:px-12 py-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search features, docs, or resources..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile overlay with enhanced animations */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            role="dialog" 
            aria-modal={menuOpen} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', 
              inset: 0, 
              zIndex: 55,
              background: 'rgba(0,0,0,0.98)',
              backdropFilter: 'blur(20px)',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 16,
              padding: 32,
            }}
            onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-red-500/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {navLinks.map((link, i) => (
              <motion.a 
                key={link.href} 
                href={link.href} 
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  delay: i * 0.08, 
                  duration: 0.5, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                whileHover={{ scale: 1.05, x: 10 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
                style={{
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 24, 
                  letterSpacing: '0.12em', 
                  textTransform: 'uppercase',
                  color: 'var(--text)', 
                  textDecoration: 'none',
                }}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4 mt-8 w-full max-w-xs"
            >
              <Link 
                to="/demo" 
                onClick={() => setMenuOpen(false)}
                className="text-center py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300 transition-all"
                style={{
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 14, 
                  letterSpacing: '0.18em', 
                  textTransform: 'uppercase',
                  color: '#000', 
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                🧠 TRY DEMO
              </Link>
              <Link 
                to="/login" 
                onClick={() => setMenuOpen(false)}
                className="text-center py-3 rounded-xl border border-white/20 hover:border-red-500/50 transition-colors"
                style={{
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 14, 
                  letterSpacing: '0.12em', 
                  textTransform: 'uppercase',
                  color: 'var(--text)', 
                  textDecoration: 'none',
                }}
              >
                LOG IN
              </Link>
              <Link 
                to="/login" 
                onClick={() => setMenuOpen(false)}
                className="text-center py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-400 hover:from-red-500 hover:to-red-300 transition-all"
                style={{
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 14, 
                  letterSpacing: '0.18em', 
                  textTransform: 'uppercase',
                  color: '#000', 
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                GET STARTED
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
