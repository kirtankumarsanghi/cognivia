import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, premiumEase } from '../../utils/animation';

interface EducatorMLTerminalProps {
  mlRisk: any;
  mlInsights: any;
  loadingMl: boolean;
  onGenerate: () => void;
}

export default function EducatorMLTerminal({ mlRisk, mlInsights, loadingMl, onGenerate }: EducatorMLTerminalProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'anomaly' | 'early_warning'>('stream');
  const [dataStream, setDataStream] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // Simulate a live data stream of ML metrics
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'stream' || processing || loadingMl) {
      interval = setInterval(() => {
        const metrics = [
          'Aggregating cohort performance data...',
          'Detecting anomalous interaction times...',
          'Evaluating Random Forest ensemble...',
          'Calculating learning risk probabilities...',
          'Analyzing cognitive drop-off rates...',
          'Updating predictive models...',
          'Correlating confusion signals with outcomes...',
          'Generating early warning flags...'
        ];
        const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
        const timestamp = new Date().toISOString().substring(11, 19);
        setDataStream(prev => [`[${timestamp}] ${randomMetric}`, ...prev].slice(0, 5));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [activeTab, processing, loadingMl]);

  useEffect(() => {
    if (loadingMl) {
      setProcessing(true);
      setActiveTab('stream');
    } else if ((mlRisk || mlInsights) && processing) {
      setTimeout(() => {
        setProcessing(false);
        setActiveTab('anomaly');
      }, 2000);
    }
  }, [loadingMl, mlRisk, mlInsights, processing]);

  const riskScore = mlInsights?.predictions ? 
    (mlInsights.predictions.reduce((a: number, b: number) => a + b, 0) / mlInsights.predictions.length * 100) : 0;

  return (
    <motion.section 
      variants={fadeUp(0.25)} 
      initial="hidden" 
      animate="visible" 
      className="bg-[#0A0E17] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(232,166,52,0.1)] border border-[#E8A634]/20 relative"
    >
      {/* Background glowing effects */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#E8A634]/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-error/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-[#E8A634]/10 relative z-10">
        <h2 className="font-label-md text-[#E8A634] uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] animate-pulse">radar</span>
          ML Early Warning System
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-bright/30 rounded-lg p-1 border border-outline-variant/10">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'stream' ? 'bg-[#E8A634]/20 text-[#E8A634]' : 'text-on-surface-variant hover:text-white'}`}
            >
              Live
            </button>
            <button
              onClick={() => setActiveTab('anomaly')}
              disabled={!mlRisk}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${!mlRisk ? 'opacity-30 cursor-not-allowed' : activeTab === 'anomaly' ? 'bg-error/20 text-error' : 'text-on-surface-variant hover:text-white'}`}
            >
              Anomalies
            </button>
            <button
              onClick={() => setActiveTab('early_warning')}
              disabled={!mlInsights}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${!mlInsights ? 'opacity-30 cursor-not-allowed' : activeTab === 'early_warning' ? 'bg-[#E8A634]/20 text-[#E8A634]' : 'text-on-surface-variant hover:text-white'}`}
            >
              Risk Matrix
            </button>
          </div>
          
          <button 
            onClick={onGenerate}
            disabled={loadingMl || processing}
            className="bg-[#E8A634]/10 text-[#E8A634] border border-[#E8A634]/30 px-4 py-1.5 rounded-lg font-label-sm uppercase hover:bg-[#E8A634]/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {(loadingMl || processing) ? (
              <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Scanning</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]">troubleshoot</span> Scan Class</>
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
              <div className="flex items-center gap-2 mb-4 text-[#E8A634]/70">
                <span className="w-2 h-2 rounded-full bg-[#E8A634] animate-pulse"></span>
                <span>SYSTEM SCAN_MODE: ACTIVE (ENSEMBLE MODEL)</span>
              </div>
              <div className="flex-1 flex flex-col-reverse overflow-hidden gap-2">
                {dataStream.map((line, idx) => (
                  <motion.div 
                    key={idx + line}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1 - (idx * 0.2), x: 0 }}
                    className={`text-xs ${idx === 0 ? 'text-[#E8A634] font-bold' : 'text-on-surface-variant'}`}
                  >
                    {line}
                  </motion.div>
                ))}
                {(dataStream.length === 0 && !loadingMl && !processing) && (
                  <div className="text-on-surface-variant text-center my-auto">
                    Awaiting scan trigger...
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Anomaly Tab */}
          {activeTab === 'anomaly' && mlRisk && (
            <motion.div
              key="anomaly"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 p-4 bg-error/10 border border-error/30 rounded-xl relative overflow-hidden mb-5">
                <div className="absolute left-0 top-0 w-1 h-full bg-error"></div>
                <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center shrink-0 border border-error/30">
                  <span className="material-symbols-outlined text-error text-[24px]">warning</span>
                </div>
                <div>
                  <span className="font-label-xs text-error uppercase tracking-widest block mb-1">High Risk Student Detected</span>
                  <h4 className="font-headline-sm text-white">Alex Johnson</h4>
                </div>
                <div className="ml-auto text-right">
                  <span className="font-label-xs text-on-surface-variant uppercase">Risk Probability</span>
                  <div className="font-mono text-error font-bold text-lg">{(mlRisk.risk_probability * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-bright/20 p-3 rounded-lg border border-outline-variant/10">
                  <h4 className="font-label-xs text-outline uppercase tracking-wider mb-2">Contributing Factors</h4>
                  <ul className="space-y-1">
                    {mlRisk.contributing_factors?.map((cf: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-on-surface">
                        <span className={`w-1.5 h-1.5 rounded-full ${cf.impact === 'high' ? 'bg-error' : 'bg-[#E8A634]'}`}></span>
                        {cf.factor}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-surface-bright/20 p-3 rounded-lg border border-outline-variant/10 flex flex-col justify-center">
                  <span className="font-label-xs text-outline uppercase tracking-wider mb-2">Model Confidence</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-error"
                        initial={{ width: 0 }}
                        animate={{ width: `85%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="font-mono text-error font-bold text-sm">85%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Early Warning Tab */}
          {activeTab === 'early_warning' && mlInsights && (
            <motion.div
              key="early_warning"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col justify-center"
            >
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-surface-bright" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                    <motion.circle
                      className="text-[#E8A634] drop-shadow-[0_0_10px_rgba(232,166,52,0.6)]"
                      cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2"
                      strokeLinecap="round" strokeWidth="8"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * riskScore) / 100 }}
                      transition={{ duration: 1.5, ease: premiumEase }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-headline-sm text-white font-bold">{riskScore.toFixed(1)}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#E8A634]">Avg Risk</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#E8A634]/5 rounded-xl p-4 border border-[#E8A634]/20 flex items-center justify-between">
                <div>
                  <h4 className="font-label-sm text-[#E8A634] uppercase">Cohort Risk Assessment</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Random Forest Ensemble model detected elevated risk patterns in 3 students.</p>
                </div>
                <button className="px-4 py-2 bg-[#E8A634]/20 text-[#E8A634] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#E8A634]/30 transition-colors shrink-0">
                  View Action Plan
                </button>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
