import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/* ─── Animated Concentric Rings ─── */
function AbstractCore() {
  return (
    <div className="relative w-full h-[800px] flex items-center justify-center pointer-events-none" style={{ perspective: 1200 }}>
      {/* Outer Dim Circle */}
      <motion.div
        className="absolute rounded-full border border-[rgba(232,64,64,0.15)]"
        style={{ width: 500, height: 500 }}
        animate={{ scale: [1, 1.02, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Tilted Orbital Ring */}
      <div 
        className="absolute flex items-center justify-center"
        style={{ transform: 'rotateX(72deg) rotateY(-15deg)', transformStyle: 'preserve-3d' }}
      >
        <div 
          className="rounded-full border-[3px] border-[#e84040]"
          style={{ width: 380, height: 380, boxShadow: '0 0 30px rgba(232,64,64,0.4), inset 0 0 30px rgba(232,64,64,0.4)' }}
        />
        {/* Orbiting Satellite Dot */}
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotateZ: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full" style={{ boxShadow: '0 0 20px 8px #e84040' }} />
        </motion.div>
      </div>

      {/* Central Orb */}
      <motion.div
        className="absolute z-10 rounded-full"
        style={{
          width: 190, height: 190,
          background: 'radial-gradient(circle at 30% 30%, #ff8a8a 0%, #e84040 40%, #8a1010 100%)',
          boxShadow: '0 0 80px 20px rgba(232,64,64,0.4), inset -15px -15px 30px rgba(0,0,0,0.6)'
        }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 80px 20px rgba(232,64,64,0.4), inset -15px -15px 30px rgba(0,0,0,0.6)',
            '0 0 120px 40px rgba(232,64,64,0.6), inset -15px -15px 30px rgba(0,0,0,0.6)',
            '0 0 80px 20px rgba(232,64,64,0.4), inset -15px -15px 30px rgba(0,0,0,0.6)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ background: '#030303' }}>
      {/* Deep Red Radial Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 60% 50%, rgba(120, 20, 20, 0.15) 0%, transparent 60%)'
      }} />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 pt-32 pb-24 flex flex-col justify-between flex-1">
        
        {/* Top Section (Text + Abstract Core + Floating Card) */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-24 relative">
          
          {/* Left Text */}
          <div className="w-full lg:w-[50%] xl:w-[55%] z-20 pointer-events-none relative mix-blend-difference">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15, delayChildren: 0.1 }
                }
              }}
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 200,
                fontSize: 'clamp(64px, 9vw, 140px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="overflow-hidden"><motion.div variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}>Turn</motion.div></div>
              <div className="overflow-hidden"><motion.div variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}>confusion</motion.div></div>
              <div className="overflow-hidden"><motion.div variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}>
                into <span style={{ fontWeight: 400 }} className="text-gradient-red">clarity</span>
              </motion.div></div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(18px, 1.5vw, 24px)',
                color: 'var(--text-dim)',
                marginTop: 40,
                letterSpacing: '0.01em',
                pointerEvents: 'auto',
                fontWeight: 300
              }}
            >
              Real-time learning intelligence.<br/>Revealing the invisible struggle.
            </motion.p>
          </div>

          {/* Abstract Center/Right Graphic */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] pointer-events-none opacity-80 mix-blend-screen lg:opacity-100 lg:-translate-x-1/4">
            <AbstractCore />
          </div>

          {/* Floating Right Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[35%] xl:w-[32%] z-20 mt-16 lg:mt-0"
          >
            <div className="glass-panel p-8 rounded-2xl">
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                lineHeight: 1.7,
                color: 'var(--text-dim)',
                fontWeight: 300
              }}>
                "Cogniva feels like gaining a superpower. It pinpoints exactly where my students get stuck in real-time. I can address knowledge gaps instantly before they snowball."
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)] bg-[var(--fill-solid)] flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}&backgroundColor=transparent`} alt="avatar" className="w-6 h-6 opacity-70" />
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dimmer)' }}>
                  Trusted by 200+ Educators
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Wide Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative z-20"
        >
          <div className="glass-panel rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-t border-[rgba(232,64,64,0.3)] shadow-[0_-20px_60px_-20px_rgba(232,64,64,0.15)]">
            <div className="md:w-[45%]">
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(28px, 3vw, 42px)',
                letterSpacing: '-0.02em',
                color: '#fff',
                marginBottom: 16
              }}>
                The clarity engine
              </h2>
            </div>
            
            <div className="md:w-[45%] flex flex-col items-start gap-8">
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--text-dim)',
                fontWeight: 300
              }}>
                We bridge the gap between confusion and understanding. From real-time student signals to actionable AI-generated lesson adjustments — we transform classroom ambiguity into sharp, reliable learning paths.
              </p>
              
              <Link to="/login" className="flex items-center gap-3 px-6 py-3 rounded-full transition-all group" style={{
                background: 'rgba(232,64,64,0.15)',
                border: '1px solid rgba(232,64,64,0.3)',
                color: '#fff'
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.05em' }}>See how it works</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
