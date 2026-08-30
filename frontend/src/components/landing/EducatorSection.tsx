import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease } }),
};

const confusionTopics = [
  { label: 'Algorithm Complexity', pct: 78, color: '#e84040' },
  { label: 'Recursion', pct: 55, color: '#e8a634' },
  { label: 'Hash Tables', pct: 30, color: '#34c759' },
];

export default function EducatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="educators" className="land-section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#050508] to-[#000000]" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(153,153,153,0.12) 0%, transparent 50%)',
      }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line-strong)] to-transparent" />

      <div ref={ref} className="land-container relative z-10">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left: Dashboard Preview */}
          <motion.div 
            variants={fadeUp} 
            custom={2} 
            initial="hidden" 
            animate={isInView ? 'visible' : 'hidden'}
            className="order-2 md:order-1 relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-[rgba(153,153,153,0.1)] to-transparent rounded-3xl blur-3xl opacity-40" />
            
            <div className="relative rounded-2xl overflow-hidden border border-[var(--line-strong)] shadow-2xl" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: '#999' }}>analytics</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)' }}>Educator Dashboard</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full animate-pulse-dot" style={{ background: 'rgba(232,64,64,0.1)', border: '1px solid rgba(232,64,64,0.2)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e84040]" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#e84040', letterSpacing: '0.1em' }}>LIVE</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Top Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center py-4 px-2 rounded-xl border border-[var(--line)]" style={{ background: 'var(--fill-ghost)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>72%</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginTop: 6 }}>Class Clarity</div>
                  </div>
                  <div className="text-center py-4 px-2 rounded-xl border border-[var(--line)]" style={{ background: 'var(--fill-ghost)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#e84040', lineHeight: 1 }}>18</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginTop: 6 }}>Signals Today</div>
                  </div>
                  <div className="text-center py-4 px-2 rounded-xl border border-[var(--line)]" style={{ background: 'rgba(232,64,64,0.08)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#e84040', lineHeight: 1.2 }}>Algorithm<br/>Complexity</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)', marginTop: 6 }}>Top Issue</div>
                  </div>
                </div>

                {/* Confusion Heatmap */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)' }}>Confusion By Topic</span>
                    <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--text-dimmer)' }}>local_fire_department</span>
                  </div>
                  <div className="space-y-3.5">
                    {confusionTopics.map((t, idx) => (
                      <div key={t.label}>
                        <div className="flex justify-between mb-1.5">
                          <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{t.label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: t.color, fontWeight: 600 }}>{t.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--fill-solid)' }}>
                          <motion.div 
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${t.color} 0%, ${t.color}dd 100%)`, boxShadow: `0 0 8px ${t.color}44` }}
                            initial={{ width: 0 }}
                            animate={{ width: isInView ? `${t.pct}%` : 0 }}
                            transition={{ duration: 0.9, delay: 0.8 + idx * 0.15, ease: ease as unknown as [number, number, number, number] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(232,166,52,0.06)', border: '1px solid rgba(232,166,52,0.15)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(232,166,52,0.15)' }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--accent)' }}>auto_awesome</span>
                  </div>
                  <div className="flex-1">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>AI Recommendation</div>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-dim)', margin: 0 }}>
                      Revisit Big-O notation with a visual comparison before introducing amortized analysis.
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)] transition-all" style={{ background: 'var(--fill-ghost)' }}>
                    <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--text-dim)' }}>person</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Students</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)] transition-all" style={{ background: 'var(--fill-ghost)' }}>
                    <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--text-dim)' }}>download</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Text Content */}
          <div className="order-1 md:order-2 space-y-8">
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ border: '1px solid rgba(153,153,153,0.2)', background: 'rgba(153,153,153,0.06)' }}>
                <span className="material-symbols-outlined text-[14px]" style={{ color: '#999' }}>history_edu</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#999', fontWeight: 500 }}>For Educators</span>
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
                See every student's <span className="text-gradient-gold">journey</span>
              </motion.h2>
              
              <motion.p 
                variants={fadeUp} 
                custom={2} 
                initial="hidden" 
                animate={isInView ? 'visible' : 'hidden'}
                style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-dim)', maxWidth: '540px' }}
              >
                Real-time confusion heatmaps, AI-powered recommendations, and class analytics that help you teach more effectively and reach every learner.
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
                ['local_fire_department', 'Live confusion heatmaps', 'See which concepts are causing issues in real-time'],
                ['auto_awesome', 'AI lesson adjustments', 'Get instant recommendations to adapt your teaching'],
                ['monitoring', 'Track class progress', 'Monitor understanding trends across all students'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-[var(--fill-ghost)] group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(153,153,153,0.1)', border: '1px solid rgba(153,153,153,0.2)' }}>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" style={{ color: '#999' }}>{icon}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-dimmer)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
