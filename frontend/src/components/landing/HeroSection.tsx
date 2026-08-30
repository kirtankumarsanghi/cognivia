import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/* ─── Enhanced Animated Concentric Rings with More Features ─── */
function AbstractCore() {
  return (
    <div className="relative w-full h-[1000px] flex items-center justify-center pointer-events-none" style={{ perspective: 1400 }}>
      {/* Outer Pulsing Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ 
          width: 700, 
          height: 700,
          background: 'radial-gradient(circle, rgba(232,64,64,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Outer Dim Circle */}
      <motion.div
        className="absolute rounded-full border-2 border-[rgba(232,64,64,0.15)]"
        style={{ width: 600, height: 600 }}
        animate={{ 
          scale: [1, 1.02, 1], 
          opacity: [0.5, 1, 0.5],
          rotate: [0, 360]
        }}
        transition={{ 
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 40, repeat: Infinity, ease: "linear" }
        }}
      />

      {/* Middle Rotating Ring */}
      <motion.div
        className="absolute rounded-full border-2 border-[rgba(232,100,100,0.25)]"
        style={{ width: 480, height: 480 }}
        animate={{ 
          rotate: [0, -360],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Orbiting particles on middle ring */}
        {[0, 120, 240].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-red-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              boxShadow: '0 0 20px 4px rgba(232,64,64,0.6)',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-240px)`
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </motion.div>
      
      {/* Tilted Orbital Ring */}
      <div 
        className="absolute flex items-center justify-center"
        style={{ transform: 'rotateX(72deg) rotateY(-15deg)', transformStyle: 'preserve-3d' }}
      >
        <div 
          className="rounded-full border-[3px] border-[#e84040]"
          style={{ 
            width: 420, 
            height: 420, 
            boxShadow: '0 0 40px rgba(232,64,64,0.5), inset 0 0 40px rgba(232,64,64,0.5)' 
          }}
        />
        {/* Orbiting Satellite Dots */}
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotateZ: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full" 
            style={{ boxShadow: '0 0 25px 10px #e84040' }} 
          />
        </motion.div>
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotateZ: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-red-300 rounded-full" 
            style={{ boxShadow: '0 0 20px 8px #ff6b6b' }} 
          />
        </motion.div>
      </div>

      {/* Inner Geometric Ring */}
      <motion.div
        className="absolute"
        style={{ width: 300, height: 300 }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 300 300">
          <motion.circle
            cx="150"
            cy="150"
            r="145"
            fill="none"
            stroke="rgba(232,64,64,0.3)"
            strokeWidth="2"
            strokeDasharray="20 10"
            animate={{ 
              strokeDashoffset: [0, -100],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              strokeDashoffset: { duration: 3, repeat: Infinity, ease: "linear" },
              opacity: { duration: 4, repeat: Infinity }
            }}
          />
        </svg>
      </motion.div>

      {/* Central Orb with Enhanced Effects */}
      <motion.div
        className="absolute z-10 rounded-full"
        style={{
          width: 220, 
          height: 220,
          background: 'radial-gradient(circle at 30% 30%, #ff8a8a 0%, #e84040 40%, #8a1010 100%)',
          boxShadow: '0 0 100px 30px rgba(232,64,64,0.5), inset -20px -20px 40px rgba(0,0,0,0.7)'
        }}
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            '0 0 100px 30px rgba(232,64,64,0.5), inset -20px -20px 40px rgba(0,0,0,0.7)',
            '0 0 140px 50px rgba(232,64,64,0.8), inset -20px -20px 40px rgba(0,0,0,0.7)',
            '0 0 100px 30px rgba(232,64,64,0.5), inset -20px -20px 40px rgba(0,0,0,0.7)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Surface detail */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      {/* Energy lines emanating from center */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.div
          key={angle}
          className="absolute"
          style={{
            width: 2,
            height: 100,
            background: `linear-gradient(to top, rgba(232,64,64,0.6), transparent)`,
            transformOrigin: 'bottom center',
            bottom: '50%',
            left: '50%',
            transform: `translateX(-50%) rotate(${angle}deg)`,
          }}
          animate={{
            height: [100, 150, 100],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
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

          {/* Abstract Center/Right Graphic - Enhanced Size and Position */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1000px] pointer-events-none opacity-90 mix-blend-screen lg:opacity-100 lg:left-[60%] lg:-translate-x-1/2 xl:left-[65%] scale-110 lg:scale-125">
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
