import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const api = useApi();
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [revisionPlan, setRevisionPlan] = useState<any[]>([]);
  const [pulse, setPulse] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, revisionData, pulseData] = await Promise.all([
          api.get('/courses'),
          api.get('/revision/plan'),
          api.get('/confusion/pulse'),
        ]);
        setCourses(coursesData);
        setRevisionPlan(revisionData);
        setPulse(pulseData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    
    // Trigger SVG animation after mount
    setTimeout(() => {
      const circle = document.querySelector('circle.dash-circle') as SVGCircleElement;
      if(circle) {
        circle.style.strokeDashoffset = '60.288';
      }
    }, 500);
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-white/50">Loading dashboard data...</div>;

  const learningScore = 76; 
  const masteredCount = 12;
  const needsAttention = revisionPlan.length;

  return (
    <div className="page-shell">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-y-stack-sm relative">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">Student Dashboard</span>
          <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0">Welcome back, <br/>{user?.name.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-stack-sm bg-surface-container-high px-6 py-3 rounded-xl border border-outline-variant/20 shadow-md">
          <span className="material-symbols-outlined text-primary text-[28px]">workspace_premium</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Current Rank</span>
            <span className="font-body-md text-body-md text-on-surface-variant font-medium">Pro Scholar</span>
          </div>
        </div>
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10">
        
        {/* Left Column: Primary Metrics */}
        <div className="lg:col-span-4 flex flex-col gap-y-gutter">
          
          {/* Learning Score Card */}
          <section className="bg-surface-container rounded-2xl p-6 shadow-lg border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
            <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-stack-lg relative z-10">Cogniva Learning Score</h2>
            <div className="flex flex-col items-center justify-center relative z-10 mt-4 mb-8">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-surface-bright" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="8"></circle>
                  <circle className="text-primary drop-shadow-[0_0_8px_rgba(255,184,0,0.4)] dash-circle" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="251.2" strokeLinecap="round" strokeWidth="8" style={{transition: 'stroke-dashoffset 1.5s ease-out'}}></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-headline-xl text-headline-xl text-on-surface">{learningScore}<span className="text-[24px]">%</span></span>
                </div>
              </div>
              <div className="mt-stack-sm flex items-center gap-2 bg-surface-bright/50 px-4 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
                <span className="font-label-sm text-label-sm text-primary">+4% this week</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-stack-md pt-stack-md border-t border-outline-variant/10 relative z-10">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface">{masteredCount}</span>
                <span className="font-label-sm text-label-sm text-outline uppercase">Mastered</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-error">{needsAttention}</span>
                <span className="font-label-sm text-label-sm text-outline uppercase">Needs Attention</span>
              </div>
            </div>
          </section>

          {/* Recommended Next Action */}
          <section className="bg-primary-container text-on-primary-container rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="20" id="gridPattern" patternUnits="userSpaceOnUse" width="20">
                  <rect fill="none" height="20" width="20"></rect>
                  <circle cx="2" cy="2" fill="currentColor" r="1"></circle>
                </pattern>
              </defs>
              <rect fill="url(#gridPattern)" height="100%" width="100%"></rect>
            </svg>
            <div className="relative z-10 flex flex-col h-full justify-between gap-y-stack-md">
              <div>
                <div className="flex items-center gap-2 mb-stack-sm">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                  <span className="font-label-md text-label-md uppercase tracking-widest font-bold">Recommended Next</span>
                </div>
                {/* Find the highest priority concept */}
                {revisionPlan.length > 0 ? (
                  <>
                    <h3 className="font-headline-lg text-headline-lg m-0 leading-tight">{revisionPlan[0].concepts.name}</h3>
                    <p className="font-body-sm text-body-sm mt-2 opacity-90">Your recent test data suggests a conceptual gap in analyzing this concept.</p>
                  </>
                ) : (
                  <>
                     <h3 className="font-headline-lg text-headline-lg m-0 leading-tight">All Caught Up!</h3>
                     <p className="font-body-sm text-body-sm mt-2 opacity-90">You have no concepts in your revision queue right now.</p>
                  </>
                )}
              </div>
              
              {courses.length > 0 && (
                <Link to={`/course/${courses[0].id}`} className="mt-stack-sm self-start bg-on-primary-container text-primary-container px-6 py-3 rounded-xl font-label-md tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center gap-2 group-hover:gap-3">
                  Start Learning <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Plans and Activity */}
        <div className="lg:col-span-8 flex flex-col gap-y-gutter">
          
          {/* Clarity Plan */}
          <section className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
            <div className="flex items-center justify-between mb-stack-md">
              <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest">Today's Clarity Plan</h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant bg-surface-bright px-3 py-1 rounded-full">{revisionPlan.length} Focus Areas</span>
            </div>
            
            <div className="flex flex-col gap-y-4">
              {revisionPlan.map((plan) => (
                <div key={plan.id} className="group flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-surface-bright transition-colors border border-transparent hover:border-outline-variant/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">functions</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface font-medium">{plan.concepts.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{plan.priority} Priority • {plan.minutes} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-surface-bright"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-surface-bright"></div>
                    </div>
                    <Link to={`/tutor?concept=${plan.concept_id}`} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    </Link>
                  </div>
                </div>
              ))}
              
              {revisionPlan.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant">Your revision queue is empty!</div>
              )}
            </div>
          </section>

          {/* Confusion Signals & Analytics Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Confusion Log */}
            <section className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
              <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-stack-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                Recent Confusion Signals
              </h2>
              <div className="relative pl-4 border-l border-outline-variant/20 flex flex-col gap-y-6 mt-6">
                
                {pulse.slice(0, 3).map((sig, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-error border-[3px] border-surface-container box-content"></div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-error uppercase tracking-wider mb-1">Recent Signal</span>
                      <span className="font-body-md text-body-md text-on-surface">Struggled with {sig.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Status: {sig.status}</span>
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* AI Insights Graphic */}
            <section className="bg-surface-container rounded-2xl shadow-md border border-outline-variant/10 overflow-hidden relative min-h-[300px]">
              <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAv2nqOj8TTupeaSMID11befmiso_pT5HwMLTfGEYEzqDSF5hT4K7q2zdxQ8UIpjNtmHAj9OWlbPs1HRnZ35BUtm_oPiqzi_SJDtL85SBTFXjeyD0xskbhKvrRYYJdkVOhThdRrhvgdVwcQZedGJd0BfDmNbR-tIJcd1CTm9esPOmakl01aT2QDBdKX8yQ7MB1z1NINNNGz18NgPJwBR3TQOzLpqeFsV2awVA2fbmopVDKPjzszZykV')"}}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 right-0 z-10 flex flex-col">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-2 drop-shadow-md">AI Insights</span>
                <p className="font-body-md text-body-md text-on-surface font-medium drop-shadow-md">Your learning pattern shows high retention when combining visual diagrams with abstract theory.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
