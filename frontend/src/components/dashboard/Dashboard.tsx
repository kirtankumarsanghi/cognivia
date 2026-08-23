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

  const [mlRecommendation, setMlRecommendation] = useState<any>(null);
  
  const fetchMlRecommendation = useCallback(async () => {
    try {
      const response = await api.post('/ml/recommendation', { 
        studentId: user?.id || 'demo',
        current_concept: 'c1-con1',
        history: []
      });
      if (response && response.success) {
        setMlRecommendation(response);
      }
    } catch (err) {
      console.error('Failed to fetch ML recommendation:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-surface p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-2xl p-6 sm:p-8 max-w-md w-full text-center border border-error/20 mx-4 sm:mx-0"
        >
          <span className="material-symbols-outlined text-error text-[48px] mb-4">error</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Connection Error</h2>
          <p className="font-body-md text-on-surface-variant mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
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
            <Link
              to="/"
              onClick={() => {
                localStorage.removeItem('cogniva-session');
              }}
              className="bg-surface-variant text-on-surface-variant px-6 py-3 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Return to Login
            </Link>
          </div>
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
          className="mb-6 md:mb-8 p-4 md:p-6 bg-error/10 border border-error/20 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="flex items-start md:items-center gap-3 md:gap-4 relative z-10 w-full md:w-auto">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-error/20 flex items-center justify-center border border-error/30 shrink-0">
              <span className="material-symbols-outlined text-error text-[20px] md:text-[24px]">school</span>
            </div>
            <div className="flex-1">
              <h3 className="font-headline-sm text-error m-0 text-base md:text-lg">Educator Intervention</h3>
              <p className="font-body-sm text-on-surface/90 mt-1 text-sm">{notif.message}</p>
              {notif.topic && <p className="font-label-sm text-outline uppercase tracking-wider mt-2 text-xs">Targeted Topic: {notif.topic}</p>}
            </div>
          </div>
          <div className="flex flex-row md:flex-row items-center gap-2 md:gap-3 relative z-10 w-full md:w-auto">
            <button 
              onClick={async () => {
                await api.post(`/notifications/${notif.id}/read`, {});
                loadData();
              }}
              className="flex-1 md:flex-none px-4 py-2 bg-surface-container border border-outline-variant/10 text-on-surface rounded-xl font-label-sm uppercase hover:bg-surface-bright active:bg-surface-bright transition-colors text-xs"
            >
              Dismiss
            </button>
            <Link 
              to="/revision" 
              className="flex-1 md:flex-none px-4 py-2 bg-error text-on-error rounded-xl font-label-sm uppercase shadow-[0_0_15px_rgba(255,94,94,0.3)] hover:opacity-90 active:opacity-90 transition-opacity flex items-center justify-center gap-2 text-xs"
            >
              View Study Guide <span className="material-symbols-outlined text-[16px] md:text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </motion.div>
      ))}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-y-stack-sm relative mb-6 md:mb-8">
        <motion.div variants={fadeUp(0)} initial="hidden" animate="visible" className="flex flex-col">
          <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">Student Dashboard</span>
          <h1 className="font-headline-lg md:font-headline-xl text-2xl md:text-3xl leading-tight md:text-headline-xl text-on-background m-0">
            Welcome back, <br className="hidden sm:block"/>{user?.name.split(' ')[0]}
          </h1>
        </motion.div>
        
        <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible" className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
          {/* Refresh Button */}
          <motion.button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-surface-container hover:bg-surface-container-high active:bg-surface-container-high rounded-xl border border-outline-variant/20 transition-all disabled:opacity-50 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="material-symbols-outlined text-on-surface-variant text-[18px] md:text-[20px]"
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
            >
              refresh
            </motion.span>
            <span className="font-label-sm text-on-surface-variant hidden sm:inline">
              {refreshing ? 'Updating...' : 'Refresh'}
            </span>
          </motion.button>
          
          {/* Rank Badge */}
          <div className="flex items-center gap-2 md:gap-stack-sm bg-surface-container-high px-4 md:px-6 py-2 md:py-3 rounded-xl border border-outline-variant/20 shadow-md flex-1 md:flex-none">
            <span className="material-symbols-outlined text-primary text-[24px] md:text-[28px]">workspace_premium</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest text-[10px] md:text-xs">Current Rank</span>
              <span className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface-variant font-medium">{analytics.rank}</span>
            </div>
          </div>
        </motion.div>
        
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none hidden md:block"></div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-gutter relative z-10">
        
        {/* Left Column: Primary Metrics */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-y-gutter">
          
          {/* Learning Score Card */}
          <motion.section variants={fadeUp(0.1)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-4 md:p-6 shadow-lg border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
            <h2 className="font-label-sm md:font-label-md text-label-sm md:text-label-md text-outline uppercase tracking-widest mb-4 md:mb-stack-lg relative z-10">Cogniva Learning Score</h2>
            <div className="flex flex-col items-center justify-center relative z-10 mt-2 md:mt-4 mb-4 md:mb-8">
              <div className="relative w-36 h-36 md:w-48 md:h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2AD4AE" />
                      <stop offset="100%" stopColor="#2A9DD4" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle className="text-surface-bright" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="8"></circle>
                  <motion.circle
                    stroke="url(#scoreGradient)"
                    filter="url(#glow)"
                    cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2"
                    strokeLinecap="round" strokeWidth="8"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * (analytics.learningScore || 0)) / 100 }}
                    transition={{ duration: 1.5, ease: premiumEase, delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-headline-lg md:font-headline-xl text-headline-lg md:text-headline-xl text-transparent bg-clip-text bg-gradient-to-br from-[#2AD4AE] to-[#2A9DD4]">
                    <AnimatedNumber value={analytics.learningScore || 0} duration={1.5} /><span className="text-[18px] md:text-[24px]">%</span>
                  </span>
                </div>
              </div>
              <div className="mt-2 md:mt-stack-sm flex items-center gap-2 bg-surface-bright/50 px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[14px] md:text-[16px] text-primary">trending_up</span>
                <span className="font-label-sm text-label-sm text-primary text-xs md:text-sm">+{analytics.weeklyChange}% this week</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-stack-md pt-3 md:pt-stack-md border-t border-outline-variant/10 relative z-10">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface"><AnimatedNumber value={analytics.masteredCount} /></span>
                <span className="font-label-sm text-label-sm text-outline uppercase text-[10px] md:text-xs">Mastered</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-error"><AnimatedNumber value={analytics.needsAttentionCount} /></span>
                <span className="font-label-sm text-label-sm text-outline uppercase text-[10px] md:text-xs">Needs Attention</span>
              </div>
            </div>
          </motion.section>

          {/* Learning Streak */}
          <motion.section variants={fadeUp(0.15)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-4 md:p-6 shadow-md border border-outline-variant/10">
            <h2 className="font-label-sm md:font-label-md text-label-sm md:text-label-md text-outline uppercase tracking-widest mb-3 md:mb-stack-md">Learning Streak</h2>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px] md:text-[32px]">local_fire_department</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface">{analytics.streak} days</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Keep it going!</span>
              </div>
            </div>
          </motion.section>

          {/* Recommended Next Action */}
          <motion.section variants={fadeUp(0.2)} initial="hidden" animate="visible" className="bg-primary-container text-on-primary-container rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="20" id="gridPattern" patternUnits="userSpaceOnUse" width="20">
                  <rect fill="none" height="20" width="20"></rect>
                  <circle cx="2" cy="2" fill="currentColor" r="1"></circle>
                </pattern>
              </defs>
              <rect fill="url(#gridPattern)" height="100%" width="100%"></rect>
            </svg>
            <div className="relative z-10 flex flex-col h-full justify-between gap-3 md:gap-y-stack-md">
              <div>
                <div className="flex items-center gap-2 mb-2 md:mb-stack-sm">
                  <span className="material-symbols-outlined text-[16px] md:text-[18px]">psychology</span>
                  <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md uppercase tracking-widest font-bold">Recommended Next</span>
                </div>
                <h3 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg m-0 leading-tight">{analytics.recommendedNext}</h3>
                {analytics.needsAttentionCount > 0 && (
                  <p className="font-body-sm text-body-sm mt-2 opacity-90 text-sm">Focus on strengthening your foundation in this area.</p>
                )}
              </div>
              
              {analytics.revisionPlan && analytics.revisionPlan.length > 0 && (
                <Link to={`/tutor?concept=${analytics.revisionPlan[0].concept_id}`} className="mt-2 md:mt-stack-sm self-start bg-on-primary-container text-primary-container px-4 md:px-6 py-2 md:py-3 rounded-xl font-label-sm md:font-label-md tracking-widest uppercase hover:opacity-90 active:opacity-90 transition-opacity flex items-center gap-2 text-xs md:text-sm group-hover:gap-3">
                  Start Learning <span className="material-symbols-outlined text-[16px] md:text-[18px]">arrow_forward</span>
                </Link>
              )}
            </div>
          </motion.section>

          {/* ML Insights Link Card */}
          <motion.section variants={fadeUp(0.25)} initial="hidden" animate="visible">
            <Link to="/ml-insights" className="block rounded-2xl overflow-hidden relative group transition-all duration-300 hover:shadow-[0_0_30px_rgba(42,212,174,0.15)] hover:-translate-y-1" style={{ background: 'linear-gradient(145deg, #0D1117 0%, #161B22 100%)', border: '1px solid rgba(42,212,174,0.3)' }}>
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-700" style={{ background: 'rgba(42,212,174,0.15)' }} />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-700" style={{ background: 'rgba(42,157,212,0.1)' }} />
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(42,212,174,0.15)', border: '1px solid rgba(42,212,174,0.4)', boxShadow: '0 0 15px rgba(42,212,174,0.2) inset' }}>
                      <span className="material-symbols-outlined text-[24px]" style={{ color: '#2AD4AE' }}>memory</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">ML Insights Lab</h3>
                      <p className="text-xs text-gray-400 mt-1">6 models analyzing your learning</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#2AD4AE]/20 transition-colors">
                    <span className="material-symbols-outlined text-gray-500 group-hover:text-[#2AD4AE] transition-colors text-[18px]">arrow_forward</span>
                  </div>
                </div>
                
                {/* Quick ML Status Preview */}
                {profile && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-sm" style={{ color: '#2AD4AE' }}>psychology</span>
                      <span className="text-gray-400">Profile:</span>
                      <span className="text-white font-bold">{profile.cluster}</span>
                    </div>
                  </div>
                )}
                
                {!profile && !loadingProfile && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      fetchProfile();
                      fetchMlRecommendation();
                    }}
                    className="mt-3 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Click to analyze</span>
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                )}
                
                {loadingProfile && (
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.section>

        </div>

        {/* Right Column: Plans and Activity */}
        <div className="lg:col-span-8 flex flex-col gap-4 md:gap-y-gutter">
          
          {/* Clarity Plan */}
          <motion.section variants={fadeUp(0.3)} initial="hidden" animate="visible" className="bg-surface-container rounded-2xl p-4 md:p-6 shadow-md border border-outline-variant/10">
            <div className="flex items-center justify-between mb-3 md:mb-stack-md">
              <h2 className="font-label-sm md:font-label-md text-label-sm md:text-label-md text-outline uppercase tracking-widest">Today's Clarity Plan</h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant bg-surface-bright px-2 md:px-3 py-1 rounded-full text-xs">
                {analytics.revisionPlan.length} Focus Areas
              </span>
            </div>
            
            <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="visible" className="flex flex-col gap-3 md:gap-y-4">
              {analytics.revisionPlan.map((plan: any) => (
                <motion.div variants={fadeUpChild} key={plan.id || plan.concept_id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-surface rounded-xl hover:bg-surface-container-high active:bg-surface-container-high transition-all duration-300 border border-outline-variant/10 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(232,166,52,0.15)] relative overflow-hidden gap-3 md:gap-0">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors"></div>
                  <div className="flex items-start md:items-center gap-3 md:gap-4 pl-2 w-full md:w-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-bright flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-transparent group-hover:border-primary/30 shrink-0">
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px] md:text-[24px]">functions</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-body-sm md:font-body-md text-body-sm md:text-body-md text-on-surface font-medium">{plan.concept_name || (plan.concepts && plan.concepts.name) || 'Concept'}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[9px] md:text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${plan.priority === 'High' ? 'bg-error/20 text-error' : plan.priority === 'Medium' ? 'bg-[#E8A634]/20 text-[#E8A634]' : 'bg-primary/20 text-primary'}`}>
                          {plan.priority} Priority
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 text-xs">
                          <span className="material-symbols-outlined text-[12px] md:text-[14px]">schedule</span> {plan.minutes || 15} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                    <button 
                      onClick={async (e) => {
                        e.preventDefault();
                        if (plan.id) await api.post(`/revision/${plan.id}/complete`, {});
                        loadData();
                      }}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-surface-container rounded-lg hover:bg-[#3DD68C]/20 active:bg-[#3DD68C]/20 hover:text-[#3DD68C] text-on-surface transition-colors font-label-sm border border-outline-variant/10 hover:border-[#3DD68C]/30 flex items-center justify-center gap-2 text-xs"
                    >
                      <span className="material-symbols-outlined text-[14px] md:text-[16px]">check</span> Complete
                    </button>
                    <Link to={`/tutor?concept=${plan.concept_id}`} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-container border border-outline-variant/10 flex items-center justify-center text-on-surface hover:text-primary hover:bg-primary/20 active:bg-primary/20 hover:border-primary/30 transition-all hover:scale-110 hover:shadow-[0_0_10px_rgba(232,166,52,0.3)] shrink-0">
                      <span className="material-symbols-outlined text-[20px] md:text-[22px]">play_arrow</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
              
              {analytics.revisionPlan.length === 0 && (
                <div className="p-6 md:p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[40px] md:text-[48px] opacity-20 mb-2">check_circle</span>
                  <p className="font-body-sm md:font-body-md text-sm">Your revision queue is empty! Great work!</p>
                </div>
              )}
            </motion.div>
          </motion.section>

          {/* Confusion Signals & Weekly Progress Split */}
          <motion.div variants={fadeUp(0.4)} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-gutter">
            {/* Confusion Log */}
            <section className="bg-surface-container rounded-2xl p-4 md:p-6 shadow-md border border-outline-variant/10">
              <h2 className="font-label-sm md:font-label-md text-label-sm md:text-label-md text-outline uppercase tracking-widest mb-3 md:mb-stack-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                Recent Confusion Signals
              </h2>
              <div className="relative pl-3 md:pl-4 border-l border-outline-variant/20 flex flex-col gap-4 md:gap-y-6 mt-4 md:mt-6">
                
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
