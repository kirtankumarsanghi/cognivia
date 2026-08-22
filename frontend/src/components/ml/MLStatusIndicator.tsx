import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../../hooks/useApi';

interface MLStatusIndicatorProps {
  position?: 'fixed' | 'inline';
  showDetails?: boolean;
}

export default function MLStatusIndicator({ position = 'fixed', showDetails = false }: MLStatusIndicatorProps) {
  const api = useApi();
  const [mlStatus, setMlStatus] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await api.get('/analytics/ml-status');
        setMlStatus(status);
      } catch (error) {
        console.error('Failed to fetch ML status:', error);
        setMlStatus({ available: false, message: 'Offline' });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const isOnline = mlStatus?.available;
  const modelCount = mlStatus?.models ? Object.keys(mlStatus.models).length : 0;

  const positionClasses = position === 'fixed'
    ? 'fixed bottom-6 right-6 z-50'
    : 'relative';

  return (
    <div className={positionClasses}>
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all ${
          isOnline
            ? 'bg-[#2AD4AE]/10 border-[#2AD4AE]/30 text-[#2AD4AE] hover:bg-[#2AD4AE]/20'
            : 'bg-surface-bright/50 border-outline-variant/30 text-on-surface-variant hover:bg-surface-bright/70'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isOnline ? 'bg-[#2AD4AE]' : 'bg-outline-variant'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${
            isOnline ? 'bg-[#2AD4AE]' : 'bg-outline-variant'
          }`}></span>
        </span>
        <span className="font-label-sm uppercase tracking-wider">
          ML {isOnline ? 'Active' : 'Offline'}
        </span>
        {showDetails && modelCount > 0 && (
          <span className="font-mono text-xs opacity-70">({modelCount} models)</span>
        )}
        <span className={`material-symbols-outlined text-[16px] transition-transform ${
          expanded ? 'rotate-180' : ''
        }`}>
          expand_more
        </span>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-80 bg-surface-container rounded-xl border border-outline-variant/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 border-b border-outline-variant/10 ${
              isOnline ? 'bg-[#2AD4AE]/5' : 'bg-surface-bright/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-label-md uppercase tracking-wider text-on-surface">
                  ML Engine Status
                </h3>
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                  isOnline
                    ? 'bg-[#2AD4AE]/20 text-[#2AD4AE]'
                    : 'bg-surface-bright text-on-surface-variant'
                }`}>
                  {isOnline ? 'OPERATIONAL' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">{mlStatus?.message}</p>
            </div>

            {/* Models List */}
            {isOnline && mlStatus?.models && (
              <div className="p-4 max-h-96 overflow-y-auto">
                <h4 className="font-label-sm uppercase tracking-wider text-outline mb-3">
                  Active Models
                </h4>
                <div className="space-y-2">
                  {Object.entries(mlStatus.models).map(([key, model]: [string, any]) => (
                    <div
                      key={key}
                      className="p-3 bg-surface-bright/50 rounded-lg border border-outline-variant/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-label-sm text-on-surface capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-[#2AD4AE] font-mono">
                          {model.version || 'v1.0'}
                        </span>
                      </div>
                      
                      {model.metrics && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {Object.entries(model.metrics).slice(0, 4).map(([metric, value]: [string, any]) => (
                            <div key={metric} className="text-xs">
                              <span className="text-outline capitalize">
                                {metric.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-on-surface ml-1 font-mono">
                                {typeof value === 'number' ? value.toFixed(3) : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {model.prediction_count !== undefined && (
                        <div className="mt-2 pt-2 border-t border-outline-variant/10">
                          <span className="text-xs text-outline">
                            Predictions: <span className="text-[#2AD4AE] font-mono">{model.prediction_count}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Message */}
            {!isOnline && (
              <div className="p-6 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">
                  cloud_off
                </span>
                <p className="text-sm text-on-surface-variant">
                  ML service is currently unavailable. The system is using fallback predictions.
                </p>
                <p className="text-xs text-outline mt-2">
                  Run <code className="bg-surface-bright px-2 py-1 rounded">start-ml-service.bat</code> to enable ML features.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
