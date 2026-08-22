import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/animation';
import { useApi } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';

export default function ConfusionHistory() {
  const api = useApi();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.get('/confusion/history');
      setHistory(data);
    } catch (err) {
      console.error('Failed to load confusion history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecap = (signal: any) => {
    const concept = Array.isArray(signal.concepts) ? signal.concepts[0] : signal.concepts;
    if (!concept) return;

    // Navigate to tutor with pre-filled question about this confusion
    const question = `I was confused about ${concept.name}. Can you help me understand it better?`;
    navigate('/student/tutor', {
      state: {
        initialQuestion: question,
        conceptId: concept.id,
        signalId: signal.id,
        hasTimestamp: signal.lecture_timestamp_seconds !== null
      }
    });
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
        <div className="text-center text-outline">Loading...</div>
      </div>
    );
  }

  return (
    <motion.section
      variants={fadeUp(0.4)}
      initial="hidden"
      animate="visible"
      className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10"
    >
      <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
        Recent Confusion Signals
      </h2>
      
      {history.length === 0 ? (
        <div className="py-8 text-center text-on-surface-variant">
          <p className="font-body-sm">No confusion signals yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 5).map((signal: any) => {
            const concept = Array.isArray(signal.concepts) ? signal.concepts[0] : signal.concepts;
            const hasTimestamp = signal.lecture_timestamp_seconds !== null;
            
            return (
              <div
                key={signal.id}
                className="bg-surface rounded-xl p-4 border border-outline-variant/10 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        signal.signal === 'Confused'
                          ? 'bg-error/10 text-error'
                          : signal.signal === 'Partially Clear'
                          ? 'bg-[#E8A634]/10 text-[#E8A634]'
                          : 'bg-[#3DD68C]/10 text-[#3DD68C]'
                      }`}>
                        {signal.signal}
                      </span>
                      {hasTimestamp && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {formatTimestamp(signal.lecture_timestamp_seconds)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-headline-sm text-on-surface mb-1">
                      {concept?.name || 'Unknown Concept'}
                    </h4>
                    <p className="text-xs text-outline">
                      {new Date(signal.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {signal.signal !== 'Clear' && (
                    <button
                      onClick={() => handleGetRecap(signal)}
                      className={`px-3 py-2 rounded-lg font-label-sm uppercase tracking-wider text-xs transition-all flex items-center gap-1 ${
                        hasTimestamp
                          ? 'bg-primary text-on-primary hover:opacity-90'
                          : 'bg-surface-variant text-on-surface hover:bg-surface-bright'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {hasTimestamp ? 'timeline' : 'psychology'}
                      </span>
                      {hasTimestamp ? 'Moment Recap' : 'Get Help'}
                    </button>
                  )}
                </div>
                
                {hasTimestamp && (
                  <div className="mt-2 text-xs text-primary/80 bg-primary/5 rounded px-2 py-1 inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    This signal was captured during a live lecture - get a recap of the exact moment!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
