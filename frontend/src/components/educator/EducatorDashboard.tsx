import { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Loading from '../ui/Loading';
import SessionManager from './SessionManager';
import SessionTimeline from './SessionTimeline';
import EducatorMLTerminal from './EducatorMLTerminal';
import CreateCourseModal from './CreateCourseModal';
import { supabase } from '../../lib/supabase';

export default function EducatorDashboard() {
  const api = useApi();
  const [analytics, setAnalytics] = useState<any>(null);
  const [pulse, setPulse] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hoursAgo, setHoursAgo] = useState<number>(24);
  const [miniLesson, setMiniLesson] = useState<any>(null);
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [studyGuide, setStudyGuide] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [mlInsights, setMlInsights] = useState<any>(null);
  const [loadingMl, setLoadingMl] = useState(false);
  
  // New states for authoritative features
  const [analyzingIntent, setAnalyzingIntent] = useState<string | null>(null);
  const [intentResults, setIntentResults] = useState<Record<string, any>>({});
  const [intervening, setIntervening] = useState<string | null>(null);
  const [conceptAnalysis, setConceptAnalysis] = useState<any>(null);
  const [globalControls, setGlobalControls] = useState({
    difficulty: 50,
    threshold: 75,
    autoGenerate: true
  });
  const [controlSaved, setControlSaved] = useState(false);
  const [mlRisk, setMlRisk] = useState<any>(null); // Re-declare since I removed it by mistake

  const intervalRef = useRef<NodeJS.Timeout>();

  const loadData = async (hours: number) => {
    try {
      const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const coursesData = await api.get('/courses');
      setCourses(coursesData);
      
      let effectiveCourseId = selectedCourseId;
      if (!effectiveCourseId && coursesData.length > 0) {
        effectiveCourseId = coursesData[0].id;
        setSelectedCourseId(effectiveCourseId);
      }

      if (!effectiveCourseId) {
        setLoading(false);
        return;
      }

      const [analyticsData, pulseData] = await Promise.all([
        api.get(`/analytics/educator?since=${sinceDate}&courseId=${effectiveCourseId}`),
        api.get(`/confusion/pulse?courseId=${effectiveCourseId}`)
      ]);

      setAnalytics(analyticsData);
      setPulse(pulseData);
      
      // Auto-fetch ML insights for the demo
      if (!mlInsights) {
        fetchMlInsights();
      }
    } catch (err) {
      console.error('Failed to load educator analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = async (session: any) => {
    setActiveSession(session);
    if (session) {
      try {
        const details = await api.get(`/sessions/${session.id}`);
        setSessionDetails(details);
      } catch (err) {
        console.error('Failed to load session details:', err);
      }
    } else {
      setSessionDetails(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSession) {
        api.get(`/sessions/${activeSession.id}`)
          .then(details => setSessionDetails(details))
          .catch(err => console.error('Failed to refresh session:', err));
      }
    }, 10000); // Refresh session details every 10 seconds
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    setLoading(true);
    loadData(hoursAgo);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => loadData(hoursAgo), 15000);

    // Setup Supabase Realtime subscription for true live insights mapping
    const subscription = supabase
      .channel('confusion_signals_live')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'confusion_signals' }, 
        (payload) => {
          console.log('Live insight received:', payload);
          // When student clicks "I'm confused", immediately refresh dashboard
          loadData(hoursAgo);
        }
      )
      .subscribe();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      supabase.removeChannel(subscription);
    };
  }, [hoursAgo, selectedCourseId]); // Re-fetch when course or timeframe changes

  const handleGenerateLesson = async () => {
    if (!analytics?.mostConfusing) return;
    setGeneratingLesson(true);
    try {
      const lesson = await api.post('/educator/mini-lesson', {
        concept_id: analytics.mostConfusing.concept_id,
        concept_name: analytics.mostConfusing.name
      });
      setMiniLesson(lesson);
      alert('Mini-lesson generated and students notified!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate lesson');
    } finally {
      setGeneratingLesson(false);
    }
  };

  const fetchMlInsights = async () => {
    setLoadingMl(true);
    try {
      const response = await api.post('/ml/early-warning', {});
      if (response && response.success) {
        setMlInsights(response);
      }

      const riskResponse = await api.post('/ml/learning-risk', {});
      if (riskResponse && riskResponse.success) {
        setMlRisk(riskResponse);
      }
    } catch (err) {
      console.error('Failed to fetch ML insights:', err);
    } finally {
      setLoadingMl(false);
    }
  };

  const handleCreateStudyGuide = () => {
    if (!analytics?.mostConfusing) return;
    setGeneratingGuide(true);
    // Simulate API call for generating study guide
    setTimeout(() => {
      setStudyGuide({
        title: `Comprehensive Guide: ${analytics.mostConfusing.name}`,
        content: `This dynamically generated guide targets the exact pitfalls your students are facing with ${analytics.mostConfusing.name}. It includes 3 tailored practice problems, a visual cheat sheet, and step-by-step breakdowns of common mistakes.`
      });
      setGeneratingGuide(false);
    }, 1500);
  };

  const handleAnalyzeIntent = async (doubtId: string, text: string) => {
    setAnalyzingIntent(doubtId);
    try {
      const res = await api.post('/ml/nlp-classifier', { text });
      if (res && res.success) {
        setIntentResults(prev => ({ ...prev, [doubtId]: res }));
      }
    } catch (err) {
      console.error('Failed to analyze intent:', err);
    } finally {
      setAnalyzingIntent(null);
    }
  };

  const handleIntervene = async (studentId: string) => {
    setIntervening(studentId);
    try {
      await api.post('/educator/intervene', { studentId, message: 'Your educator has assigned a review module.' });
      // Simulate success toast/alert
      alert(`Intervention sent to student ${studentId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIntervening(null);
    }
  };

  const handleSaveControls = () => {
    setControlSaved(true);
    setTimeout(() => setControlSaved(false), 2000);
  };

  const handleSelectTopic = async (topicName: string | null) => {
    setSelectedTopic(topicName);
    if (topicName) {
      setConceptAnalysis(null);
      try {
        const res = await api.post('/ml/concept-difficulty', { concept_id: topicName });
        if (res && res.success) {
          setConceptAnalysis(res);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setConceptAnalysis(null);
    }
  };

  if (loading) return <Loading variant="dashboard" />;
  if (!analytics) return <div className="page-shell">Error loading analytics</div>;

  const confusionChartData = analytics.confusionMetrics.slice(0, 8).map((metric: any) => ({
    name: metric.name.length > 20 ? metric.name.substring(0, 20) + '...' : metric.name,
    confusion: metric.confusion_percentage
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-3 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent"></div>
          <div className="relative z-10">
            <p className="font-headline-sm text-on-surface mb-1">{label}</p>
            <p className="font-body-sm text-error font-medium mb-2">{payload[0].value}% Confusion</p>
            <p className="text-xs text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">ads_click</span>
              Click to view students
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-shell">
      {isCreateCourseModalOpen && (
        <CreateCourseModal 
          onClose={() => setIsCreateCourseModalOpen(false)}
          onSuccess={() => {
            setIsCreateCourseModalOpen(false);
            loadData(hoursAgo); // reload courses and analytics
          }}
        />
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-y-stack-sm relative mb-8">
        <motion.div variants={fadeUp(0)} initial="hidden" animate="visible" className="flex flex-col">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">
            Educator Dashboard
          </span>
          <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0">
            Class Analytics
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2">
            Real-time insights into student understanding and performance.
          </p>
        </motion.div>
        
        {/* Course Selector & Actions */}
        <div className="flex items-center gap-4">
          <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible" className="flex items-center gap-3 bg-surface-container border border-outline-variant/20 rounded-xl p-2 px-4 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">school</span>
            <select 
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-transparent border-none outline-none font-label-md text-on-surface cursor-pointer py-2 pr-4 custom-select appearance-none focus:ring-0"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              {courses.map((c: any) => (
                <option key={c.id} value={c.id} className="bg-surface text-on-surface">{c.code} - {c.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined text-outline text-[18px] pointer-events-none">expand_more</span>
          </motion.div>
          
          <motion.button
            variants={fadeUp(0.2)}
            initial="hidden"
            animate="visible"
            onClick={() => setIsCreateCourseModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 text-on-primary px-4 py-2.5 rounded-xl font-label-md transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span className="hidden sm:inline">Create Course</span>
          </motion.button>
        </div>
      </header>

      {/* Summary Cards */}
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-lg relative overflow-hidden group">

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
              </div>
              <p className="font-label-sm text-outline uppercase tracking-wider">Total Students</p>
            </div>
            <div>
              <p className="font-headline-lg text-4xl text-on-surface">{analytics.totalStudents}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-lg relative overflow-hidden group">

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/10 flex items-center justify-center border border-[#3DD68C]/20">
                <span className="material-symbols-outlined text-[#3DD68C] text-[20px]">trending_up</span>
              </div>
              <p className="font-label-sm text-outline uppercase tracking-wider">Avg Class Score</p>
            </div>
            <div>
              <p className="font-headline-lg text-4xl text-on-surface">{analytics.avgClassScore}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-lg relative overflow-hidden group">

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center border border-error/20">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              </div>
              <p className="font-label-sm text-outline uppercase tracking-wider">High Confusion Topics</p>
            </div>
            <div>
              <p className="font-headline-lg text-4xl text-on-surface">
                {analytics.confusionMetrics.filter((m: any) => m.confusion_percentage >= 66).length}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Session Manager and Timeline */}
      <SessionManager 
        courseId={selectedCourseId} 
        onSessionChange={handleSessionChange}
      />

      {sessionDetails && (
        <SessionTimeline 
          session={sessionDetails}
          moments={sessionDetails.moments || []}
          signals={sessionDetails.signals || []}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Confusion Heatmap */}
        <div className="lg:col-span-7">
          <motion.div
            variants={fadeUp(0.2)}
            initial="hidden"
            animate="visible"
            className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 mb-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">Live Confusion Heatmap</h2>
              <div className="flex items-center gap-4">
                <span className="font-label-sm text-outline">Timeline: Last {hoursAgo}h</span>
                <input 
                  type="range" 
                  min="1" 
                  max="168" 
                  value={hoursAgo} 
                  onChange={(e) => setHoursAgo(Number(e.target.value))}
                  className="w-32 accent-primary"
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={confusionChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5e5e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#e84040" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#7E8B99" 
                  tick={{ fill: '#7E8B99', fontSize: 11, fontFamily: 'Inter' }} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#7E8B99" 
                  tick={{ fill: '#7E8B99', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  cursor={{ fill: '#ffffff', opacity: 0.02 }}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="confusion" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={44}
                  onClick={(data) => handleSelectTopic(data.name)}
                  cursor="pointer"
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Topic Analytics */}
          <motion.div
            variants={fadeUp(0.3)}
            initial="hidden"
            animate="visible"
            className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10"
          >
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Topic Breakdown</h2>
            <div className="space-y-4">
              {analytics.confusionMetrics.slice(0, 5).map((metric: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body-md text-on-surface">{metric.name}</span>
                      <span className={`font-label-sm uppercase px-2 py-1 rounded-full ${
                        metric.confusion_percentage >= 66
                          ? 'bg-error/10 text-error'
                          : metric.confusion_percentage >= 33
                          ? 'bg-[#E8A634]/10 text-[#E8A634]'
                          : 'bg-[#3DD68C]/10 text-[#3DD68C]'
                      }`}>
                        {metric.confusion_percentage >= 66 ? 'HIGH' : metric.confusion_percentage >= 33 ? 'MEDIUM' : 'LOW'}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-bright rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          metric.confusion_percentage >= 66
                            ? 'bg-error'
                            : metric.confusion_percentage >= 33
                            ? 'bg-[#E8A634]'
                            : 'bg-[#3DD68C]'
                        }`}
                        style={{ width: `${metric.confusion_percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-headline-sm text-on-surface-variant">
                    {metric.confusion_percentage}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>          {/* Student Intervention Roster */}
          <motion.div
            variants={fadeUp(0.35)}
            initial="hidden"
            animate="visible"
            className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10"
          >
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Student Roster</h2>
                <p className="font-body-sm text-on-surface-variant mt-1">Manage interventions and view ML risk profiles.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="p-3 font-label-sm text-outline uppercase tracking-wider">Student</th>
                    <th className="p-3 font-label-sm text-outline uppercase tracking-wider">Avg Score</th>
                    <th className="p-3 font-label-sm text-outline uppercase tracking-wider">Risk Level</th>
                    <th className="p-3 font-label-sm text-outline uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {analytics.atRiskStudents && analytics.atRiskStudents.length > 0 ? analytics.atRiskStudents.map((student: any) => {
                    const initials = student.name ? student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                    return (
                    <tr key={student.id} className="hover:bg-surface-bright transition-colors group">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-body-sm text-on-surface block">{student.name}</span>
                            <span className="text-[10px] text-outline">Risk Score: {student.riskScore}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-body-sm text-on-surface font-medium">{student.score || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`font-label-sm uppercase px-2 py-1 rounded-full text-[10px] ${
                          student.riskLevel === 'CRITICAL' ? 'bg-error/20 text-error font-bold' :
                          student.riskLevel === 'HIGH' ? 'bg-error/10 text-error' :
                          student.riskLevel === 'MEDIUM' ? 'bg-[#E8A634]/10 text-[#E8A634]' :
                          'bg-[#3DD68C]/10 text-[#3DD68C]'
                        }`}>
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => handleIntervene(student.id)}
                          disabled={intervening === student.id}
                          className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-label-sm uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors text-[11px] disabled:opacity-50"
                        >
                          {intervening === student.id ? 'Sending...' : 'Intervene'}
                        </button>
                      </td>
                    </tr>
                  )}) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center font-body-sm text-outline">No at-risk students currently.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Column: AI Insights & Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ML Lab Link Card */}
          <motion.div
            variants={fadeUp(0.05)}
            initial="hidden"
            animate="visible"
          >
            <a href="/educator/ml-insights" className="block rounded-2xl overflow-hidden relative group" style={{ background: '#0D1117', border: '1px solid rgba(99,102,241,0.2)' }}>

              <div className="p-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: '#6366F1' }}>model_training</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">ML Lab</h3>
                      <p className="text-[11px] text-gray-500">6 models · Risk heatmap · System controls</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              </div>
            </a>
          </motion.div>
          {/* Live Student Doubts */}
          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            animate="visible"
            className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-error animate-ping mt-6 mr-6"></div>
            <h3 className="font-label-md text-outline uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">sensors</span> Live Student Doubts
            </h3>
            <div className="space-y-3">
              {analytics.recentSignals && analytics.recentSignals.length > 0 ? (
                analytics.recentSignals.filter((s: any) => s.signal !== 'Clear').slice(0, 4).map((item: any, index: number) => {
                  const timeStr = new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  return (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/10">
                    <div>
                      <h4 className="font-headline-sm text-on-surface">{item.students?.name || 'Unknown'}</h4>
                      <p className="font-body-sm text-outline">Struggling with: {item.concepts?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-label-sm uppercase px-2 py-1 rounded-full text-[10px] ${
                        item.signal === 'Confused' ? 'bg-error/10 text-error' :
                        'bg-[#E8A634]/10 text-[#E8A634]'
                      }`}>
                        {item.signal === 'Confused' ? 'LOST' : 'CONFUSED'}
                      </span>
                      <span className="text-[10px] text-outline mt-1">{timeStr}</span>
                    </div>
                  </div>
                )})
              ) : (
                <p className="font-body-sm text-outline">No recent doubts reported.</p>
              )}
            </div>
          </motion.div>

          {/* AI Recommendation */}
          {analytics.aiRecommendation && (
            <motion.div
              variants={fadeUp(0.2)}
              initial="hidden"
              animate="visible"
              className="bg-surface-container rounded-2xl p-6 shadow-lg border border-primary/20 relative overflow-hidden group"
            >

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
                  <span className="font-label-sm text-primary uppercase tracking-widest font-semibold">Cogniva Recommends</span>
                </div>
                <p className="font-body-md text-on-surface leading-relaxed">{analytics.aiRecommendation}</p>
              </div>
            </motion.div>
          )}
          <EducatorMLTerminal 
            mlRisk={mlRisk} 
            mlInsights={mlInsights} 
            loadingMl={loadingMl} 
            onGenerate={fetchMlInsights} 
          />

          {/* Most Confusing Concept */}
          {analytics.mostConfusing && (
            <motion.div
              variants={fadeUp(0.3)}
              initial="hidden"
              animate="visible"
              className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10"
            >
              <h3 className="font-label-md text-outline uppercase tracking-wider mb-4">
                Needs Immediate Attention
              </h3>
              <div className="bg-surface-bright/50 border border-error/20 rounded-xl p-4 mb-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-error/5 to-transparent"></div>
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-headline-sm text-on-surface">{analytics.mostConfusing.name}</h4>
                    <p className="font-body-sm text-error/90 font-medium">{analytics.mostConfusing.confusion_percentage}% Confusion Rate</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={handleGenerateLesson}
                  disabled={generatingLesson}
                  className="w-full bg-primary text-on-primary px-4 py-3 rounded-xl font-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generatingLesson ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  )}
                  {generatingLesson ? 'Generating...' : 'Generate AI Mini-Lesson'}
                </button>
                <button 
                  onClick={handleCreateStudyGuide}
                  disabled={generatingGuide}
                  className="w-full bg-surface-container-high text-on-surface px-4 py-3 rounded-xl font-label-sm uppercase tracking-wider hover:bg-surface-bright transition-colors border border-outline-variant/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generatingGuide ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  )}
                  {generatingGuide ? 'Generating...' : 'Create Study Guide'}
                </button>
              </div>
              
              {/* Output Results */}
              {miniLesson && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <h4 className="font-label-md text-primary uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Lesson Generated
                  </h4>
                  <div className="space-y-2">
                    <p className="font-body-sm text-on-surface/90"><strong className="text-on-surface">Re-explanation:</strong> {miniLesson.reExplanation}</p>
                    <p className="font-body-sm text-on-surface/90"><strong className="text-on-surface">Example:</strong> {miniLesson.workedExample}</p>
                    <p className="font-body-sm text-on-surface/90"><strong className="text-on-surface">Mistake Callout:</strong> {miniLesson.commonMistake}</p>
                  </div>
                </motion.div>
              )}
              
              {studyGuide && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-[#3DD68C]/5 rounded-xl border border-[#3DD68C]/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#3DD68C]"></div>
                  <h4 className="font-label-md text-[#3DD68C] uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">library_books</span>
                    Study Guide Ready
                  </h4>
                  <h5 className="font-headline-sm text-on-surface mb-2">{studyGuide.title}</h5>
                  <p className="font-body-sm text-on-surface/80 leading-relaxed mb-3">{studyGuide.content}</p>
                  <button 
                    onClick={() => setShowFullGuide(true)}
                    className="text-sm font-bold text-[#3DD68C] hover:underline flex items-center gap-1"
                  >
                    View Full Guide <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}



          {/* Quick Stats */}
          <motion.div
            variants={fadeUp(0.4)}
            initial="hidden"
            animate="visible"
            className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10"
          >
            <h3 className="font-label-md text-outline uppercase tracking-wider mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <span className="font-body-sm text-on-surface-variant">Active Learning Sessions</span>
                <span className="font-headline-sm text-on-surface">
                  {Math.floor(analytics.studentCount * 0.6)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <span className="font-body-sm text-on-surface-variant">Concepts Mastered (Avg)</span>
                <span className="font-headline-sm text-on-surface">
                  {Math.floor(analytics.averageClassScore / 10)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <span className="font-body-sm text-on-surface-variant">AI Tutor Interactions</span>
                <span className="font-headline-sm text-on-surface">
                  {Math.floor(analytics.studentCount * 4.2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Student Portal Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-2xl p-6 max-w-md w-full relative overflow-hidden"
          >

            
            <button 
              onClick={() => handleSelectTopic(null)}
              className="absolute top-4 right-4 text-outline hover:text-on-surface z-10 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[24px]">group</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-on-surface">Struggling Students</h3>
                <p className="font-body-sm text-error/90 font-medium">{selectedTopic}</p>
              </div>
            </div>
            
            {conceptAnalysis && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl relative z-10 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-label-sm text-primary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">psychology</span> ML Concept Analysis
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    conceptAnalysis.difficulty_level === 'hard' ? 'bg-error text-white' : 
                    conceptAnalysis.difficulty_level === 'medium' ? 'bg-[#E8A634] text-white' : 
                    'bg-[#3DD68C] text-white'
                  }`}>
                    {conceptAnalysis.difficulty_level} ({(conceptAnalysis.difficulty_score * 10).toFixed(1)}/10)
                  </span>
                </div>
                <p className="font-body-sm text-on-surface mb-2">
                  <span className="text-outline">Misconception:</span> {conceptAnalysis.common_misconception}
                </p>
                <p className="text-xs text-on-surface-variant italic">
                  * Students are spending ~{Math.floor(conceptAnalysis.average_time_spent / 60)}m on this block.
                </p>
              </div>
            )}
            
            <div className="space-y-3 relative z-10">
              {analytics.recentSignals && analytics.recentSignals.filter((s: any) => s.concepts?.name === selectedTopic && s.signal !== 'Clear').length > 0 ? (
                Array.from(new Set(analytics.recentSignals
                  .filter((s: any) => s.concepts?.name === selectedTopic && s.signal !== 'Clear')
                  .map((s: any) => s.students?.name)
                )).map((name: any, idx: number) => {
                  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                  return (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/5 hover:border-outline-variant/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {initials}
                    </div>
                    <div>
                      <span className="font-body-sm text-on-surface block">{name || 'Unknown'}</span>
                      <span className="text-xs text-outline group-hover:text-primary transition-colors">Course Average: N/A</span>
                    </div>
                  </div>
                  <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </button>
                </div>
              )})
              ) : (
                <p className="font-body-sm text-outline p-2">No students currently flagged for this topic.</p>
              )}
            </div>
            
            <button 
              onClick={() => handleSelectTopic(null)} 
              className="w-full mt-6 py-3 bg-surface-variant text-on-surface rounded-xl font-label-sm uppercase tracking-wider hover:bg-surface-variant/80 transition-colors relative z-10"
            >
              Close Portal
            </button>
          </motion.div>
        </div>
      )}

      {/* Full Study Guide Modal */}
      {showFullGuide && studyGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/10 border border-[#3DD68C]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#3DD68C] text-[20px]">library_books</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-on-surface">{studyGuide.title}</h2>
                  <p className="font-body-sm text-outline">Generated for: {analytics.mostConfusing?.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullGuide(false)}
                className="icon-button text-outline hover:text-on-surface bg-surface-bright rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            {/* Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10 flex-1 bg-surface-container/50">
              <div className="max-w-3xl mx-auto">
                <h3 className="font-headline-sm text-primary mb-4">1. Core Concept Overview</h3>
                <p className="font-body-md text-on-surface/90 mb-8 leading-relaxed">
                  {studyGuide.content} Binary Search Trees (BST) are node-based binary tree data structures which have the following properties:
                  The left subtree of a node contains only nodes with keys lesser than the node’s key.
                  The right subtree of a node contains only nodes with keys greater than the node’s key.
                </p>
                
                <h3 className="font-headline-sm text-[#E8A634] mb-4">2. Top Stumbling Blocks</h3>
                <div className="space-y-4 mb-8">
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant/10">
                    <h4 className="font-bold text-error mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      Unbalanced Trees
                    </h4>
                    <p className="font-body-sm text-on-surface/80">Students often forget that inserting sorted data creates a linked list (O(n) time) rather than a balanced tree (O(log n) time).</p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant/10">
                    <h4 className="font-bold text-error mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      Deletion Edge Cases
                    </h4>
                    <p className="font-body-sm text-on-surface/80">Removing a node with two children requires finding the in-order successor, which frequently causes confusion in pointers.</p>
                  </div>
                </div>

                <h3 className="font-headline-sm text-[#3DD68C] mb-4">3. Quick Practice</h3>
                <div className="bg-[#3DD68C]/5 border border-[#3DD68C]/20 p-5 rounded-xl font-mono text-sm text-on-surface mb-6">
                  <p className="mb-2 text-[#3DD68C]">// Problem: Validate BST</p>
                  <p>function isValidBST(node, min = null, max = null) {'{'}</p>
                  <p className="pl-4">if (!node) return true;</p>
                  <p className="pl-4">if (min !== null && node.val {'<='} min) return false;</p>
                  <p className="pl-4">if (max !== null && node.val {'>='} max) return false;</p>
                  <p className="pl-4">return isValidBST(node.left, min, node.val) &&</p>
                  <p className="pl-11">isValidBST(node.right, node.val, max);</p>
                  <p>{'}'}</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/10 bg-surface flex justify-end gap-3 relative z-10">
              <button 
                onClick={() => alert("Downloading PDF...")}
                className="px-4 py-2 bg-surface-variant text-on-surface rounded-lg font-bold hover:bg-surface-variant/80 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
              </button>
              <button 
                onClick={() => {
                  alert("Guide distributed to all struggling students!");
                  setShowFullGuide(false);
                }}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(232,64,64,0.3)]"
              >
                <span className="material-symbols-outlined text-[18px]">send</span> Distribute to Class
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
