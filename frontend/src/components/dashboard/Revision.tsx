import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';

export default function Revision() {
  const api = useApi();
  const [revisionPlan, setRevisionPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const revisionData = await api.get('/revision/plan');
        setRevisionPlan(revisionData);
      } catch (err) {
        console.error('Failed to load revision data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-on-surface-variant">Loading revision plan...</div>;

  return (
    <div className="page-shell">
      <Link to="/dashboard" className="back-link"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to dashboard</Link>
      <header className="page-heading">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">Revision Plan</span>
          <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0 flex items-center gap-3">
            <span className="material-symbols-outlined text-[32px] text-primary">event_repeat</span>
            Targeted Learning
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">AI-driven revision queue based on your confusion signals and test performance.</p>
        </div>
      </header>

      <section className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
        <div className="flex items-center justify-between mb-stack-md border-b border-outline-variant/10 pb-4">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Your Queue</h2>
          <span className="font-label-md text-label-md text-on-primary bg-primary px-3 py-1.5 rounded-full uppercase tracking-widest">{revisionPlan.length} Topics</span>
        </div>
        
        <div className="flex flex-col gap-y-4 pt-4">
          {revisionPlan.map((plan) => (
            <div key={plan.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface rounded-xl hover:bg-surface-bright transition-colors border border-outline-variant/10 hover:border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[24px]">menu_book</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-on-surface font-medium mb-1">{plan.concepts.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-label-sm text-label-sm uppercase tracking-widest px-2 py-0.5 rounded-full ${plan.priority === 'High' ? 'bg-error-container text-on-error-container' : 'bg-surface-bright text-on-surface-variant'}`}>{plan.priority} Priority</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {plan.minutes} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center justify-end md:justify-start gap-4 pl-[72px] md:pl-0">
                <Link to={`/tutor?concept=${plan.concept_id}`} className="bg-surface-container-high hover:bg-primary text-on-surface hover:text-on-primary px-6 py-3 rounded-xl font-label-md tracking-widest uppercase transition-colors flex items-center gap-2">
                  Revise with AI <span className="material-symbols-outlined text-[18px]">psychology</span>
                </Link>
              </div>
            </div>
          ))}
          
          {revisionPlan.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4 opacity-20">celebration</span>
              <span className="font-headline-lg text-headline-lg text-on-surface mb-2">You're All Caught Up!</span>
              <span className="font-body-md text-body-md text-on-surface-variant">Your revision queue is empty. Keep up the great work in your courses.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
