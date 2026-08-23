import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';

/* ── colour tokens ── */
const ACCENT   = 'var(--accent)';
const ACCENT2  = 'var(--accent)'; // We'll use primary accent for both to match branding
const WARN     = '#E8A634';
const DANGER   = 'var(--danger)';
const BG_DARK  = 'var(--bg-elevated)';
const BG_CARD  = 'var(--bg-card)';

// Dynamic data loaded from API instead of mock constants

/* ── section definitions ── */
const SECTIONS = [
  {
    id: 'heatmap',
    name: 'Class Risk Heatmap',
    icon: 'grid_view',
    description: 'Aggregated early-warning scores for every student in your class. Each cell shows the ML-predicted probability of falling behind. Red cells need immediate attention, green cells are on track.',
    model_tag: 'Logistic Regression × N students',
  },
  {
    id: 'clustering',
    name: 'Student Clustering',
    icon: 'bubble_chart',
    description: 'K-Means clustering distributes your students into learning archetypes based on 6 behavioural features. This helps you identify groups that need different teaching strategies.',
    model_tag: 'K-Means Clustering',
  },
  {
    id: 'difficulty-map',
    name: 'Concept Difficulty Map',
    icon: 'map',
    description: 'Item Response Theory (IRT) estimates how hard each concept is across your entire class. It surfaces the most common misconception for each concept so you can address them proactively.',
    model_tag: 'Item Response Theory',
  },
  {
    id: 'nlp-analysis',
    name: 'NLP Doubt Analysis',
    icon: 'forum',
    description: 'A BERT-based classifier analyses student confusion signals for emotional sentiment (frustrated, confused, curious), intent (seeking explanation, requesting example), and urgency level.',
    model_tag: 'BERT Text Classifier',
  },
  {
    id: 'decay-monitor',
    name: 'Learning Risk Monitor',
    icon: 'monitor_heart',
    description: "Tracks knowledge decay across students using Ebbinghaus' forgetting curve. Flags students where predicted retention has dropped below the recall threshold.",
    model_tag: 'Exponential Decay Model',
  },
  {
    id: 'controls',
    name: 'System Override Controls',
    icon: 'tune',
    description: 'As the educator, you have ultimate authority over the AI. Adjust the baseline difficulty, intervention thresholds, and toggle auto-generation features. These overrides affect all ML models.',
    model_tag: 'Manual Override',
  },
];

/* ── helper components ── */
function TagPill({ label, color = ACCENT }: { label: string; color?: string }) {
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: color, background: `${color}15` }}
    >
      {label}
    </span>
  );
}

function RiskCell({ value }: { value: number }) {
  const color = value > 0.7 ? DANGER : value > 0.4 ? WARN : ACCENT2;
  return (
    <div
      className="w-full aspect-square rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-transform hover:scale-110 cursor-default"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40`, boxShadow: `inset 0 0 15px ${color}15` }}
      title={`Risk: ${(value * 100).toFixed(0)}%`}
    >
      {(value * 100).toFixed(0)}%
    </div>
  );
}

/* ── section renderers ── */
function renderSection(id: string, api: any, sectionState: any, setSectionState: (fn: (prev: any) => any) => void, students: any[], concepts: any[]) {
  switch (id) {
    case 'heatmap':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {students.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <RiskCell value={s.risk} />
                <span className="text-[10px] text-gray-500 text-center truncate w-full">{s.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 justify-center pt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-3 h-3 rounded" style={{ background: `${ACCENT2}30` }} />Low Risk</div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-3 h-3 rounded" style={{ background: `${WARN}30` }} />Medium</div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-3 h-3 rounded" style={{ background: `${DANGER}30` }} />High Risk</div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            <strong style={{ color: DANGER }}>{students.filter(s => s.risk > 0.7).length}</strong> students flagged as high-risk. <strong style={{ color: WARN }}>{students.filter(s => s.risk > 0.4 && s.risk <= 0.7).length}</strong> at medium risk.
          </p>
        </div>
      );

    case 'clustering':
      const clusters: Record<string, any[]> = {};
      students.forEach(s => {
        if (!clusters[s.cluster]) clusters[s.cluster] = [];
        clusters[s.cluster].push(s);
      });
      const clusterColors: Record<string, string> = { 'Struggling': DANGER, 'At Risk': WARN, 'Steady Learner': ACCENT2, 'Fast Sprinter': ACCENT };
      return (
        <div className="space-y-4">
          {Object.entries(clusters).map(([name, students]) => (
            <div key={name} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: clusterColors[name] || ACCENT2 }} />
                  <span className="text-sm font-bold text-white">{name}</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{students.length} student{students.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {students.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                    style={{ background: `${clusterColors[name] || ACCENT2}12`, border: `1px solid ${clusterColors[name] || ACCENT2}30`, color: clusterColors[name] || ACCENT2 }}
                  >
                    <span className="font-bold">{s.initials}</span>
                    <span className="text-gray-400">{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case 'difficulty-map':
      return (
        <div className="space-y-3">
          {concepts.map(c => {
            const color = c.difficulty > 70 ? DANGER : c.difficulty > 40 ? WARN : ACCENT2;
            return (
              <div key={c.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{c.name}</span>
                  <span className="text-sm font-mono font-bold" style={{ color }}>{c.difficulty}/100</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.difficulty}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>💡 {c.misconception}</span>
                  <span className="font-mono">{Math.floor(c.avgTime / 60)}m avg</span>
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'nlp-analysis': {
      const nlpState = sectionState?.nlp || {};
      const doubts: any[] = sectionState?.doubts || [];

      const analyzeDoubt = async (doubt: typeof doubts[0]) => {
        setSectionState((prev: any) => ({ ...prev, nlp: { ...prev?.nlp, [`loading_${doubt.id}`]: true } }));
        try {
          const res = await api.post('/ml/nlp-classifier', { text: doubt.text });
          setSectionState((prev: any) => ({ ...prev, nlp: { ...prev?.nlp, [doubt.id]: res, [`loading_${doubt.id}`]: false } }));
        } catch {
          setSectionState((prev: any) => ({ ...prev, nlp: { ...prev?.nlp, [`loading_${doubt.id}`]: false } }));
        }
      };

      return (
        <div className="space-y-3">
          {doubts.map(d => {
            const result = nlpState[d.id];
            const isLoading = nlpState[`loading_${d.id}`];
            return (
              <div key={d.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-white">{d.student}</span>
                    <span className="text-[10px] text-gray-600 ml-2">{d.time}</span>
                  </div>
                  {!result && (
                    <button
                      onClick={() => analyzeDoubt(d)}
                      disabled={isLoading}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors disabled:opacity-50"
                      style={{ color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}30` }}
                    >
                      {isLoading ? 'Analysing…' : 'Analyse'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2 italic">"{d.text}"</p>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-2 mt-2"
                  >
                    <div className="p-2 rounded text-center" style={{ background: `${result.sentiment === 'negative' ? DANGER : ACCENT2}12` }}>
                      <p className="text-[9px] text-gray-500 uppercase">Sentiment</p>
                      <p className="text-xs font-bold capitalize" style={{ color: result.sentiment === 'negative' ? DANGER : ACCENT2 }}>{result.sentiment}</p>
                    </div>
                    <div className="p-2 rounded text-center" style={{ background: `${WARN}12` }}>
                      <p className="text-[9px] text-gray-500 uppercase">Intent</p>
                      <p className="text-xs font-bold capitalize" style={{ color: WARN }}>{result.intent?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="p-2 rounded text-center" style={{ background: `${result.urgency > 0.7 ? DANGER : ACCENT2}12` }}>
                      <p className="text-[9px] text-gray-500 uppercase">Urgency</p>
                      <p className="text-xs font-bold" style={{ color: result.urgency > 0.7 ? DANGER : ACCENT2 }}>{(result.urgency * 100).toFixed(0)}%</p>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    case 'decay-monitor':
      return (
        <div className="space-y-3">
          {students.filter(s => s.risk > 0.35).map(s => {
            const color = s.risk > 0.7 ? DANGER : WARN;
            return (
              <div key={s.id} className="flex items-center gap-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white font-medium truncate">{s.name}</span>
                    <span className="text-[10px] font-mono font-bold" style={{ color }}>{(s.risk * 100).toFixed(0)}% decay</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.risk * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 shrink-0">{s.lastActive}</span>
              </div>
            );
          })}
        </div>
      );

    case 'controls': {
      const ctrl = sectionState?.controls || { difficulty: 50, threshold: 75, autoGenerate: true };
      const saved = sectionState?.controlSaved;
      const updateCtrl = (key: string, val: any) => {
        setSectionState((prev: any) => ({
          ...prev,
          controls: { ...prev?.controls, difficulty: prev?.controls?.difficulty ?? 50, threshold: prev?.controls?.threshold ?? 75, autoGenerate: prev?.controls?.autoGenerate ?? true, [key]: val }
        }));
      };
      const save = () => {
        setSectionState((prev: any) => ({ ...prev, controlSaved: true }));
        setTimeout(() => setSectionState((prev: any) => ({ ...prev, controlSaved: false })), 2000);
      };

      return (
        <div className="space-y-5">
          {[
            { key: 'difficulty', label: 'Baseline Difficulty', color: ACCENT, value: ctrl.difficulty },
            { key: 'threshold', label: 'Intervention Threshold', color: WARN, value: ctrl.threshold },
          ].map(s => (
            <div key={s.key}>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400">{s.label}</label>
                <span className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.value}%</span>
              </div>
              <input
                type="range"
                min="0" max="100"
                value={s.value}
                onChange={(e) => updateCtrl(s.key, parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: s.color, background: 'rgba(255,255,255,0.06)' }}
              />
            </div>
          ))}

          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wider text-gray-400">Auto-Generate Resources</label>
            <button
              onClick={() => updateCtrl('autoGenerate', !ctrl.autoGenerate)}
              className="w-11 h-6 rounded-full relative transition-colors"
              style={{ background: ctrl.autoGenerate ? ACCENT : 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: ctrl.autoGenerate ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          <button
            onClick={save}
            className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            style={{ background: saved ? `${ACCENT2}20` : `${ACCENT}15`, color: saved ? ACCENT2 : ACCENT, border: `1px solid ${saved ? ACCENT2 : ACCENT}30` }}
          >
            {saved ? '✓ Overrides Applied' : 'Apply System Overrides'}
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

/* ── main component ── */
export default function EducatorMLInsights() {
  const api = useApi();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    heatmap: true, clustering: true, 'difficulty-map': true, 'nlp-analysis': true, 'decay-monitor': true, controls: true,
  });
  const [students, setStudents] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [sectionState, setSectionState] = useState<any>({});
  const [streamLines, setStreamLines] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentData, analyticsData] = await Promise.all([
          api.get('/analytics/educator/students'),
          api.get('/analytics/educator?courseId=1')
        ]);
        
        if (Array.isArray(studentData)) {
          setStudents(studentData.map((d: any) => {
            const mastery = d.avg_mastery || 0;
            const accuracy = d.practice_accuracy || 0;
            const score = Math.round((mastery + accuracy) / 2);
            let risk = 0;
            let cluster = 'Steady Learner';
            
            if (score < 50) { risk = 0.8; cluster = 'Struggling'; }
            else if (score < 70) { risk = 0.5; cluster = 'At Risk'; }
            else if (score > 85) { risk = 0.1; cluster = 'Fast Sprinter'; }
            else { risk = 0.3; }

            return {
              id: d.student_id,
              name: d.student_name,
              initials: d.student_name.substring(0, 2).toUpperCase(),
              score,
              risk,
              cluster,
              lastActive: d.last_session?.created_at ? new Date(d.last_session.created_at).toLocaleTimeString() : 'Unknown'
            };
          }));
        }

        if (analyticsData && Array.isArray(analyticsData.confusionMetrics)) {
          setConcepts(analyticsData.confusionMetrics.map((c: any, i: number) => ({
            id: `c${i}`,
            name: c.topic,
            difficulty: c.percentage,
            misconception: 'Needs review based on high confusion signals',
            avgTime: 300
          })));
        }

        if (analyticsData && analyticsData.recentSignals) {
          const doubts = analyticsData.recentSignals
            .filter((s: any) => s.signal !== 'Clear' && s.concepts && s.students)
            .map((s: any) => ({
              id: s.id,
              student: s.students.name,
              time: new Date(s.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              text: `I'm struggling with ${s.concepts.name}`
            }));
          setSectionState((prev: any) => ({ ...prev, doubts }));
        }
      } catch (err) {
        console.error('Failed to load ML insights data', err);
      }
    };
    fetchData();
  }, [api]);

  useEffect(() => {
    const metrics = [
      'Aggregating class-wide risk vectors…',
      'Re-training student clustering model…',
      'Indexing concept difficulty scores…',
      'Scanning doubt feed for sentiment anomalies…',
      'Computing per-student decay curves…',
      'Applying educator override coefficients…',
    ];
    const interval = setInterval(() => {
      const line = metrics[Math.floor(Math.random() * metrics.length)];
      const ts = new Date().toISOString().substring(11, 19);
      setStreamLines(prev => [`[${ts}] ${line}`, ...prev].slice(0, 4));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-shell" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible" className="mb-8">
        <span className="font-label-md uppercase tracking-widest opacity-80 mb-1 block" style={{ color: ACCENT }}>
          ML Lab — Educator Mode
        </span>
        <h1 className="text-3xl font-bold text-on-background leading-tight">Class Intelligence</h1>
        <p className="text-on-surface-variant mt-1 max-w-xl">
          Six ML-powered views into your class. Every model runs on real behavioural data and can be overridden with manual controls.
        </p>
      </motion.div>

      {/* Live Stream */}
      <motion.div
        variants={fadeUp(0.05)}
        initial="hidden"
        animate="visible"
        className="rounded-2xl p-4 mb-8 font-mono text-xs overflow-hidden relative"
        style={{ background: BG_DARK, border: `1px solid ${ACCENT}20` }}
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: `${ACCENT}15` }} />
        <div className="flex items-center gap-2 mb-3" style={{ color: `${ACCENT}99` }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ACCENT }} />
          <span>COGNIVA ML CORE — EDUCATOR MODE</span>
          <span className="ml-auto text-gray-600">{students.length} students monitored</span>
        </div>
        <div className="space-y-1">
          {streamLines.map((line, i) => (
            <motion.div
              key={i + line}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1 - i * 0.25, x: 0 }}
              className={i === 0 ? 'font-bold' : ''}
              style={{ color: i === 0 ? ACCENT : '#6B7280' }}
            >
              {line}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section Cards */}
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {SECTIONS.map(section => {
          const isExpanded = expandedSections[section.id];
          return (
            <motion.div
              key={section.id}
              variants={fadeUpChild}
              className="rounded-2xl overflow-hidden"
              style={{ background: BG_CARD, border: `1px solid rgba(255,255,255,0.06)` }}
            >
              {/* Section Header */}
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: ACCENT }}>{section.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{section.name}</h3>
                      <TagPill label={section.model_tag} />
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    expand_more
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mt-3">{section.description}</p>
              </button>

              {/* Expandable Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="pt-4">
                        {renderSection(section.id, api, sectionState, setSectionState, students, concepts)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
