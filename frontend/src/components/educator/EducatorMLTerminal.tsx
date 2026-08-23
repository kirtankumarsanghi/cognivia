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
  const [activeTab, setActiveTab] = useState<'activity' | 'anomaly' | 'early_warning'>('activity');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (loadingMl) {
      setProcessing(true);
      setActiveTab('activity');
    } else if ((mlRisk || mlInsights) && processing) {
      setTimeout(() => {
        setProcessing(false);
        setActiveTab('anomaly');
      }, 1000);
    }
  }, [loadingMl, mlRisk, mlInsights, processing]);

  const riskScore = mlInsights?.predictions ? 
    (mlInsights.predictions.reduce((a: number, b: number) => a + b, 0) / mlInsights.predictions.length * 100) : 0;

  return (
    <motion.section 
      variants={fadeUp(0.25)} 
      initial="hidden" 
      animate="visible" 
      className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20 relative shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 relative z-10 bg-surface">
        <h2 className="font-label-md text-on-surface uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">insights</span>
          Student Risk Insights
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-bright/50 rounded-lg p-1 border border-outline-variant/10">
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === 'activity' ? 'bg-surface text-primary shadow-sm' : 'text-outline hover:text-on-surface'}`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('anomaly')}
              disabled={!mlRisk}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!mlRisk ? 'opacity-30 cursor-not-allowed' : activeTab === 'anomaly' ? 'bg-surface text-error shadow-sm' : 'text-outline hover:text-on-surface'}`}
            >
              Flags
            </button>
            <button
              onClick={() => setActiveTab('early_warning')}
              disabled={!mlInsights}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!mlInsights ? 'opacity-30 cursor-not-allowed' : activeTab === 'early_warning' ? 'bg-surface text-primary shadow-sm' : 'text-outline hover:text-on-surface'}`}
            >
              Overview
            </button>
          </div>
          
          <button 
            onClick={onGenerate}
            disabled={loadingMl || processing}
            className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-label-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {(loadingMl || processing) ? (
              <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Updating...</>
            ) : (
              <><span className="material-symbols-outlined text-[16px]">sync</span> Refresh Data</>
            )}
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-6 h-[280px] relative z-10 overflow-hidden bg-surface-container/50">
        <AnimatePresence mode="wait">
          
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col justify-center items-center text-center"
            >
              {(loadingMl || processing) ? (
                <div className="flex flex-col items-center text-primary gap-4">
                  <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                  <p className="font-body-sm text-on-surface">Analyzing recent performance metrics...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-outline gap-3">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                  <p className="font-body-sm text-on-surface-variant">Insights are up to date. No new critical activity detected in the last 15 minutes.</p>
                </div>
              )}
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
              <div className="flex items-center gap-4 p-4 bg-error/5 border border-error/20 rounded-xl mb-5">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0 text-error">
                  <span className="material-symbols-outlined text-[24px]">flag</span>
                </div>
                <div>
                  <span className="font-label-xs text-error uppercase tracking-wider block mb-1">Attention Needed</span>
                  <h4 className="font-headline-sm text-on-surface">Alex Johnson</h4>
                </div>
                <div className="ml-auto text-right">
                  <span className="font-label-xs text-outline uppercase">Calculated Risk</span>
                  <div className="font-mono text-error font-bold text-lg">{(mlRisk.risk_probability * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/10">
                  <h4 className="font-label-xs text-outline uppercase tracking-wider mb-2">Key Factors</h4>
                  <ul className="space-y-1">
                    {mlRisk.contributing_factors?.map((cf: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className={`w-1.5 h-1.5 rounded-full ${cf.impact === 'high' ? 'bg-error' : 'bg-primary'}`}></span>
                        {cf.factor}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-surface p-3 rounded-lg border border-outline-variant/10 flex flex-col justify-center">
                  <span className="font-label-xs text-outline uppercase tracking-wider mb-2">Analysis Confidence</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `85%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="font-mono text-primary font-bold text-sm">85%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Overview Tab */}
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
                    <circle className="text-surface-variant" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                    <motion.circle
                      className="text-primary"
                      cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2"
                      strokeLinecap="round" strokeWidth="8"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * riskScore) / 100 }}
                      transition={{ duration: 1.5, ease: premiumEase }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-headline-sm text-on-surface font-bold">{riskScore.toFixed(1)}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-outline">Avg Risk</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface rounded-xl p-4 border border-outline-variant/10 flex items-center justify-between">
                <div>
                  <h4 className="font-label-sm text-on-surface uppercase">Class Assessment</h4>
                  <p className="text-xs text-outline mt-1">Analytics indicate elevated risk patterns in 3 students.</p>
                </div>
                <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors shrink-0">
                  Review Details
                </button>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
