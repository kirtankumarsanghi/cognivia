import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
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

  // New states for interactions
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [activeSessionRoom, setActiveSessionRoom] = useState<Session | null>(null);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const loadData = useCallback(async () => {
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
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConnect = async (peerId: string) => {
    setConnectingTo(peerId);
    try {
      await api.post('/study-groups/connect', { peerId });
      await new Promise(r => setTimeout(r, 1000)); // Simulating network
      setConnectedPeers(prev => new Set(prev).add(peerId));
    } catch (e) {
      console.error(e);
    } finally {
      setConnectingTo(null);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionTitle || !newSessionTopic) return;
    setIsCreating(true);
    try {
      const newSession = await api.post('/study-groups/sessions', {
        title: newSessionTitle,
        topic: newSessionTopic
      });
      setShowCreateSession(false);
      setNewSessionTitle('');
      setNewSessionTopic('');
      // Enter room instantly
      setActiveSessionRoom(newSession);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (session: Session) => {
    setIsJoining(session.id);
    try {
      await api.post(`/study-groups/sessions/${session.id}/join`, {});
      await new Promise(r => setTimeout(r, 800)); // Simulate connection delay
      setActiveSessionRoom({ ...session, participants: session.participants + 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(null);
    }
  };

  if (loading) return <Loading variant="dashboard" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container rounded-2xl border border-error/20">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">wifi_off</span>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Connection Issue</h2>
        <p className="font-body-md text-on-surface-variant">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); loadData(); }}
          className="mt-4 px-6 py-2 bg-surface-bright rounded-lg font-bold text-on-surface hover:text-primary transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Active Session Room Overlay
  if (activeSessionRoom) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        <div className="p-4 border-b border-outline-variant/20 bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(232,64,64,0.8)]"></span>
            <h2 className="font-bold text-xl text-on-surface">{activeSessionRoom.title}</h2>
          </div>
          <button 
            onClick={() => setActiveSessionRoom(null)}
            className="px-4 py-2 bg-error/10 text-error rounded-lg font-bold hover:bg-error/20 transition-colors"
          >
            Leave Session
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area / Whiteboard Simulator */}
          <div className="flex-1 bg-surface-container-high m-4 rounded-2xl border border-outline-variant/10 flex flex-col items-center justify-center text-on-surface-variant relative overflow-hidden">
            <span className="material-symbols-outlined text-[100px] opacity-10 mb-4">draw</span>
            <h3 className="text-2xl font-bold mb-2">Interactive Whiteboard</h3>
            <p className="max-w-md text-center opacity-70">
              You are currently discussing <strong>{activeSessionRoom.topic}</strong>. 
              The collaborative whiteboard is syncing with {activeSessionRoom.participants - 1} other peers.
            </p>
          </div>
          
          {/* Sidebar / Chat Simulator */}
          <div className="w-80 bg-surface m-4 ml-0 rounded-2xl border border-outline-variant/10 flex flex-col">
            <div className="p-4 border-b border-outline-variant/10 font-bold flex items-center justify-between">
              Live Chat
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{activeSessionRoom.participants} online</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              <div className="text-xs text-center text-on-surface-variant bg-surface-container rounded-lg p-2">
                You joined the session. Say hi!
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0"></div>
                <div className="bg-surface-container p-3 rounded-2xl rounded-tl-sm text-sm">
                  Hey! I have a question about {activeSessionRoom.topic}.
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant/10">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto pb-24"
    >
      <motion.div variants={fadeUp()} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold tracking-tight mb-2 text-on-surface">Peer Study Hub</h1>
          <p className="font-body-md text-on-surface-variant opacity-80">Connect with peers who have mastered concepts you are currently learning.</p>
        </div>
        <button 
          onClick={() => setShowCreateSession(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(232,166,52,0.39)] hover:shadow-[0_6px_20px_rgba(232,166,52,0.23)] hover:-translate-y-1 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Create Session
        </button>
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
              {matches.map((peer, index) => {
                const isConnecting = connectingTo === peer.id;
                const isConnected = connectedPeers.has(peer.id);

                return (
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
                      <button 
                        onClick={() => handleConnect(peer.id)}
                        disabled={isConnecting || isConnected}
                        className={`px-4 py-2 rounded-xl text-sm font-label-sm font-bold transition-all flex items-center gap-2 ${
                          isConnected 
                            ? 'bg-[#3DD68C]/10 text-[#3DD68C]' 
                            : 'bg-surface-bright hover:bg-primary/10 text-primary'
                        }`}
                      >
                        {isConnecting ? (
                          <>
                            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                            Connecting
                          </>
                        ) : isConnected ? (
                          <>
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Connected
                          </>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
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
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">stream</span>
              </div>
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">Active Sessions</h2>
            </div>
            {sessions.length > 0 && (
               <span className="px-3 py-1 bg-surface-bright rounded-full text-xs font-label-sm tracking-widest text-on-surface-variant border border-outline-variant/10">Live Updates</span>
            )}
          </div>
          <p className="font-body-sm text-on-surface-variant mb-8 relative z-10 opacity-80">Join live study groups happening right now.</p>
          
          <div className="flex flex-col gap-5 relative z-10">
            <AnimatePresence>
              {sessions.map((session, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.1 }}
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
                    
                    <button 
                      onClick={() => handleJoinSession(session)}
                      disabled={isJoining === session.id}
                      className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-label-sm font-bold shadow-[0_4px_14px_0_rgba(232,166,52,0.39)] hover:shadow-[0_6px_20px_rgba(232,166,52,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      {isJoining === session.id ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          Joining...
                        </>
                      ) : (
                        <>
                          Join Now
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sessions.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant border border-dashed border-primary/20 rounded-2xl bg-surface">
                <span className="material-symbols-outlined text-[32px] text-primary/50 mb-2">hourglass_empty</span>
                <p className="font-body-sm">No active sessions right now. Why not start one?</p>
                <button 
                  onClick={() => setShowCreateSession(true)}
                  className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                  Create Session
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateSession && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface-container rounded-3xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-on-surface">Start a Live Session</h2>
                <button 
                  onClick={() => setShowCreateSession(false)}
                  className="p-2 bg-surface-bright rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">Session Title</label>
                  <input 
                    type="text" 
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    placeholder="e.g. Late Night DSA Prep"
                    className="w-full bg-surface-bright border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">Topic Focus</label>
                  <textarea 
                    value={newSessionTopic}
                    onChange={(e) => setNewSessionTopic(e.target.value)}
                    placeholder="What will you be discussing? e.g. Graph Traversal algorithms and topological sorting..."
                    className="w-full bg-surface-bright border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 py-3 bg-surface-bright text-on-surface font-bold rounded-xl hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateSession}
                  disabled={!newSessionTitle || !newSessionTopic || isCreating}
                  className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      Starting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">video_call</span>
                      Go Live
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
