import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, premiumEase } from '../../utils/animation';

interface CognivaAIEngineProps {
  profile: any;
  recommendation: any;
  loadingProfile: boolean;
  onGenerate: () => void;
}

export default function CognivaAIEngine({ profile, recommendation, loadingProfile, onGenerate }: CognivaAIEngineProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'recommendation' | 'stream'>('stream');
  const [dataStream, setDataStream] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // Simulate a live data stream of ML metrics
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'stream' || processing || loadingProfile) {
      interval = setInterval(() => {
        const metrics = [
          'Analyzing cognitive load patterns...',
          'Calibrating knowledge decay matrix...',
          'Detecting anomaly in focus duration...',
          'Updating Bayesian Knowledge Tracing weights...',
          'Evaluating confusion risk probability...',
          'Cross-referencing historical cohort data...',
          'Optimizing neural pathways...',
          'Computing retention probabilities...'
        ];
        const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
        const timestamp = new Date().toISOString().substring(11, 19);
        setDataStream(prev => [`[${timestamp}] ${randomMetric}`, ...prev].slice(0, 5));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [activeTab, processing, loadingProfile]);

  useEffect(() => {
    if (loadingProfile) {
      setProcessing(true);
      setActiveTab('stream');
    } else if (profile && processing) {
      setTimeout(() => {
        setProcessing(false);
        setActiveTab('profile');
      }, 2000);
    }
  }, [loadingProfile, profile, processing]);

  return (
    <motion.section 
      variants={fadeUp(0.25)} 
      initial="hidden" 
      animate="visible" 
      className="bg-[#0D1117] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(42,212,174,0.1)] border border-[#2AD4AE]/20 relative"
    >
      {/* Background glowing effects */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#2AD4AE]/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-[#2AD4AE]/10 relative z-10">
        <h2 className="font-label-md text-[#2AD4AE] uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] animate-pulse">memory</span>
          Cogniva ML Core
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-bright/30 rounded-lg p-1 border border-outline-variant/10">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'stream' ? 'bg-[#2AD4AE]/20 text-[#2AD4AE]' : 'text-on-surface-variant hover:text-white'}`}
            >
              Live
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              disabled={!profile}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${!profile ? 'opacity-30 cursor-not-allowed' : activeTab === 'profile' ? 'bg-[#2AD4AE]/20 text-[#2AD4AE]' : 'text-on-surface-variant hover:text-white'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('recommendation')}
              disabled={!recommendation}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${!recommendation ? 'opacity-30 cursor-not-allowed' : activeTab === 'recommendation' ? 'bg-[#2AD4AE]/20 text-[#2AD4AE]' : 'text-on-surface-variant hover:text-white'}`}
            >
              Actions
            </button>
          </div>
          
          <button 
            onClick={onGenerate}
            disabled={loadingProfile || processing}
            className="bg-[#2AD4AE]/10 text-[#2AD4AE] border border-[#2AD4AE]/30 px-4 py-1.5 rounded-lg font-label-sm uppercase hover:bg-[#2AD4AE]/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {(loadingProfile || processing) ? (
              <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Processing</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]">bolt</span> Analyze</>
            )}
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-6 h-[280px] relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* Live Stream Tab */}
          {activeTab === 'stream' && (
            <motion.div
              key="stream"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col font-mono text-sm"
            >
              <div className="flex items-center gap-2 mb-4 text-[#2AD4AE]/70">
                <span className="w-2 h-2 rounded-full bg-[#2AD4AE] animate-pulse"></span>
                <span>SYSTEM INTERCEPT_MODE: ACTIVE</span>
              </div>
              <div className="flex-1 flex flex-col-reverse overflow-hidden gap-2">
                {dataStream.map((line, idx) => (
                  <motion.div 
                    key={idx + line}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1 - (idx * 0.2), x: 0 }}
                    className={`text-xs ${idx === 0 ? 'text-[#2AD4AE] font-bold' : 'text-on-surface-variant'}`}
                  >
                    {line}
                  </motion.div>
                ))}
                {(dataStream.length === 0 && !loadingProfile && !processing) && (
                  <div className="text-on-surface-variant text-center my-auto">
                    Awaiting analysis trigger...
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && profile && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full grid grid-cols-2 gap-6"
            >
              <div className="flex flex-col justify-center items-center p-4 bg-surface-bright/20 border border-[#2AD4AE]/10 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#2AD4AE]/5 to-transparent pointer-events-none"></div>
                <span className="material-symbols-outlined text-[48px] text-[#2AD4AE] mb-3 drop-shadow-[0_0_15px_rgba(42,212,174,0.5)]">
                  {profile.cluster === 'Struggling' ? 'warning' : profile.cluster === 'Advanced' ? 'rocket_launch' : 'psychology'}
                </span>
                <span className="font-label-sm text-outline uppercase tracking-widest mb-1 text-center">Classified Pattern</span>
                <span className="font-headline-sm text-white text-center font-bold">{profile.cluster}</span>
              </div>
              
              <div className="flex flex-col justify-center gap-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-label-xs text-on-surface-variant uppercase tracking-wider">Model Confidence</span>
                    <span className="font-label-sm text-[#2AD4AE]">{(profile.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-bright/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#2AD4AE] shadow-[0_0_10px_rgba(42,212,174,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.confidence * 100}%` }}
                      transition={{ duration: 1.5, ease: premiumEase }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface-bright/30 p-2 rounded border border-outline-variant/10">
                    <span className="block text-on-surface-variant mb-1">P(Mastery)</span>
                    <span className="text-white font-mono">0.8732</span>
                  </div>
                  <div className="bg-surface-bright/30 p-2 rounded border border-outline-variant/10">
                    <span className="block text-on-surface-variant mb-1">Decay Rate</span>
                    <span className="text-white font-mono">0.014</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommendation Tab */}
          {activeTab === 'recommendation' && recommendation && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col justify-center"
            >
              <div className="flex items-start gap-4 p-5 bg-[#E8A634]/10 border border-[#E8A634]/30 rounded-xl mb-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-[#E8A634]/20 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="w-12 h-12 rounded-xl bg-[#E8A634]/20 flex items-center justify-center shrink-0 border border-[#E8A634]/30 shadow-[0_0_15px_rgba(232,166,52,0.3)]">
                  <span className="material-symbols-outlined text-[#E8A634] text-[24px]">explore</span>
                </div>
                <div>
                  <span className="font-label-xs text-[#E8A634] uppercase tracking-widest block mb-1">Target Action Detected</span>
                  <span className="font-headline-sm text-white capitalize font-bold leading-tight mb-2 block">
                    {recommendation.next_best_action.replace(/_/g, ' ')}
                  </span>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    <span className="text-[#E8A634]/70 mr-1">↳</span> {recommendation.reasoning}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 px-2">
                <span className="font-mono text-xs text-on-surface-variant flex-1 text-right">Prediction Weighting</span>
                <div className="flex-1 h-1 bg-surface-bright/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#E8A634] to-[#2AD4AE]"
                    initial={{ width: 0 }}
                    animate={{ width: `${recommendation.confidence * 100}%` }}
                    transition={{ duration: 1.5, ease: premiumEase }}
                  />
                </div>
                <span className="font-mono text-xs text-[#E8A634]">{(recommendation.confidence * 100).toFixed(1)}%</span>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
