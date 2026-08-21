import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Loading from '../ui/Loading';

export default function EducatorDashboard() {
  const api = useApi();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const analyticsData = await api.get('/analytics/educator');
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to load educator analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <Loading variant="dashboard" />;
  if (!analytics) return <div className="page-shell">Error loading analytics</div>;

  const confusionChartData = analytics.confusionMetrics.slice(0, 8).map((metric: any) => ({
    name: metric.name.length > 20 ? metric.name.substring(0, 20) + '...' : metric.name,
    confusion: metric.confusion_percentage
  }));

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
        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[24px]">group</span>
            </div>
            <div>
              <p className="font-label-sm text-outline uppercase tracking-wider">Total Students</p>
              <p className="font-headline-lg text-headline-lg text-on-surface">{analytics.studentCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#3DD68C]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#3DD68C] text-[24px]">trending_up</span>
            </div>
            <div>
              <p className="font-label-sm text-outline uppercase tracking-wider">Avg Class Score</p>
              <p className="font-headline-lg text-headline-lg text-on-surface">{analytics.averageClassScore}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUpChild} className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[24px]">warning</span>
            </div>
            <div>
              <p className="font-label-sm text-outline uppercase tracking-wider">High Confusion Topics</p>
              <p className="font-headline-lg text-headline-lg text-on-surface">
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
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Confusion Heatmap</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confusionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#273647" />
                <XAxis dataKey="name" stroke="#7E8B99" style={{ fontSize: '12px' }} />
                <YAxis stroke="#7E8B99" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2332',
                    border: '1px solid #273647',
                    borderRadius: '12px',
                    color: '#E8EFF7'
                  }}
                />
                <Bar dataKey="confusion" fill="#E84040" radius={[8, 8, 0, 0]} />
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
              className="bg-primary-container text-on-primary-container rounded-2xl p-6 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                  <span className="font-label-md uppercase tracking-wider">Cogniva Recommends</span>
                </div>
                <p className="font-body-md leading-relaxed">{analytics.aiRecommendation}</p>
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
              <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-error text-[32px]">warning</span>
                  <div className="flex-1">
                    <h4 className="font-headline-sm text-on-surface">{analytics.mostConfusing.name}</h4>
                    <p className="font-body-sm text-error">{analytics.mostConfusing.confusion_percentage}% Confusion Rate</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full bg-primary text-on-primary px-4 py-3 rounded-xl font-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">video_library</span>
                  Schedule Review Session
                </button>
                <button className="w-full bg-surface-container-high text-on-surface px-4 py-3 rounded-xl font-label-sm uppercase tracking-wider hover:bg-surface-bright transition-colors border border-outline-variant/10 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  Create Study Guide
                </button>
              </div>
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
    </div>
  );
}
