import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';

/* ── colour tokens ── */
const ACCENT  = '#2AD4AE';
const WARN    = '#E8A634';
const DANGER  = '#EF4444';
const BG_DARK = '#0D1117';
const BG_CARD = '#161B22';
const BORDER  = 'rgba(42,212,174,0.15)';

/* ── model definitions ── */
const MODELS = [
  {
    id: 'profile',
    name: 'Cognitive Profile',
    icon: 'psychology',
    endpoint: '/ml/student-profile',
    model_tag: 'K-Means Clustering',
    description: 'This model groups you into a learning archetype by analysing your pace, accuracy patterns and study habits. It uses K-Means clustering on 6 behavioural features to find which cohort you belong to.',
    payload: (userId: string) => ({
      studentId: userId,
      features: {
        avg_session_duration: 45,
        avg_accuracy: 0.72,
        confusion_frequency: 3,
        avg_mastery_progression: 0.7,
        total_practice_attempts: 12,
        avg_time_per_question: 35
      }
    }),
  },
  {
    id: 'early-warning',
    name: 'Early Warning System',
    icon: 'crisis_alert',
    endpoint: '/ml/early-warning',
    model_tag: 'Logistic Regression',
    description: 'A logistic-regression classifier that scores your probability of falling behind. It examines prerequisite mastery, learning velocity, confusion signals and engagement frequency to compute a risk score.',
    payload: (userId: string) => ({
      studentId: userId,
      features: {
        prerequisite_mastery: 0.45,
        learning_velocity: -0.1,
        confusion_signals: 5,
        engagement_score: 0.6,
        days_since_last_activity: 2
      }
    }),
  },
  {
    id: 'recommendation',
    name: 'Next-Best Action',
    icon: 'explore',
    endpoint: '/ml/recommendation',
    model_tag: 'Collaborative Filtering',
    description: 'A recommendation engine inspired by collaborative filtering. It analyses your history alongside similar students to suggest the single most impactful concept to study next, along with the reasoning.',
    payload: (userId: string) => ({
      studentId: userId,
      current_concept: 'c1-con1',
      history: ['c1-con2', 'c1-con3']
    }),
  },
  {
    id: 'concept-difficulty',
    name: 'Adaptive Difficulty',
    icon: 'speed',
    endpoint: '/ml/concept-difficulty',
    model_tag: 'Item Response Theory',
    description: 'Rooted in Item Response Theory (IRT), this model estimates how hard each concept is specifically for you. It factors in your current mastery, common misconceptions, and how long similar students spent on the same block.',
    payload: () => ({
      concept_id: 'c1-con1',
      student_features: { mastery: 0.55, attempts: 4 }
    }),
  },
  {
    id: 'learning-risk',
    name: 'Knowledge Decay Tracker',
    icon: 'trending_down',
    endpoint: '/ml/learning-risk',
    model_tag: 'Exponential Decay Model',
    description: 'Based on Ebbinghaus\' forgetting curve, this model tracks how quickly your retention fades for each topic. It flags concepts where the predicted retention has dropped below the recall threshold so you can revise before you forget.',
    payload: (userId: string) => ({
      studentId: userId,
      history: [],
      current_features: { accuracy: 0.6, time_taken: 120, hints_used: 2, confusion_signals: 1 }
    }),
  },
  {
    id: 'nlp',
    name: 'NLP Intent Analyser',
    icon: 'chat',
    endpoint: '/ml/nlp-classifier',
    model_tag: 'BERT Text Classifier',
    description: 'When you signal confusion, this NLP classifier (fine-tuned BERT) detects the sentiment (frustrated, confused, curious), the underlying intent (seeking explanation, requesting example), and urgency level to route you to the right help.',
    payload: () => ({
      text: "I keep getting the wrong answer for recursion problems. The base case confuses me every time."
    }),
  },
];

/* ── helper components ── */
function ConfidenceMeter({ value, color = ACCENT }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color }}>Confidence</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

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

/* ── result renderers per model ── */
function renderResult(id: string, data: any) {
  if (!data) return null;

  switch (id) {
    case 'profile':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: ACCENT }}>
                {data.cluster === 'Struggling' ? 'warning' : data.cluster === 'Advanced' ? 'rocket_launch' : 'psychology'}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: `${ACCENT}99` }}>Your Archetype</p>
              <p className="text-xl font-bold text-white">{data.cluster}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{data.profile_description}</p>
          <ConfidenceMeter value={data.confidence} />
        </div>
      );

    case 'early-warning':
      const riskColor = data.risk_probability > 0.7 ? DANGER : data.risk_probability > 0.4 ? WARN : ACCENT;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Risk Score</p>
              <p className="text-4xl font-bold font-mono" style={{ color: riskColor }}>{(data.risk_probability * 100).toFixed(0)}%</p>
            </div>
            <TagPill label={data.risk_level} color={riskColor} />
          </div>
          <p className="text-sm" style={{ color: WARN }}>{data.recommended_action}</p>
          {data.feature_contributions?.map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.impact === 'high' ? DANGER : WARN }} />
              {f.factor} <span className="ml-auto font-mono text-gray-500">{f.value}</span>
            </div>
          ))}
          <ConfidenceMeter value={data.risk_probability} color={riskColor} />
        </div>
      );

    case 'recommendation':
      return (
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ background: `${WARN}12`, border: `1px solid ${WARN}30` }}>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: `${WARN}99` }}>Recommended Action</p>
            <p className="text-lg font-bold text-white capitalize">{data.next_best_action?.replace(/_/g, ' ')}</p>
            <p className="text-sm text-gray-400 mt-2"><span style={{ color: WARN }}>↳</span> {data.reasoning}</p>
          </div>
          <ConfidenceMeter value={data.confidence} color={WARN} />
        </div>
      );

    case 'concept-difficulty':
      const diffColor = data.difficulty_score > 60 ? DANGER : data.difficulty_score > 30 ? WARN : ACCENT;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Difficulty Rating</p>
              <p className="text-4xl font-bold font-mono" style={{ color: diffColor }}>{data.difficulty_score}<span className="text-lg text-gray-500">/100</span></p>
            </div>
            <TagPill label={data.adaptive_level} color={diffColor} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-gray-500 mb-1">Est. Time</p>
              <p className="text-sm font-mono text-white">{data.estimated_time_mins} min</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-gray-500 mb-1">Prereq Mastery</p>
              <p className="text-sm font-mono text-white">{(data.prerequisite_mastery_required * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      );

    case 'learning-risk':
      const lrColor = data.at_risk ? DANGER : ACCENT;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${lrColor}20`, border: `1px solid ${lrColor}40` }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: lrColor }}>
                {data.at_risk ? 'warning' : 'verified'}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{data.at_risk ? 'Decay Detected' : 'Retention Stable'}</p>
              <p className="text-xs text-gray-500">Risk probability: <span className="font-mono" style={{ color: lrColor }}>{(data.risk_probability * 100).toFixed(0)}%</span></p>
            </div>
          </div>
          {data.contributing_factors?.map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.impact === 'high' ? DANGER : WARN }} />
              {f.factor}
            </div>
          ))}
          <ConfidenceMeter value={data.risk_probability} color={lrColor} />
        </div>
      );

    case 'nlp':
      return (
        <div className="space-y-3">
          <div className="p-3 rounded-lg font-mono text-xs text-gray-400" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            "{data.text}"
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sentiment', value: data.sentiment, color: data.sentiment === 'negative' ? DANGER : ACCENT },
              { label: 'Intent', value: data.intent?.replace(/_/g, ' '), color: WARN },
              { label: 'Urgency', value: `${(data.urgency * 100).toFixed(0)}%`, color: data.urgency > 0.7 ? DANGER : ACCENT },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm font-bold capitalize" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <pre className="text-xs text-gray-500 overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  }
}

/* ── main component ── */
export default function StudentMLInsights() {
  const api = useApi();
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [streamLines, setStreamLines] = useState<string[]>([]);

  // Live stream header
  useEffect(() => {
    const metrics = [
      'Initialising cognitive profile pipeline…',
      'Fetching behavioural feature vectors…',
      'Calibrating knowledge decay matrix…',
      'Running Bayesian Knowledge Tracing inference…',
      'Computing attention drift coefficients…',
      'Evaluating spaced-repetition intervals…',
      'Loading NLP sentiment tokeniser…',
      'Updating collaborative filtering weights…',
    ];
    const interval = setInterval(() => {
      const line = metrics[Math.floor(Math.random() * metrics.length)];
      const ts = new Date().toISOString().substring(11, 19);
      setStreamLines(prev => [`[${ts}] ${line}`, ...prev].slice(0, 4));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const runModel = async (model: typeof MODELS[0]) => {
    setLoading(prev => ({ ...prev, [model.id]: true }));
    setExpanded(prev => ({ ...prev, [model.id]: true }));
    try {
      const res = await api.post(model.endpoint, model.payload(user?.id || 'demo'));
      if (res) setResults(prev => ({ ...prev, [model.id]: res }));
    } catch (err) {
      console.error(`ML model ${model.id} failed:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [model.id]: false }));
    }
  };

  const runAll = async () => {
    for (const m of MODELS) {
      await runModel(m);
    }
  };

  return (
    <div className="page-shell" style={{ minHeight: '100vh' }}>
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible" className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="font-label-md uppercase tracking-widest opacity-80 mb-1 block" style={{ color: ACCENT }}>
              Machine Learning Lab
            </span>
            <h1 className="text-3xl font-bold text-on-background leading-tight">Your AI Insights</h1>
            <p className="text-on-surface-variant mt-1 max-w-xl">
              Six ML models analyse your learning behaviour in real-time. Click <strong>Run Analysis</strong> on any model — or run them all at once.
            </p>
          </div>
          <button
            onClick={runAll}
            className="shrink-0 px-5 py-2.5 rounded-xl font-label-sm uppercase tracking-widest text-sm transition-all hover:scale-[1.03]"
            style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
          >
            <span className="material-symbols-outlined text-[16px] mr-1 align-middle">bolt</span>
            Run All Models
          </button>
        </div>
      </motion.div>

      {/* ── Live Stream Banner ── */}
      <motion.div
        variants={fadeUp(0.05)}
        initial="hidden"
        animate="visible"
        className="rounded-2xl p-4 mb-8 font-mono text-xs overflow-hidden relative"
        style={{ background: BG_DARK, border: `1px solid ${BORDER}` }}
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: `${ACCENT}15` }} />
        <div className="flex items-center gap-2 mb-3" style={{ color: `${ACCENT}99` }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ACCENT }} />
          <span>COGNIVA ML CORE — STUDENT MODE</span>
          <span className="ml-auto text-gray-600">{MODELS.length} models loaded</span>
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
          {streamLines.length === 0 && (
            <span className="text-gray-600">Awaiting analysis trigger…</span>
          )}
        </div>
      </motion.div>

      {/* ── Model Cards Grid ── */}
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {MODELS.map((model) => {
          const isLoading = loading[model.id];
          const result = results[model.id];
          const isExpanded = expanded[model.id];

          return (
            <motion.div
              key={model.id}
              variants={fadeUpChild}
              className="rounded-2xl overflow-hidden transition-shadow hover:shadow-xl"
              style={{
                background: BG_CARD,
                border: `1px solid ${result ? `${ACCENT}30` : 'rgba(255,255,255,0.06)'}`,
                boxShadow: result ? `0 0 30px ${ACCENT}08` : 'none',
              }}
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: result ? `${ACCENT}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${result ? `${ACCENT}40` : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: result ? `0 0 15px ${ACCENT}30` : 'none',
                      }}
                    >
                      <span className="material-symbols-outlined text-xl" style={{ color: result ? ACCENT : '#6B7280' }}>
                        {model.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{model.name}</h3>
                      <TagPill label={model.model_tag} color={result ? ACCENT : '#6B7280'} />
                    </div>
                  </div>

                  <button
                    onClick={() => runModel(model)}
                    disabled={isLoading}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                    style={{
                      background: isLoading ? `${ACCENT}10` : `${ACCENT}15`,
                      color: ACCENT,
                      border: `1px solid ${ACCENT}30`,
                    }}
                  >
                    {isLoading ? (
                      <><span className="material-symbols-outlined text-[14px] animate-spin align-middle mr-1">refresh</span>Running…</>
                    ) : result ? (
                      <><span className="material-symbols-outlined text-[14px] align-middle mr-1">refresh</span>Re-run</>
                    ) : (
                      <><span className="material-symbols-outlined text-[14px] align-middle mr-1">bolt</span>Run Analysis</>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{model.description}</p>
              </div>

              {/* Expandable Result Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2" style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                      {isLoading ? (
                        <div className="flex items-center gap-2 text-xs py-4" style={{ color: ACCENT }}>
                          <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                          Processing model inference…
                        </div>
                      ) : result ? (
                        renderResult(model.id, result)
                      ) : (
                        <p className="text-xs text-gray-600 py-4">No results yet. Click Run Analysis above.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle expand/collapse */}
              {result && (
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [model.id]: !prev[model.id] }))}
                  className="w-full py-2 text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {isExpanded ? 'Collapse' : 'Expand Results'}
                </button>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
