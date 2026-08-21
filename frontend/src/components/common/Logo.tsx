export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="rgba(232, 64, 64, 0.4)" strokeWidth="1.2" />
      <ellipse cx="20" cy="20" rx="14" ry="4" transform="rotate(-15 20 20)" stroke="#e84040" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="7" fill="#e84040" />
    </svg>
  );
}
