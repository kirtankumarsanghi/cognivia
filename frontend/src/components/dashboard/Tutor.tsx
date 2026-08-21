import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpChild, premiumEase } from '../../utils/animation';

function CelebrateBurst({ onComplete }: { onComplete: () => void }) {
  const dots = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const distance = 40 + Math.random() * 30;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: dot.x, y: dot.y, opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.6, ease: premiumEase as unknown as [number, number, number, number] }}
          onAnimationComplete={i === 0 ? onComplete : undefined}
        />
      ))}
    </div>
  );
}

export default function Tutor() {
  const [searchParams] = useSearchParams();
  const conceptId = searchParams.get('concept');
  const navigate = useNavigate();
  const api = useApi();

  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  
  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setResponse(null);
    setShowConfirmation(false);
    try {
      const data = await api.post('/tutor/chat', { question, concept_id: conceptId });
      setResponse(data);
      setShowConfirmation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainAgain = async () => {
    setLoading(true);
    setShowConfirmation(false);
    setResponse(null);
    try {
      const data = await api.post('/tutor/explain-again', { 
        question, 
        previousExplanation: response?.explanation 
      });
      setResponse(data);
      setShowConfirmation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (conceptId) {
      try {
        await api.post('/confusion/signal', { concept_id: conceptId, signal: 'Clear' });
      } catch (err) {
        console.error(err);
      }
    }
    setCelebrating(true);
  };

  return (
    <div className="page-shell min-h-[calc(100vh-4rem)]">
      <Link to="/dashboard" className="back-link"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to dashboard</Link>
      <header className="page-heading">
        <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0 flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary">psychology</span>
          Cogniva AI Tutor
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Ask any question to turn your confusion into clarity.</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20 mt-8">
        {response ? (
          <motion.div 
            initial="hidden" animate="visible"
            className="space-y-6"
          >
            {response.isDemo && (
              <div className="bg-error-container text-on-error-container px-4 py-2 rounded text-sm border border-error-container/20 inline-block font-label-md">
                Demo AI Mode (No API Key configured)
              </div>
            )}

            <motion.div variants={staggerContainer(0.1)} className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 md:p-8 space-y-8 shadow-md">
              <motion.section variants={fadeUpChild}>
                <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Simple Explanation</h3>
                <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">{response.explanation}</p>
              </motion.section>
              
              <motion.section variants={fadeUpChild}>
                <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Why It Works</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{response.whyItWorks}</p>
              </motion.section>
              
              <motion.section variants={fadeUpChild} className="bg-surface-bright/50 p-6 rounded-xl border border-outline-variant/10">
                <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-2">Example</h3>
                <p className="font-body-md text-body-md text-on-surface">{response.example}</p>
              </motion.section>
              
              <motion.section variants={fadeUpChild} className="bg-[rgba(232,64,64,0.1)] p-6 rounded-xl border border-[rgba(232,64,64,0.2)]">
                <h3 className="font-label-md text-label-md text-error uppercase tracking-wider mb-2">Common Mistake</h3>
                <p className="font-body-md text-body-md text-error/90">{response.commonMistake}</p>
              </motion.section>

              <motion.section variants={fadeUpChild} className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-2">Quick Check</h3>
                <p className="font-body-md text-body-md text-primary/90 font-medium">{response.quickCheck}</p>
              </motion.section>

              <motion.section variants={fadeUpChild}>
                <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Next Step</h3>
                <p className="font-body-md text-body-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">arrow_forward</span>
                  {response.nextStep}
                </p>
              </motion.section>
            </motion.div>

            {showConfirmation && (
              <motion.div variants={fadeUpChild} className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-6">
                <h3 className="font-headline-lg text-headline-lg text-on-surface">Did this make sense?</h3>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <div className="relative">
                    <button 
                      onClick={handleClear}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl hover:opacity-90 transition-opacity font-label-md uppercase tracking-widest relative z-10"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Now I'm Clear
                    </button>
                    {celebrating && <CelebrateBurst onComplete={() => navigate('/dashboard')} />}
                  </div>
                  <button 
                    onClick={() => { setShowConfirmation(false); }}
                    className="flex items-center justify-center gap-2 bg-[rgba(232,64,64,0.15)] text-error px-6 py-3 rounded-xl hover:bg-[rgba(232,64,64,0.25)] transition-opacity font-label-md uppercase tracking-widest border border-error/20"
                  >
                    <span className="material-symbols-outlined">help</span>
                    Still Confused
                  </button>
                </div>

                {!showConfirmation && (
                   <button 
                     onClick={handleExplainAgain}
                     className="mt-4 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-bright text-on-surface px-6 py-3 rounded-xl border border-outline-variant/10 transition-colors mx-auto font-label-md"
                   >
                     <span className="material-symbols-outlined">refresh</span>
                     Explain Another Way
                   </button>
                )}
              </motion.div>
            )}
            
            {!showConfirmation && response && (
              <motion.div variants={fadeUpChild} className="text-center">
                  <button 
                     onClick={handleExplainAgain}
                     className="mt-4 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-bright text-on-surface px-6 py-3 rounded-xl border border-outline-variant/10 transition-colors mx-auto font-label-md"
                   >
                     <span className="material-symbols-outlined">refresh</span>
                     Explain Another Way
                   </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-on-surface-variant pt-20">
            <span className="material-symbols-outlined text-[80px] opacity-20 mb-4">psychology</span>
            <p className="font-body-lg text-xl max-w-sm">I'm ready to help you understand anything you're stuck on.</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background pt-4 pb-8">
        <form onSubmit={handleAsk} className="relative">
          <motion.input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="E.g. Why is binary search O(log n)?"
            className="font-body-md w-full bg-surface-container border border-outline-variant/20 rounded-2xl py-4 pl-6 pr-16 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors shadow-lg"
            disabled={loading}
            animate={loading ? { opacity: [1, 0.6, 1] } : {}}
            transition={loading ? { repeat: Infinity, duration: 1.2 } : {}}
          />
          <button 
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
