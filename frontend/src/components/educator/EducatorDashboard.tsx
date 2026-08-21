import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function EducatorDashboard() {
  const api = useApi();
  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const [pulse, setPulse] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const pulseData = await api.get('/confusion/pulse');
        setPulse(pulseData);
      } catch (err) {
        console.error('Failed to load educator data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-on-surface-variant">Loading insights...</div>;

  const totalSignals = pulse.length;
  const unresolvedSignals = pulse.filter(p => p.status !== 'Resolved').length;
  const criticalConcepts = pulse.filter(p => p.status === 'Critical');

  return (
    <div className="page-shell">
      <button onClick={() => { switchRole('student'); navigate('/dashboard'); }} className="back-link"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to student view</button>
      <header className="page-heading">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">Class Analytics</span>
          <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0 flex items-center gap-3">
            <span className="material-symbols-outlined text-[32px] text-primary">analytics</span>
            Educator Insights
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Monitor real-time classroom confusion and identify critical learning gaps.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-[24px]">trending_up</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Total Signals</span>
              <span className="font-headline-lg text-headline-lg text-on-surface">{totalSignals}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-error/5 group-hover:bg-error/10 transition-colors"></div>
          <div className="relative flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-error/80 uppercase tracking-widest">Needs Attention</span>
              <span className="font-headline-lg text-headline-lg text-error">{unresolvedSignals}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 shadow-md relative overflow-hidden group">
          <div className="relative flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-on-primary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md uppercase tracking-widest opacity-80">AI Interventions</span>
              <span className="font-headline-lg text-headline-lg">{totalSignals - unresolvedSignals}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <section className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">dynamic_feed</span>
            Live Confusion Stream
          </h2>
          <div className="flex flex-col gap-y-4 pt-4">
            {pulse.map((sig, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${sig.status === 'Resolved' ? 'bg-primary' : 'bg-error animate-pulse'}`}></div>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface font-medium">{sig.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Student struggled with this concept</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`font-label-sm text-label-sm uppercase tracking-widest px-2 py-0.5 rounded-full ${sig.status === 'Resolved' ? 'bg-primary/20 text-primary' : 'bg-error-container text-on-error-container'}`}>
                    {sig.status}
                  </span>
                </div>
              </div>
            ))}
            
            {pulse.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant">No confusion signals yet.</div>
            )}
          </div>
        </section>

        <section className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 flex flex-col justify-between">
          <div>
             <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
               <span className="material-symbols-outlined text-error">priority_high</span>
               Critical Concepts
             </h2>
             <p className="font-body-md text-body-md text-on-surface-variant mb-4">These concepts have the highest frequency of unresolved confusion signals in your class.</p>
             
             <div className="flex flex-col gap-4">
                {criticalConcepts.length > 0 ? criticalConcepts.map((sig, i) => (
                   <div key={i} className="p-4 bg-error-container/10 border border-error-container/20 rounded-xl">
                      <h3 className="font-body-md text-body-md text-on-surface font-medium">{sig.name}</h3>
                      <p className="font-body-sm text-body-sm text-error/80 mt-1">Requires educator intervention. Multiple students are stuck here.</p>
                   </div>
                )) : (
                   <div className="p-8 text-center text-on-surface-variant">No critical concepts identified.</div>
                )}
             </div>
          </div>
          
          <button className="mt-8 w-full bg-surface-bright hover:bg-primary hover:text-on-primary text-on-surface px-6 py-3 rounded-xl font-label-md tracking-widest uppercase transition-colors flex items-center justify-center gap-2">
            Generate Lesson Plan <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </button>
        </section>
      </div>
    </div>
  );
}
