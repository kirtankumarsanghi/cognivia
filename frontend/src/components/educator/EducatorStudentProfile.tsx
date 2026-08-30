import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';

interface EducatorStudentProfileProps {
  student: any;
  courseId: string;
  onClose: () => void;
}

export default function EducatorStudentProfile({ student, courseId, onClose }: EducatorStudentProfileProps) {
  const api = useApi();
  const [profileData, setProfileData] = useState<any>(null);
  const [mlInsights, setMlInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingIntervention, setSendingIntervention] = useState(false);
  const [interventionSent, setInterventionSent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch specific student analytics/profile
        const features = {
          avg_practice_accuracy: student.mastery / 100,
          avg_confusion_frequency: student.pulse === 'High' ? 0.8 : student.pulse === 'Medium' ? 0.4 : 0.1,
          recent_incorrect: student.pulse === 'High' ? 5 : 1,
          time_gap_hours: 24,
        };
        
        const [profileRes, earlyWarningRes] = await Promise.all([
          api.post('/ml/student-profile', { studentId: student.id, features }),
          api.post('/ml/early-warning', { features })
        ]);
        
        setProfileData(profileRes);
        setMlInsights(earlyWarningRes);
      } catch (err) {
        console.error('Failed to load student profile insights', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [student, api]);

  const handleSendIntervention = async () => {
    setSendingIntervention(true);
    try {
      await api.post('/educator/intervene', {
        studentId: student.id,
        courseId,
        topic: student.strugglingTopic !== 'None' ? student.strugglingTopic : 'General Review',
        message: 'Your educator has sent you a targeted AI Study Guide based on your recent activity.'
      });
      
      setInterventionSent(true);
      setTimeout(() => {
        setInterventionSent(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to send intervention', err);
    } finally {
      setSendingIntervention(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface-container rounded-3xl border border-outline-variant/10 shadow-2xl max-w-3xl w-full relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center relative z-10 bg-surface">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                {student.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h2 className="font-headline-md text-on-surface">{student.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${student.status === 'Active' ? 'bg-[#3DD68C]' : 'bg-outline-variant'}`}></span>
                  <span className="font-body-sm text-on-surface-variant">{student.status} • Last Active: {student.lastActive}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-outline hover:text-on-surface bg-surface-bright rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative z-10 bg-surface-container/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-primary text-[40px] mb-4">progress_activity</span>
                <p className="font-body-md text-on-surface-variant">Analyzing student cognitive profile...</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface rounded-2xl p-4 border border-outline-variant/10">
                    <span className="font-label-sm text-outline uppercase tracking-wider block mb-2">Overall Mastery</span>
                    <div className="flex items-end gap-2">
                      <span className="font-headline-lg text-on-surface">{student.mastery}%</span>
                      <span className={`material-symbols-outlined mb-1 ${student.trend === 'up' ? 'text-[#3DD68C]' : student.trend === 'down' ? 'text-error' : 'text-outline'}`}>
                        {student.trend === 'up' ? 'trending_up' : student.trend === 'down' ? 'trending_down' : 'trending_flat'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-surface rounded-2xl p-4 border border-outline-variant/10">
                    <span className="font-label-sm text-outline uppercase tracking-wider block mb-2">Confusion Pulse</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                      student.pulse === 'High' ? 'bg-error/10 text-error border border-error/20' :
                      student.pulse === 'Medium' ? 'bg-[#E8A634]/10 text-[#E8A634] border border-[#E8A634]/20' :
                      'bg-[#3DD68C]/10 text-[#3DD68C] border border-[#3DD68C]/20'
                    }`}>
                      {student.pulse}
                    </span>
                  </div>
                  
                  <div className="bg-surface rounded-2xl p-4 border border-outline-variant/10">
                    <span className="font-label-sm text-outline uppercase tracking-wider block mb-2">Struggling Topic</span>
                    <span className={`font-body-md font-medium ${student.strugglingTopic !== 'None' ? 'text-error/90' : 'text-[#3DD68C]'}`}>
                      {student.strugglingTopic}
                    </span>
                  </div>
                </div>

                {/* ML Insights Section */}
                <h3 className="font-label-md text-primary uppercase tracking-widest flex items-center gap-2 mt-8 mb-4">
                  <span className="material-symbols-outlined">psychology</span> Cogniva ML Insights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cognitive Profile */}
                  <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block mb-4">Learning Pattern</span>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-primary text-[24px]">
                          {profileData?.cluster === 'Struggling' ? 'warning' : profileData?.cluster === 'Advanced' ? 'rocket_launch' : 'pace'}
                        </span>
                      </div>
                      <span className="font-headline-md text-on-surface">{profileData?.cluster || 'Analyzing...'}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-on-surface-variant">
                        <span>Model Confidence</span>
                        <span>{profileData ? (profileData.confidence * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-bright rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${profileData ? profileData.confidence * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Early Warning Risk */}
                  <div className={`rounded-2xl p-5 border relative overflow-hidden ${
                    student.pulse === 'High' ? 'bg-error/5 border-error/20' : 
                    student.pulse === 'Medium' ? 'bg-[#E8A634]/5 border-[#E8A634]/20' : 
                    'bg-[#3DD68C]/5 border-[#3DD68C]/20'
                  }`}>
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 blur-2xl ${
                      student.pulse === 'High' ? 'bg-error/10' : 
                      student.pulse === 'Medium' ? 'bg-[#E8A634]/10' : 
                      'bg-[#3DD68C]/10'
                    }`}></div>
                    
                    <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block mb-4">Dropout / Failure Risk</span>
                    
                    <div className="flex items-end gap-2 mb-4">
                      <span className={`font-headline-lg ${
                        student.pulse === 'High' ? 'text-error' : 
                        student.pulse === 'Medium' ? 'text-[#E8A634]' : 
                        'text-[#3DD68C]'
                      }`}>
                        {mlInsights?.predictions ? (mlInsights.predictions[0] * 100).toFixed(0) : 0}%
                      </span>
                      <span className="font-body-sm text-on-surface-variant mb-2">risk score</span>
                    </div>

                    {mlInsights?.risk_factors && (
                      <div className="space-y-1">
                        <span className="text-xs text-outline uppercase">Key Factors:</span>
                        <p className="font-body-sm text-on-surface">
                          {student.pulse === 'High' ? 'High confusion in recent topics, low practice accuracy.' : 
                           student.pulse === 'Medium' ? 'Inconsistent practice schedule.' : 
                           'Steady progress, no major risk factors detected.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Intervention Action */}
                <div className="mt-8 bg-surface rounded-2xl p-6 border border-outline-variant/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-headline-sm text-on-surface mb-1">Take Action</h4>
                    <p className="font-body-sm text-on-surface-variant max-w-md">
                      Send a personalized AI Study Guide to {student.name.split(' ')[0]} based on their specific struggling topics and learning profile.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSendIntervention}
                    disabled={sendingIntervention || interventionSent || student.strugglingTopic === 'None'}
                    className={`px-6 py-3 rounded-xl font-label-md uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                      interventionSent 
                        ? 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/30'
                        : 'bg-primary text-on-primary hover:opacity-90 shadow-[0_0_15px_rgba(232,64,64,0.3)] disabled:opacity-50 disabled:shadow-none'
                    }`}
                  >
                    {interventionSent ? (
                      <>
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Intervention Sent
                      </>
                    ) : sendingIntervention ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Send AI Study Guide
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
