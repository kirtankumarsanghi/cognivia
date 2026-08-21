import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: 'local_fire_department',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    title: 'Confusion Heatmaps',
    description: 'See exactly which concepts are causing the most confusion across your class, in real-time.',
  },
  {
    icon: 'auto_awesome',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    title: 'AI Recommendations',
    description: 'Get actionable suggestions on what to review and how to adjust your teaching approach.',
  },
  {
    icon: 'monitoring',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
    title: 'Class Analytics',
    description: 'Track class-wide progress and identify students who need extra support before they fall behind.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function EducatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="educators" className="py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface-container-low/30 to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Visual mockup — left side */}
          <motion.div 
            variants={fadeUp} custom={2} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
            className="relative order-2 md:order-1"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container-low" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-xs space-y-4">
                  {/* Mini dashboard mockup */}
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                    <div>
                      <div className="text-xs text-[#6a7a8d]">Live Confusion</div>
                      <div className="text-sm text-on-surface font-medium">CS101 — 42 students</div>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      High
                    </div>
                  </div>
                  {/* Mini bar chart */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-[#6a7a8d] mb-3">Confusion by Topic</div>
                    <div className="space-y-2">
                      {[
                        { label: 'Big-O Notation', pct: 78, color: 'bg-red-400' },
                        { label: 'Recursion', pct: 55, color: 'bg-amber-400' },
                        { label: 'Hash Tables', pct: 30, color: 'bg-green-400' },
                      ].map(bar => (
                        <div key={bar.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface/80">{bar.label}</span>
                            <span className="text-[#6a7a8d]">{bar.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">lightbulb</span>
                    <div className="text-xs text-[#9aabbf] leading-relaxed">
                      <span className="text-primary font-semibold">AI Insight:</span> Consider revisiting Big-O notation with visual examples. 78% of class is confused.
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border border-outline-variant/15 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>

          {/* Text content — right side */}
          <div className="order-1 md:order-2">
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <span className="section-badge text-secondary border-secondary/20 mb-6 inline-flex" style={{ background: 'rgba(191,199,216,0.08)' }}>
                <span className="material-symbols-outlined text-[14px]">history_edu</span>
                For Educators
              </span>
            </motion.div>
            <motion.h2 
              variants={fadeUp} custom={1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="section-title mt-5"
            >
              See Every Student's{' '}
              <span className="text-gradient-gold">Journey</span>
            </motion.h2>
            <motion.p 
              variants={fadeUp} custom={2} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="section-subtitle mt-5 mb-10"
            >
              Data-driven insights to improve your teaching and reach every learner
            </motion.p>
            
            <div className="space-y-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp} custom={i + 3} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
                  className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined ${feature.iconColor}`}>{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-on-surface font-headline-md">{feature.title}</h3>
                    <p className="text-[#8a9ab0] text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
