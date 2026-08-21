import { User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="fixed top-stack-md left-0 right-0 z-50 px-container-margin md:px-stack-lg">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center">
            <User className="text-on-tertiary w-[18px] h-[18px]" />
          </div>
          <span className="font-headline-md text-headline-md tracking-tighter text-on-surface">Cogniva</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 rounded-full px-stack-md py-unit gap-stack-md shadow-2xl">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Product</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Methodology</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">For Students</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">For Educators</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Pricing</a>
        </div>
        <div className="flex items-center bg-surface-container/60 backdrop-blur-xl border border-outline-variant/30 rounded-full p-1 gap-unit">
          <a className="font-label-sm text-label-sm px-stack-md py-unit text-on-surface hover:text-primary transition-colors" href="/login">Login</a>
          <a className="font-label-sm text-label-sm px-stack-md py-unit bg-primary text-on-primary rounded-full hover:bg-primary-fixed-dim transition-all" href="/signup">Get Started</a>
        </div>
      </nav>
    </header>
  );
}
