import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpChild } from '../../utils/animation';
import Loading from '../ui/Loading';

export default function ConfusionHistory() {
  const api = useApi();
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSignal, setFilterSignal] = useState<string>('all');
  const [filterConcept, setFilterConcept] = useState<string>('all');

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await api.get('/confusion/history');
        setHistory(data);
        setFilteredHistory(data);
      } catch (err) {
        console.error('Failed to load confusion history', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    let filtered = history;
    
    if (filterSignal !== 'all') {
      filtered = filtered.filter(h => h.signal === filterSignal);
    }
    
    if (filterConcept !== 'all') {
      filtered = filtered.filter(h => h.concepts.name === filterConcept);
    }
    
    setFilteredHistory(filtered);
  }, [filterSignal, filterConcept, history]);

  if (loading) return <Loading variant="courses" />;

  const uniqueConcepts = Array.from(new Set(history.map(h => h.concepts.name)));

  const getSignalColor = (signal: string) => {
    if (signal === 'Confused') return 'text-error bg-error/10 border-error/20';
    if (signal === 'Partially Clear') return 'text-[#E8A634] bg-[#E8A634]/10 border-[#E8A634]/20';
    return 'text-[#3DD68C] bg-[#3DD68C]/10 border-[#3DD68C]/20';
  };

  const getSignalIcon = (signal: string) => {
    if (signal === 'Confused') return 'sentiment_very_dissatisfied';
    if (signal === 'Partially Clear') return 'sentiment_neutral';
    return 'sentiment_satisfied';
  };

  return (
    <div className="page-shell">
      <Link to="/dashboard" className="back-link">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to dashboard
      </Link>

      <header className="page-heading">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[32px]">history</span>
          <div>
            <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0">
              Confusion History
            </h1>
            <p className="font-body-lg text-on-surface-variant mt-2">
              Track your learning journey and see how your understanding evolves.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-label-sm text-outline uppercase tracking-wider mb-2 block">
              Filter by Signal
            </label>
            <select
              value={filterSignal}
              onChange={(e) => setFilterSignal(e.target.value)}
              className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Signals</option>
              <option value="Confused">Confused</option>
              <option value="Partially Clear">Partially Clear</option>
              <option value="Clear">Clear</option>
            </select>
          </div>
          <div>
            <label className="font-label-sm text-outline uppercase tracking-wider mb-2 block">
              Filter by Concept
            </label>
            <select
              value={filterConcept}
              onChange={(e) => setFilterConcept(e.target.value)}
              className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Concepts</option>
              {uniqueConcepts.map((concept) => (
                <option key={concept} value={concept}>{concept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            {filteredHistory.length} Signals
          </h2>
        </div>

        {filteredHistory.length > 0 ? (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeUpChild}
                className="flex items-start gap-4 p-5 bg-surface rounded-xl hover:bg-surface-bright transition-colors border border-outline-variant/10"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getSignalColor(item.signal)}`}>
                  <span className={`material-symbols-outlined text-[24px] ${
                    item.signal === 'Confused' ? 'text-error' :
                    item.signal === 'Partially Clear' ? 'text-[#E8A634]' : 'text-[#3DD68C]'
                  }`}>
                    {getSignalIcon(item.signal)}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-headline-sm text-on-surface mb-1">
                        {item.concepts.name}
                      </h3>
                      <p className="font-body-sm text-on-surface-variant">
                        {item.concepts.lesson?.course?.name || 'Course'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-label-sm uppercase border whitespace-nowrap ${getSignalColor(item.signal)}`}>
                      {item.signal}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-on-surface-variant">
                    <span className="font-body-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/tutor?concept=${item.concept_id}`}
                  className="bg-surface-container-high hover:bg-primary text-on-surface hover:text-on-primary px-4 py-2 rounded-lg transition-colors font-label-sm uppercase flex items-center gap-2 border border-outline-variant/10"
                >
                  Review
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-[64px] text-outline opacity-20 mb-4">
              search_off
            </span>
            <p className="font-body-md text-on-surface-variant">
              No signals found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
