/**
 * ML Insights Widget - Shows ML predictions throughout the website
 * Can be embedded in dashboards, concept pages, etc.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface MLInsight {
  type: 'profile' | 'early_warning' | 'confusion_risk' | 'recommendation' | 'learning_risk';
  data: any;
  loading: boolean;
}

interface MLInsightsWidgetProps {
  conceptId?: string;
  variant?: 'compact' | 'full';
  showTypes?: string[]; // Which ML insights to show
}

export default function MLInsightsWidget({ 
  conceptId, 
  variant = 'compact',
  showTypes = ['profile', 'early_warning', 'learning_risk']
}: MLInsightsWidgetProps) {
  const api = useApi();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user && showTypes.length > 0) {
      loadInsights();
    }
  }, [user, conceptId]);

  const loadInsights = async () => {
    setLoading(true);
    const results: Record<string, any> = {};

    try {
      // Load student profile if requested
      if (showTypes.includes('profile')) {
        const profileData = await api.post('/api/ml/student-profile', {});
        if (profileData) results.profile = profileData;
      }

      // Load early warning if requested
      if (showTypes.includes('early_warning')) {
        const warningData = await api.post('/api/ml/early-warning', {});
        if (warningData) results.early_warning = warningData;
      }

      // Load learning risk if requested
      if (showTypes.includes('learning_risk')) {
        const riskData = await api.post('/api/ml/learning-risk', {});
        if (riskData) results.learning_risk = riskData;
      }

      setInsights(results);
    } catch (error) {
      console.error('Error loading ML insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 text-sm text-outline">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading ML insights...</span>
        </div>
      </div>
    );
  }

  if (Object.keys(insights).length === 0) {
    return null;
  }

  return (
    <div className={`card ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-accent">smart_toy</span>
          <h3 className="font-bold text-lg">AI Insights</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-outline hover:text-on-surface transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Student Profile */}
        {insights.profile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-surface-variant/30 border border-surface-variant"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm text-primary">psychology</span>
              <span className="text-xs font-bold uppercase tracking-wide text-primary">Learning Profile</span>
            </div>
            <p className="text-sm font-bold">{insights.profile.cluster}</p>
            {expanded && (
              <p className="text-xs text-outline mt-1 leading-relaxed">
                {insights.profile.profile_description}
              </p>
            )}
          </motion.div>
        )}

        {/* Early Warning */}
        {insights.early_warning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-3 rounded-lg border ${
              insights.early_warning.risk_level === 'high'
                ? 'bg-red-500/10 border-red-500/30'
                : insights.early_warning.risk_level === 'medium'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm text-amber-400">crisis_alert</span>
              <span className="text-xs font-bold uppercase tracking-wide text-amber-400">Risk Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{insights.early_warning.risk_level.toUpperCase()}</span>
              <span className="text-sm font-mono text-outline">{insights.early_warning.risk_percentage}%</span>
            </div>
            {expanded && insights.early_warning.recommended_action && (
              <p className="text-xs text-outline mt-2 leading-relaxed">
                {insights.early_warning.recommended_action}
              </p>
            )}
          </motion.div>
        )}

        {/* Learning Risk (Knowledge Decay) */}
        {insights.learning_risk && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-3 rounded-lg border ${
              insights.learning_risk.at_risk
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm text-blue-400">trending_down</span>
              <span className="text-xs font-bold uppercase tracking-wide text-blue-400">Retention</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                {insights.learning_risk.at_risk ? 'Decay Detected' : 'Stable'}
              </span>
              <span className="text-sm font-mono text-outline">
                {Math.round(insights.learning_risk.risk_probability * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-4 pt-4 border-t border-surface-variant">
        <a
          href="/ml-insights"
          className="text-xs font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
        >
          <span>View Full ML Analysis</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
