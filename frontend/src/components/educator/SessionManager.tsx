import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/animation';
import { useApi } from '../../hooks/useApi';

interface SessionManagerProps {
  courseId: string;
  onSessionChange?: (session: any) => void;
}

export default function SessionManager({ courseId, onSessionChange }: SessionManagerProps) {
  const api = useApi();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [momentLabel, setMomentLabel] = useState('');
  const [isAddingMoment, setIsAddingMoment] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveSession();
  }, [courseId]);

  const loadActiveSession = async () => {
    try {
      const session = await api.get(`/sessions/active/${courseId}`);
      setActiveSession(session);
      if (onSessionChange) onSessionChange(session);
    } catch (err) {
      console.error('Failed to load active session:', err);
    }
  };

  const handleStartSession = async () => {
    if (!sessionTitle.trim()) {
      alert('Please enter a session title');
      return;
    }

    setLoading(true);
    try {
      const session = await api.post('/sessions/start', {
        course_id: courseId,
        title: sessionTitle.trim()
      });
      setActiveSession(session);
      setShowStartDialog(false);
      setSessionTitle('');
      if (onSessionChange) onSessionChange(session);
    } catch (err: any) {
      console.error('Failed to start session:', err);
      alert(err.response?.data?.error || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    
    if (!confirm('End this session? Students will no longer be able to raise timestamped confusion signals.')) {
      return;
    }

    setLoading(true);
    try {
      await api.post(`/sessions/${activeSession.id}/end`, {});
      setActiveSession(null);
      if (onSessionChange) onSessionChange(null);
    } catch (err) {
      console.error('Failed to end session:', err);
      alert('Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoment = async () => {
    if (!momentLabel.trim() || !activeSession) return;

    setIsAddingMoment(true);
    try {
      await api.post(`/sessions/${activeSession.id}/moments`, {
        label: momentLabel.trim()
      });
      setMomentLabel('');
      // Reload session to show new moment
      loadActiveSession();
    } catch (err) {
      console.error('Failed to add moment:', err);
      alert('Failed to add moment');
    } finally {
      setIsAddingMoment(false);
    }
  };

  const formatElapsedTime = () => {
    if (!activeSession) return '0:00';
    const startTime = new Date(activeSession.started_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [elapsedTime, setElapsedTime] = useState('0:00');

  useEffect(() => {
    if (!activeSession) return;

    const updateTime = () => setElapsedTime(formatElapsedTime());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  return (
    <motion.div
      variants={fadeUp(0.1)}
      initial="hidden"
      animate="visible"
      className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">sensors</span>
          <div>
            <h3 className="font-headline-sm text-on-surface">Live Session</h3>
            <p className="font-body-sm text-outline">Manage active lecture and tag moments</p>
          </div>
        </div>
      </div>

      {!activeSession ? (
        <div>
          {!showStartDialog ? (
            <button
              onClick={() => setShowStartDialog(true)}
              className="w-full bg-primary text-on-primary px-6 py-4 rounded-xl font-label-md uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Start Live Session
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Session title (e.g., 'Binary Search Trees Lecture')"
                className="w-full bg-surface-bright border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleStartSession()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleStartSession}
                  disabled={loading || !sessionTitle.trim()}
                  className="flex-1 bg-primary text-on-primary px-4 py-3 rounded-lg font-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setShowStartDialog(false);
                    setSessionTitle('');
                  }}
                  className="flex-1 bg-surface-variant text-on-surface px-4 py-3 rounded-lg font-label-sm uppercase tracking-wider hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Session Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary animate-ping mt-4 mr-4"></div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-headline-sm text-on-surface mb-1">{activeSession.title}</h4>
                <p className="font-body-sm text-outline">Started {new Date(activeSession.started_at).toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl text-primary font-bold">{elapsedTime}</div>
                <div className="text-xs text-outline uppercase tracking-wider">Elapsed</div>
              </div>
            </div>
          </div>

          {/* Quick Tag Input */}
          <div className="bg-surface-bright rounded-xl p-4 border border-outline-variant/10">
            <label className="font-label-sm text-outline uppercase tracking-wider mb-2 block">
              What are you covering right now?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={momentLabel}
                onChange={(e) => setMomentLabel(e.target.value)}
                placeholder="e.g., 'Explaining why binary search divides in half'"
                className="flex-1 bg-surface border border-outline-variant/20 rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMoment()}
              />
              <button
                onClick={handleAddMoment}
                disabled={isAddingMoment || !momentLabel.trim()}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isAddingMoment ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">add</span>
                )}
                Tag
              </button>
            </div>
            <p className="text-xs text-outline mt-2">
              These tags help students get contextual AI recaps tied to specific moments
            </p>
          </div>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            disabled={loading}
            className="w-full bg-surface-variant text-on-surface px-4 py-3 rounded-xl font-label-sm uppercase tracking-wider hover:bg-error/10 hover:text-error transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">stop</span>
            End Session
          </button>
        </div>
      )}
    </motion.div>
  );
}
