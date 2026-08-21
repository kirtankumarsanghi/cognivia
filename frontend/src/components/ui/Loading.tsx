import { motion } from 'framer-motion';

type Variant = 'dashboard' | 'courses' | 'course' | 'revision';

const Shimmer = ({ className }: { className: string }) => (
  <motion.div className={`rounded-xl ${className}`} style={{ backgroundImage: 'linear-gradient(90deg, #122131 25%, #273647 50%, #122131 75%)', backgroundSize: '200% 100%' }} animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }} transition={{ duration: 1.25, repeat: Infinity, ease: 'linear' }} />
);

export default function Loading({ variant = 'dashboard' }: { variant?: Variant }) {
  if (variant === 'dashboard') return <div className="page-shell"><Shimmer className="h-10 w-64" /><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><Shimmer className="h-72" /><Shimmer className="h-72 lg:col-span-2" /></div><Shimmer className="h-52" /></div>;
  const rows = variant === 'course' ? 3 : variant === 'revision' ? 5 : 4;
  return <div className="page-shell"><Shimmer className="h-8 w-40" /><Shimmer className="h-12 w-72" /><div className="space-y-4">{Array.from({ length: rows }, (_, index) => <Shimmer key={index} className="h-24 w-full" />)}</div></div>;
}
