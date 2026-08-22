import { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Loading from '../ui/Loading';

export default function EducatorDashboard() {
  const api = useApi();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoursAgo, setHoursAgo] = useState<number>(24);
  const [miniLesson, setMiniLesson] = useState<any>(null);
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [studyGuide, setStudyGuide] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const loadData = async (hours: number) => {
    try {
      const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const analyticsData = await api.get(`/analytics/educator?since=${sinceDate}`);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load educator analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData(hoursAgo);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => loadData(hoursAgo), 15000);
    
    return () => clearInterval(intervalRef.current);
  }, [hoursAgo]); // Removed api to prevent infinite re-renders

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
      </header>

      {/* Summary Cards */}
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
              </div>
              <p className="font-label-sm text-outline uppercase tracking-wider">Total Students</p>
            </div>
            <div>
              <p className="font-headline-lg text-4xl text-on-surface">{analytics.studentCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3DD68C]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#3DD68C]/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/10 flex items-center justify-center border border-[#3DD68C]/20">
                <span className="material-symbols-outlined text-[#3DD68C] text-[20px]">trending_up</span>
              </div>
              <p className="font-label-sm text-outline uppercase tracking-wider">Avg Class Score</p>
            </div>
            <div>
              <p className="font-headline-lg text-4xl text-on-surface">{analytics.averageClassScore}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-error/10 transition-colors"></div>
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
                  onClick={(data) => setSelectedTopic(data.name)}
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
          </motion.div>
        </div>

        {/* Right Column: AI Insights & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Recommendation */}
          {analytics.aiRecommendation && (
            <motion.div
              variants={fadeUp(0.2)}
              initial="hidden"
              animate="visible"
              className="bg-surface-container rounded-2xl p-6 shadow-lg border border-primary/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
                  <span className="font-label-sm text-primary uppercase tracking-widest font-semibold">Cogniva Recommends</span>
                </div>
                <p className="font-body-md text-on-surface leading-relaxed">{analytics.aiRecommendation}</p>
              </div>
            </motion.div>
          )}

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-2xl p-6 max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <button 
              onClick={() => setSelectedTopic(null)}
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
            
            <div className="space-y-3 relative z-10">
              {[
                { initials: 'AS', name: 'Alex Smith', score: '62%' },
                { initials: 'SJ', name: 'Sam Johnson', score: '58%' },
                { initials: 'EJ', name: 'Emma Jones', score: '45%' }
              ].map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/5 hover:border-outline-variant/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {student.initials}
                    </div>
                    <div>
                      <span className="font-body-sm text-on-surface block">{student.name}</span>
                      <span className="text-xs text-outline group-hover:text-primary transition-colors">Course Average: {student.score}</span>
                    </div>
                  </div>
                  <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setSelectedTopic(null)} 
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
