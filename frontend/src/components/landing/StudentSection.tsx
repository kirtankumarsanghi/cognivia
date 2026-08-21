import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease } }),
};

/* Animated ring */
function ScoreRing({ value, inView }: { value: number; inView: boolean }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-[160px] h-[160px] mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--fill-solid)" strokeWidth="8" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke="url(#gradient-accent)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: inView ? circ - (circ * value / 100) : circ }}
          transition={{ duration: 1.6, delay: 0.5, ease: ease as unknown as [number, number, number, number] }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(232,166,52,0.4))' }}
        />
        <defs>
          <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8a634" />
            <stop offset="100%" stopColor="#f0c060" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.5 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          {value}
        </motion.span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dimmer)', letterSpacing: '0.1em', marginTop: 2 }}>SCORE</span>
      </div>
    </div>
  );
}

const clarityPlan = [
  { name: 'Logarithms', time: '6 min', icon: 'functions', priority: 'high' },
  { name: 'Big-O Complexity', time: '8 min', icon: 'speed', priority: 'high' },
  { name: 'Binary Search', time: '12 min', icon: 'search', priority: 'medium' },
];

export default function StudentSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="students" className="land-section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#050508] to-[#000000]" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(232,166,52,0.15) 0%, transparent 50%)',
      }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line-strong)] to-transparent" />

      <div ref={ref} className="land-container relative z-10">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left: Text Content */}
          <div className="space-y-8">
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(232,166,52,0.2)] bg-[rgba(232,166,52,0.06)]">
                <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--accent)' }}>school</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500 }}>For Students</span>
              </div>
            </motion.div>

            <div className="space-y-5">
              <motion.h2 
                variants={fadeUp} 
                custom={1} 
                initial="hidden" 
                animate={isInView ? 'visible' : 'hidden'} 
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}
              >
                Never fall <span className="text-gradient-gold">behind</span> again
              </motion.h2>
              
              <motion.p 
                variants={fadeUp} 
                custom={2} 
                initial="hidden" 
                animate={isInView ? 'visible' : 'hidden'}
                style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-dim)', maxWidth: '540px' }}
              >
                Your personal learning dashboard tracks exactly where you stand, what needs attention, and what to study next—all powered by real-time confusion signals.
              </motion.p>
            </div>

            <motion.div 
              variants={fadeUp} 
              custom={3} 
              initial="hidden" 
              animate={isInView ? 'visible' : 'hidden'} 
              className="space-y-4 pt-2"
            >
              {[
                ['lock', 'Signal confusion privately', 'Zero judgment, just honest feedback'],
                ['psychology', 'Get instant AI explanations', 'Tailored to your exact learning style'],
                ['insights', 'Track mastery over time', 'See your progress with evolving scores'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-[var(--fill-ghost)] group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(232,166,52,0.1)', border: '1px solid rgba(232,166,52,0.2)' }}>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" style={{ color: 'var(--accent)' }}>{icon}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-dimmer)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard Preview */}
          <motion.div 
            variants={fadeUp} 
            custom={2} 
            initial="hidden" 
            animate={isInView ? 'visible' : 'hidden'}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-[rgba(232,166,52,0.15)] to-transparent rounded-3xl blur-3xl opacity-50" />
            
            <div className="relative rounded-2xl overflow-hidden border border-[var(--line-strong)] shadow-2xl" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#34c759]" />
                  <div className="w-2 h-2 rounded-full bg-[#e8a634]" />
                  <div className="w-2 h-2 rounded-full bg-[#e84040]" />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)' }}>Student Dashboard</span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(232,166,52,0.1)', border: '1px solid rgba(232,166,52,0.2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>Ada</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Score Ring */}
                <div className="text-center py-6">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginBottom: 20 }}>Your Clarity Score</div>
                  <ScoreRing value={76} inView={isInView} />
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 16, maxWidth: '220px', margin: '16px auto 0' }}>
                    Strong progress! Keep building on your mastered concepts.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center py-4 px-3 rounded-xl border border-[var(--line)]" style={{ background: 'var(--fill-ghost)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: '#e84040', lineHeight: 1 }}>3</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginTop: 8 }}>Need Focus</div>
                  </div>
                  <div className="text-center py-4 px-3 rounded-xl border border-[var(--line)]" style={{ background: 'var(--fill-ghost)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: '#34c759', lineHeight: 1 }}>12</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginTop: 8 }}>Mastered</div>
                  </div>
                </div>

                {/* Today's Plan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)' }}>Today's Clarity Plan</span>
                    <span className="px-2 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, background: 'rgba(232,166,52,0.15)', color: 'var(--accent)' }}>3 TOPICS</span>
                  </div>
                  <div className="space-y-2">
                    {clarityPlan.map((item, idx) => (
                      <motion.div 
                        key={item.name} 
                        className="flex items-center gap-3 py-3 px-4 rounded-lg group cursor-pointer transition-all hover:border-[var(--line-strong)]" 
                        style={{ background: 'var(--fill-ghost)', border: '1px solid var(--line)' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
                        transition={{ delay: 1.2 + idx * 0.1 }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.priority === 'high' ? 'rgba(232,64,64,0.15)' : 'rgba(232,166,52,0.15)' }}>
                          <span className="material-symbols-outlined text-[16px]" style={{ color: item.priority === 'high' ? '#e84040' : 'var(--accent)' }}>{item.icon}</span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text)', flex: 1, fontWeight: 500 }}>{item.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dimmer)' }}>{item.time}</span>
                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }}>arrow_forward</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
