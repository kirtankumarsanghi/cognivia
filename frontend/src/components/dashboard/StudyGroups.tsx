import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';
import Loading from '../ui/Loading';

interface Match {
  id: string;
  name: string;
  strength: string;
  match: number;
}

interface Session {
  id: string;
  title: string;
  topic: string;
  participants: number;
  isLive: boolean;
}

export default function StudyGroups() {
  const api = useApi();
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matchesData, sessionsData] = await Promise.all([
          api.get('/study-groups/matches'),
          api.get('/study-groups/sessions'),
        ]);
        setMatches(matchesData);
        setSessions(sessionsData);
      } catch (err: any) {
        console.error('Failed to load study groups data', err);
        setError('Could not connect to the study hub. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [api]);

  if (loading) return <Loading variant="dashboard" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container rounded-2xl border border-error/20">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">wifi_off</span>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Connection Issue</h2>
        <p className="font-body-md text-on-surface-variant">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); }}
          className="mt-4 px-6 py-2 bg-surface-bright rounded-lg font-bold text-on-surface hover:text-primary transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="font-headline-lg text-3xl font-bold tracking-tight mb-2 text-on-surface">Peer Study Hub</h1>
        <p className="font-body-md text-on-surface-variant opacity-80">Connect with peers who have mastered concepts you are currently learning.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Suggested Matches */}
        <motion.div variants={fadeUpChild} className="bg-surface-container p-6 md:p-8 rounded-3xl shadow-lg border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">handshake</span>
              </div>
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">Suggested Matches</h2>
            </div>
            <span className="px-3 py-1 bg-surface-bright rounded-full text-xs font-label-sm uppercase tracking-widest text-on-surface-variant">Top {matches.length}</span>
          </div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <AnimatePresence>
              {matches.map((peer, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={peer.id} 
                  className="p-5 rounded-2xl border border-outline-variant/10 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 hover:shadow-md transition-all group/card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                      {peer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-body-lg font-bold text-on-surface group-hover/card:text-primary transition-colors">{peer.name}</h3>
                      <p className="font-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">school</span>
                        Mastered: {peer.strength}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-1">
                    <div className="font-label-md text-sm font-bold text-[#3DD68C] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">stars</span>
                      {peer.match}% Match
                    </div>
                    <button className="px-4 py-2 bg-surface-bright hover:bg-primary/10 text-primary rounded-xl text-sm font-label-sm font-bold transition-colors">
                      Connect
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {matches.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant border border-dashed border-outline-variant/20 rounded-2xl bg-surface">
                <span className="material-symbols-outlined text-[32px] opacity-50 mb-2">person_search</span>
                <p className="font-body-sm">No new matches found today. Check back later!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div variants={fadeUpChild} className="bg-gradient-to-b from-primary/5 to-surface-container p-6 md:p-8 rounded-3xl shadow-lg border border-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"></div>
          
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[24px]">stream</span>
            </div>
            <h2 className="font-headline-sm text-xl font-bold text-on-surface">Active Sessions</h2>
          </div>
          <p className="font-body-sm text-on-surface-variant mb-8 relative z-10 opacity-80">Join live study groups happening right now.</p>
          
          <div className="flex flex-col gap-5 relative z-10">
            {sessions.map((session, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                key={session.id} 
                className="p-6 rounded-2xl border border-primary/20 bg-surface shadow-sm hover:shadow-lg hover:border-primary/40 transition-all group/session"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover/session:text-primary transition-colors">{session.title}</h3>
                  {session.isLive && (
                    <span className="px-3 py-1.5 rounded-full bg-error/10 text-error text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 border border-error/20">
                      <span className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(232,64,64,0.8)]"></span>
                      LIVE
                    </span>
                  )}
                </div>
                
                <p className="font-body-sm text-on-surface-variant mb-6 leading-relaxed bg-surface-bright/50 p-3 rounded-xl border border-outline-variant/10">
                  {session.topic}
                </p>
                
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-3">
                      {[...Array(Math.min(3, session.participants))].map((_, idx) => (
                        <div key={idx} style={{ zIndex: 30 - idx }} className="relative w-8 h-8 rounded-full bg-surface-variant border-2 border-surface flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-outline opacity-50">person</span>
                        </div>
                      ))}
                      {session.participants > 3 && (
                        <div className="relative w-8 h-8 rounded-full bg-surface-bright border-2 border-surface flex items-center justify-center text-[10px] font-bold text-on-surface-variant z-0">
                          +{session.participants - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-label-sm text-on-surface-variant ml-2">
                      {session.participants} joined
                    </span>
                  </div>
                  
                  <button className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-label-sm font-bold shadow-[0_4px_14px_0_rgba(232,166,52,0.39)] hover:shadow-[0_6px_20px_rgba(232,166,52,0.23)] hover:scale-105 transition-all flex items-center gap-2">
                    Join Now
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            ))}

            {sessions.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant border border-dashed border-primary/20 rounded-2xl bg-surface">
                <span className="material-symbols-outlined text-[32px] text-primary/50 mb-2">hourglass_empty</span>
                <p className="font-body-sm">No active sessions right now. Why not start one?</p>
                <button className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold">Create Session</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
