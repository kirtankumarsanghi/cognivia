import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative py-16 border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">psychology</span>
              </div>
              <span className="font-headline-md text-xl font-bold text-on-surface">Cogniva</span>
            </div>
            <p className="text-sm text-[#6a7a8d] max-w-xs leading-relaxed">
              Turn confusion into clarity. Real-time learning analytics for modern classrooms.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#6a7a8d] mb-4 font-label-sm">Product</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#product" className="text-sm text-[#8a9ab0] hover:text-primary transition-colors">Features</a>
              <a href="#methodology" className="text-sm text-[#8a9ab0] hover:text-primary transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-[#8a9ab0] hover:text-primary transition-colors">Pricing</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#6a7a8d] mb-4 font-label-sm">Company</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-[#8a9ab0] hover:text-primary transition-colors">About</a>
              <a href="#" className="text-sm text-[#8a9ab0] hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-sm text-[#8a9ab0] hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-[#4a5a6d]">© 2024 Cogniva. Built for Real-time Pedagogy.</span>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-[#6a7a8d] hover:text-primary transition-colors font-label-sm">Get Started →</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
