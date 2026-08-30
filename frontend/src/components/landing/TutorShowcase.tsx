import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease } }),
};

const responseSections = [
  { icon: 'lightbulb', title: 'Simple Explanation', text: 'Each comparison eliminates half the remaining elements, so after k comparisons you have n/2^k elements left. When n/2^k = 1, solving gives k = log₂(n).' },
  { icon: 'code', title: 'Example', text: 'Searching 1,000 names in a phone book: you\'d need at most 10 checks (log₂ 1000 ≈ 10), not 1,000.' },
  { icon: 'warning', title: 'Common Mistake', text: 'Forgetting the array must be sorted first. Binary search on an unsorted array gives incorrect results.' },
  { icon: 'quiz', title: 'Quick Check', text: 'If you have 1 million items, what\'s the maximum number of comparisons binary search needs?' },
];

export default function TutorShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="land-section relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#050508] to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="land-container relative z-10">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <span className="section-badge mb-5 inline-flex">
            <span className="material-symbols-outlined text-[13px]">psychology</span>
            AI Tutor
          </span>
          <h2 className="section-title mt-4">
            Instant clarity, <span className="text-gradient-gold">explained your way</span>
          </h2>
          <p className="section-subtitle mt-4 max-w-xl mx-auto">
            When confusion strikes, Cogniva's AI tutor breaks down concepts with explanations, examples, and quick checks.
          </p>
        </motion.div>

        {/* Conversation mock */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="max-w-2xl mx-auto"
        >
          <div className="product-preview">
            <div className="product-preview-header">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--accent)' }}>psychology</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dimmer)' }}>Cogniva AI Tutor</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dimmer)' }}>CS101</span>
            </div>

            <div className="product-preview-body space-y-4">
              {/* Student message */}
              <div className="flex justify-end">
                <div className="max-w-xs py-3 px-4" style={{ background: 'var(--fill-solid)', border: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
                    Why is binary search O(log n)?
                  </p>
                </div>
              </div>

              {/* AI response */}
              <div className="flex gap-3">
                <div className="w-7 h-7 shrink-0 flex items-center justify-center" style={{ background: 'var(--accent-dim)', marginTop: 2 }}>
                  <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--accent)' }}>auto_awesome</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="py-3 px-4" style={{ background: 'var(--fill-ghost)', border: '1px solid var(--line)' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-dim)', margin: 0 }}>
                      Think of searching a dictionary. Instead of checking every page, you eliminate half the remaining pages each time. That halving is what gives us log(n).
                    </p>
                  </div>

                  {/* Response sections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {responseSections.map((s, i) => (
                      <motion.div key={s.title} variants={fadeUp} custom={i + 3} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
                        className="py-3 px-3" style={{ background: 'var(--fill-ghost)', border: '1px solid var(--line)' }}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="material-symbols-outlined text-[14px]" style={{ color: i === 2 ? '#e84040' : 'var(--text-dimmer)' }}>{s.icon}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dimmer)' }}>{s.title}</span>
                        </div>
                        <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--text-dimmer)', margin: 0 }}>{s.text}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Still confused */}
                  <div className="flex items-center gap-2 pt-1">
                    <span style={{ fontSize: 12, color: 'var(--text-dimmer)' }}>Still confused?</span>
                    <button className="flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Explain another way →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
