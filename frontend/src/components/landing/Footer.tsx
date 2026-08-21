export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/10 py-stack-lg">
      <div className="max-w-7xl mx-auto px-container-margin flex flex-col md:flex-row justify-between items-center gap-stack-md text-on-surface-variant font-label-sm text-label-sm">
        <span>© 2024 Cogniva. Built for Real-time Pedagogy.</span>
        <div className="flex gap-stack-md">
          <a className="hover:text-primary" href="#">Privacy</a>
          <a className="hover:text-primary" href="#">Terms</a>
          <a className="hover:text-primary" href="#">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
