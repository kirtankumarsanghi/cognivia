import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild, premiumEase } from '../../utils/animation';
import Loading from '../ui/Loading';
import ConfusionButton from './ConfusionButton';
import ConceptGraph from '../concepts/ConceptGraph';
import ProgressTracker from './ProgressTracker';
import AIStudyAssistant from './AIStudyAssistant';
import { useMemo } from 'react';

const AnimatedNumber = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <>{displayValue}</>;
};

export default function Dashboard() {
  const api = useApi();
  const { user } = useAuth();
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [pulse, setPulse] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Compute a real flat list of concepts from the courses to power the knowledge graph
  const graphConcepts = useMemo(() => {
    return courses.flatMap(course => 
      (course.lessons || []).flatMap((lesson: any) => 
        (lesson.concepts || []).map((concept: any, index: number, arr: any[]) => ({
          ...concept,
          // Link to the previous concept in the lesson for a logical learning path
          prerequisites: index > 0 ? [{ id: arr[index - 1].id }] : []
        }))
      )
    );
  }, [courses]);

  const loadData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const [analyticsData, coursesData, pulseData, notifData] = await Promise.all([
        api.get('/analytics/student'),
        api.get('/courses'),
        api.get('/confusion/pulse'),
        api.get('/notifications'),
      ]);
      
      setAnalytics(analyticsData);
      setCourses(coursesData);
      setPulse(pulseData);
      setNotifications(notifData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const features = {
        avg_practice_accuracy: 0.65,
        avg_confusion_frequency: 0.2,
        session_frequency: 4,
        revision_completion: 0.8,
        tutor_usage: 2,
        avg_mastery_progression: 0.7,
        total_practice_attempts: 12
      }; // Example features as dictionary
      const response = await api.post('/ml/student-profile', { studentId: user?.id || 'demo', features });
      if (response && response.success) {
        setProfile(response);
      }
    } catch (err) {
      console.error('Failed to fetch ML profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [api, user]);

  useEffect(() => {
    loadData();
    fetchProfile();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadData, fetchProfile]);

  if (loading) return <Loading variant="dashboard" />;
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-2xl p-8 max-w-md w-full text-center border border-error/20"
        >
          <span className="material-symbols-outlined text-error text-[48px] mb-4">error</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Connection Error</h2>
          <p className="font-body-md text-on-surface-variant mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              loadData();
            }}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }
  
  if (!analytics) return <div>Error loading dashboard</div>;

  return (
    <div className="page-shell">
      {/* Confusion Button - Fixed Position */}
      <ConfusionButton onSignalCreated={loadData} />

      {/* AI Study Assistant - Floating */}
      <AIStudyAssistant />

      {/* Intervention Banner */}
      {notifications.filter(n => !n.read && n.type === 'intervention').map(notif => (
        <motion.div 
          key={notif.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          className="mb-8 p-4 bg-error/10 border border-error/20 rounded-2xl relative overflow-hidden flex items-center justify-between"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-error/20 flex items-center justify-center border border-error/30 shrink-0">
              <span className="material-symbols-outlined text-error text-[24px]">school</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-error m-0">Educator Intervention</h3>
              <p className="font-body-sm text-on-surface/90 mt-1">{notif.message}</p>
              {notif.topic && <p className="font-label-sm text-outline uppercase tracking-wider mt-2">Targeted Topic: {notif.topic}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10 shrink-0 ml-4">
            <button 
              onClick={async () => {
                await api.post(`/notifications/${notif.id}/read`, {});
                loadData();
              }}
              className="px-4 py-2 bg-surface-container border border-outline-variant/10 text-on-surface rounded-xl font-label-sm uppercase hover:bg-surface-bright transition-colors"
            >
              Dismiss
            </button>
            <Link 
              to="/revision" 
              className="px-4 py-2 bg-error text-on-error rounded-xl font-label-sm uppercase shadow-[0_0_15px_rgba(255,94,94,0.3)] hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              View Study Guide <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </motion.div>
      ))}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-y-stack-sm relative mb-8">
        <motion.div variants={fadeUp(0)} initial="hidden" animate="visible" className="flex flex-col">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">Student Dashboard</span>
          <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0">
            Welcome back, <br/>{user?.name.split(' ')[0]}
          </h1>
        </motion.div>
        
        <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible" className="flex items-center gap-4">
          {/* Refresh Button */}
          <motion.button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl border border-outline-variant/20 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="material-symbols-outlined text-on-surface-variant text-[20px]"
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
            >
              refresh
            </motion.span>
            <span className="font-label-sm text-on-surface-variant">
              {refreshing ? 'Updating...' : 'Refresh'}
            </span>
          </motion.button>
          
          {/* Rank Badge */}
          <div className="flex items-center gap-stack-sm bg-surface-container-high px-6 py-3 rounded-xl border border-outline-variant/20 shadow-md">
            <span className="material-symbols-outlined text-primary text-[28px]">workspace_premium</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Current Rank</span>
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">{analytics.rank}</span>
            </div>
          </div>
        </motion.div>
        
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10">
        
        {/* Left Column: Primary Metrics */}
        <div className="lg:col-span-4 flex flex-col gap-y-gutter">
          
          {/* Learning Score Card */}
          <motion.section variants={fadeUp(0.1)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-6 shadow-lg border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
            <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-stack-lg relative z-10">Cogniva Learning Score</h2>
            <div className="flex flex-col items-center justify-center relative z-10 mt-4 mb-8">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-surface-bright" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="8"></circle>
                  <motion.circle
                    className="text-primary drop-shadow-[0_0_8px_rgba(232,166,52,0.4)]"
                    cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2"
                    strokeLinecap="round" strokeWidth="8"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * analytics.learningScore) / 100 }}
                    transition={{ duration: 1.5, ease: premiumEase, delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-headline-xl text-headline-xl text-on-surface">
                    <AnimatedNumber value={analytics.learningScore} duration={1.5} /><span className="text-[24px]">%</span>
                  </span>
                </div>
              </div>
              <div className="mt-stack-sm flex items-center gap-2 bg-surface-bright/50 px-4 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span>
                <span className="font-label-sm text-label-sm text-primary">+{analytics.weeklyChange}% this week</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-stack-md pt-stack-md border-t border-outline-variant/10 relative z-10">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface"><AnimatedNumber value={analytics.masteredCount} /></span>
                <span className="font-label-sm text-label-sm text-outline uppercase">Mastered</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-error"><AnimatedNumber value={analytics.needsAttentionCount} /></span>
                <span className="font-label-sm text-label-sm text-outline uppercase">Needs Attention</span>
              </div>
            </div>
          </motion.section>

          {/* Learning Streak */}
          <motion.section variants={fadeUp(0.15)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
            <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-stack-md">Learning Streak</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px]">local_fire_department</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-lg text-headline-lg text-on-surface">{analytics.streak} days</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Keep it going!</span>
              </div>
            </div>
          </motion.section>

          {/* Recommended Next Action */}
          <motion.section variants={fadeUp(0.2)} initial="hidden" animate="visible" className="bg-primary-container text-on-primary-container rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
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
                <h3 className="font-headline-lg text-headline-lg m-0 leading-tight">{analytics.recommendedNext}</h3>
                {analytics.needsAttentionCount > 0 && (
                  <p className="font-body-sm text-body-sm mt-2 opacity-90">Focus on strengthening your foundation in this area.</p>
                )}
              </div>
              
              {analytics.revisionPlan && analytics.revisionPlan.length > 0 && (
                <Link to={`/tutor?concept=${analytics.revisionPlan[0].concept_id}`} className="mt-stack-sm self-start bg-on-primary-container text-primary-container px-6 py-3 rounded-xl font-label-md tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center gap-2 group-hover:gap-3">
                  Start Learning <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              )}
            </div>
          </motion.section>

          {/* Cognitive Profile */}
          <motion.section variants={fadeUp(0.25)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
            <div className="flex justify-between items-start mb-stack-md">
              <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">psychology</span> Cognitive Profile
              </h2>
              <button 
                onClick={fetchProfile}
                disabled={loadingProfile}
                className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-label-sm uppercase hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {loadingProfile ? 'Analyzing...' : 'Generate'}
              </button>
            </div>
            
            {!profile ? (
              <div className="text-center py-4 opacity-70">
                <p className="font-body-sm">Click Generate to run ML analysis on your learning pattern.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      {profile.cluster === 'Struggling' ? 'warning' : profile.cluster === 'Advanced' ? 'rocket_launch' : 'pace'}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-sm text-outline uppercase tracking-widest block mb-1">Learning Pattern</span>
                    <span className="font-headline-md text-on-surface">{profile.cluster}</span>
                  </div>
                </div>
                
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/10">
                  <div className="flex justify-between mb-2">
                    <span className="font-body-sm text-on-surface-variant">Model Confidence</span>
                    <span className="font-label-sm text-primary">{(profile.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-bright rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${profile.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.section>

        </div>

        {/* Right Column: Plans and Activity */}
        <div className="lg:col-span-8 flex flex-col gap-y-gutter">
          
          {/* Clarity Plan */}
          <motion.section variants={fadeUp(0.3)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
            <div className="flex items-center justify-between mb-stack-md">
              <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest">Today's Clarity Plan</h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant bg-surface-bright px-3 py-1 rounded-full">
                {analytics.revisionPlan.length} Focus Areas
              </span>
            </div>
            
            <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="visible" className="flex flex-col gap-y-4">
              {analytics.revisionPlan.map((plan: any) => (
                <motion.div variants={fadeUpChild} key={plan.id} className="group flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-surface-bright transition-colors border border-transparent hover:border-outline-variant/20">
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
                    <button 
                      onClick={async () => {
                        await api.post(`/revision/${plan.id}/complete`, {});
                        loadData();
                      }}
                      className="px-4 py-2 bg-surface-container rounded-lg hover:bg-primary/20 hover:text-primary text-on-surface transition-colors font-label-sm border border-outline-variant/10 hover:border-primary/30"
                    >
                      Complete
                    </button>
                    <Link to={`/tutor?concept=${plan.concept_id}`} className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant/10 flex items-center justify-center text-on-surface hover:text-primary hover:bg-primary/20 hover:border-primary/30 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
              
              {analytics.revisionPlan.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] opacity-20 mb-2">check_circle</span>
                  <p className="font-body-md">Your revision queue is empty! Great work!</p>
                </div>
              )}
            </motion.div>
          </motion.section>

          {/* Confusion Signals & Weekly Progress Split */}
          <motion.div variants={fadeUp(0.4)} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Confusion Log */}
            <section className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
              <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-stack-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                Recent Confusion Signals
              </h2>
              <div className="relative pl-4 border-l border-outline-variant/20 flex flex-col gap-y-6 mt-6">
                
                {pulse.slice(0, 3).map((sig, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-[3px] border-surface-container box-content ${
                      sig.status === 'HIGH' ? 'bg-error' : sig.status === 'MEDIUM' ? 'bg-[#E8A634]' : 'bg-[#3DD68C]'
                    }`}></div>
                    <div className="flex flex-col">
                      <span className={`font-label-sm text-label-sm uppercase tracking-wider mb-1 ${
                        sig.status === 'HIGH' ? 'text-error' : sig.status === 'MEDIUM' ? 'text-[#E8A634]' : 'text-[#3DD68C]'
                      }`}>
                        {sig.status} Confusion
                      </span>
                      <span className="font-body-md text-body-md text-on-surface">{sig.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">{sig.confusion_percentage}% confusion rate</span>
                    </div>
                  </div>
                ))}

                {pulse.length === 0 && (
                  <div className="py-4 text-center text-on-surface-variant">
                    <p className="font-body-sm">No confusion signals yet.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Enhanced Progress Tracker */}
            <ProgressTracker 
              weeklySessionCount={analytics.weeklySessionCount}
              practiceAccuracy={analytics.practiceAccuracy}
              masteredCount={analytics.masteredCount}
              streak={analytics.streak}
              weeklyChange={analytics.weeklyChange}
            />
          </motion.div>

          {/* Notifications */}
          {notifications.filter(n => !n.read).length > 0 && (
            <motion.section variants={fadeUp(0.5)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
              <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-stack-md">Notifications</h2>
              <div className="flex flex-col gap-3">
                {notifications.filter(n => !n.read).slice(0, 3).map((notif: any) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 bg-surface rounded-lg hover:bg-surface-bright transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">notifications</span>
                    <div className="flex-1">
                      <p className="font-body-sm text-body-sm text-on-surface">{notif.message}</p>
                      <span className="font-body-xs text-on-surface-variant text-xs">{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={async () => {
                        await api.post(`/notifications/${notif.id}/read`, {});
                        loadData();
                      }}
                      className="text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Concept Knowledge Graph */}
          <motion.section variants={fadeUp(0.6)} initial="hidden" animate="visible" className="lg:col-span-12">
            <div className="h-[700px]">
              <ConceptGraph concepts={graphConcepts.length > 0 ? graphConcepts : undefined} />
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
