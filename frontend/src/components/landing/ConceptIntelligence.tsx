import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease } }),
};

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  mastery: number;
  confusion: number;
  prerequisites: string[];
  action: string;
  status: 'high' | 'medium' | 'low';
}

const nodes: Node[] = [
  { id: 'log', label: 'Logarithms', x: 120, y: 60, mastery: 45, confusion: 62, prerequisites: ['Exponents'], action: 'Review exponential rules', status: 'high' },
  { id: 'bigo', label: 'Big-O', x: 320, y: 60, mastery: 38, confusion: 84, prerequisites: ['Logarithms'], action: 'Start with visual comparisons', status: 'high' },
  { id: 'bsearch', label: 'Binary Search', x: 520, y: 60, mastery: 52, confusion: 46, prerequisites: ['Big-O', 'Sorting'], action: 'Practice divide & conquer', status: 'medium' },
  { id: 'sort', label: 'Sorting', x: 520, y: 180, mastery: 78, confusion: 18, prerequisites: ['Arrays'], action: 'Well understood', status: 'low' },
  { id: 'arrays', label: 'Arrays', x: 320, y: 180, mastery: 92, confusion: 8, prerequisites: [], action: 'Mastered', status: 'low' },
  { id: 'exp', label: 'Exponents', x: 120, y: 180, mastery: 85, confusion: 12, prerequisites: [], action: 'Mastered', status: 'low' },
];

const edges: [string, string][] = [
  ['exp', 'log'],
  ['log', 'bigo'],
  ['bigo', 'bsearch'],
  ['arrays', 'sort'],
  ['sort', 'bsearch'],
];

function getColor(status: string) {
  if (status === 'high') return '#e84040';
  if (status === 'medium') return '#e8a634';
  return '#34c759';
}

export default function ConceptIntelligence() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [hovered, setHovered] = useState<string | null>(null);

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <section className="land-section relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#050508] to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="land-container relative z-10">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <span className="section-badge mb-5 inline-flex">
            <span className="material-symbols-outlined text-[13px]">hub</span>
            Concept Intelligence
          </span>
          <h2 className="section-title mt-4">
            See how concepts <span className="text-gradient-gold">connect</span>
          </h2>
          <p className="section-subtitle mt-4 max-w-xl mx-auto">
            Cogniva maps prerequisite dependencies so confusion can be traced to its root cause.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="max-w-2xl mx-auto"
        >
          <div className="product-preview" style={{ padding: 0, overflow: 'visible' }}>
            <div className="product-preview-header">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)' }}>Knowledge Graph · CS101</span>
              <div className="flex items-center gap-3">
                {[{ c: '#e84040', l: 'High confusion' }, { c: '#e8a634', l: 'Medium' }, { c: '#34c759', l: 'Low' }].map(x => (
                  <div key={x.l} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: x.c }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dimmer)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative" style={{ padding: '24px 16px' }}>
              <svg viewBox="0 0 640 240" className="w-full" style={{ maxHeight: 280 }}>
                {/* Edges */}
                {edges.map(([from, to]) => {
                  const a = nodeMap[from];
                  const b = nodeMap[to];
                  if (!a || !b) return null;
                  return (
                    <motion.line key={`${from}-${to}`}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="var(--line-strong)" strokeWidth={1.5} strokeDasharray="4 4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: isInView ? 1 : 0, opacity: isInView ? 0.5 : 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  );
                })}
                {/* Nodes */}
                {nodes.map((n, i) => {
                  const color = getColor(n.status);
                  const isHov = hovered === n.id;
                  return (
                    <g key={n.id}
                      onMouseEnter={() => setHovered(n.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse for high confusion */}
                      {n.status === 'high' && (
                        <motion.circle cx={n.x} cy={n.y} r={24} fill="none" stroke={color} strokeWidth={1}
                          animate={{ r: [24, 32, 24], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        />
                      )}
                      <motion.circle cx={n.x} cy={n.y} r={isHov ? 22 : 18} fill={`${color}15`} stroke={color} strokeWidth={1.5}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: isInView ? 1 : 0, opacity: isInView ? 1 : 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: ease as unknown as [number, number, number, number] }}
                        style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                      />
                      <text x={n.x} y={n.y + 34} textAnchor="middle"
                        style={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--text-dim)' }}
                      >
                        {n.label}
                      </text>
                      <text x={n.x} y={n.y + 4} textAnchor="middle"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, fill: color }}
                      >
                        {n.confusion}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {hovered && (() => {
                const n = nodeMap[hovered];
                if (!n) return null;
                const color = getColor(n.status);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-20 p-3"
                    style={{
                      left: `${(n.x / 640) * 100}%`, top: `${(n.y / 240) * 100 - 6}%`,
                      transform: 'translate(-50%, -100%)',
                      background: 'rgba(10,12,15,0.95)', border: `1px solid ${color}33`,
                      backdropFilter: 'blur(12px)', minWidth: 180,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div><span style={{ color: 'var(--text-dimmer)' }}>Mastery: </span><span style={{ color: '#34c759' }}>{n.mastery}%</span></div>
                      <div><span style={{ color: 'var(--text-dimmer)' }}>Confusion: </span><span style={{ color }}>{n.confusion}%</span></div>
                    </div>
                    {n.prerequisites.length > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-dimmer)', marginBottom: 4 }}>
                        Prereqs: <span style={{ color: 'var(--text-dim)' }}>{n.prerequisites.join(', ')}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--accent)' }}>→ {n.action}</div>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
