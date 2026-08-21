import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 md:px-8 pt-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-14 relative">
          {/* Logo */}
          <div className="flex items-center bg-surface-container/80 backdrop-blur-2xl border border-white/[0.06] rounded-full p-2 pr-5 shadow-lg shadow-black/20">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#ffba20] flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">psychology</span>
              </div>
              <span className="font-headline-md text-[15px] font-bold tracking-tight text-on-surface">Cogniva</span>
            </Link>
          </div>

          {/* Center nav */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center bg-surface-container/80 backdrop-blur-2xl border border-white/[0.06] rounded-full px-1.5 py-1.5 gap-0.5 shadow-lg shadow-black/20">
            {[
              { label: 'Product', href: '#product' },
              { label: 'Methodology', href: '#methodology' },
              { label: 'For Students', href: '#students' },
              { label: 'For Educators', href: '#educators' },
              { label: 'Pricing', href: '#pricing' },
            ].map(link => (
              <a 
                key={link.href}
                className="px-4 py-2 rounded-full text-[13px] text-[#8a9ab0] hover:text-white hover:bg-white/[0.04] transition-all duration-200 font-medium" 
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right CTA */}
          <div className="flex items-center bg-surface-container/80 backdrop-blur-2xl border border-white/[0.06] rounded-full p-1.5 gap-1 shadow-lg shadow-black/20">
            <Link to="/login" className="px-4 py-2 rounded-full text-[13px] text-[#8a9ab0] hover:text-white transition-colors font-medium">
              Login
            </Link>
            <Link to="/login" className="px-5 py-2 rounded-full bg-primary text-on-primary text-[13px] font-semibold hover:shadow-[0_0_20px_rgba(255,186,32,0.25)] transition-all duration-300 flex items-center gap-1.5">
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
