import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/animation';

interface SessionTimelineProps {
  session: any;
  moments: any[];
  signals: any[];
}

export default function SessionTimeline({ session, moments, signals }: SessionTimelineProps) {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [hoveredBucket, setHoveredBucket] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;

    const startTime = new Date(session.started_at).getTime();
    const endTime = session.ended_at ? new Date(session.ended_at).getTime() : Date.now();
    const duration = (endTime - startTime) / 1000; // in seconds

    // Create 30-second buckets
    const bucketCount = Math.ceil(duration / 30);
    const newBuckets: any[] = [];

    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = i * 30;
      const bucketEnd = (i + 1) * 30;
      
      // Count signals in this bucket
      const signalsInBucket = signals.filter((s: any) => 
        s.lecture_timestamp_seconds >= bucketStart && 
        s.lecture_timestamp_seconds < bucketEnd &&
        s.signal === 'Confused'
      );

      // Find moments in this bucket
      const momentsInBucket = moments.filter((m: any) => 
        m.timestamp_seconds >= bucketStart && 
        m.timestamp_seconds < bucketEnd
      );

      newBuckets.push({
        index: i,
        start: bucketStart,
        end: bucketEnd,
        confusionCount: signalsInBucket.length,
        moments: momentsInBucket,
        signals: signalsInBucket
      });
    }

    setBuckets(newBuckets);
  }, [session, moments, signals]);

  if (!session || buckets.length === 0) {
    return null;
  }

  const maxConfusion = Math.max(...buckets.map(b => b.confusionCount), 1);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-surface-bright';
    const intensity = count / maxConfusion;
    if (intensity >= 0.7) return 'bg-error';
    if (intensity >= 0.4) return 'bg-[#E8A634]';
    return 'bg-error/30';
  };

  return (
    <motion.div
      variants={fadeUp(0.2)}
      initial="hidden"
      animate="visible"
      className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">timeline</span>
            Lecture Timeline Heatmap
          </h2>
          <p className="font-body-sm text-outline mt-1">
            {session.title} - {formatTime(Math.floor((session.ended_at ? new Date(session.ended_at).getTime() : Date.now() - new Date(session.started_at).getTime()) / 1000))} duration
          </p>
        </div>
        {!session.ended_at && (
          <div className="flex items-center gap-2 bg-error/10 px-3 py-2 rounded-lg border border-error/20">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
            <span className="font-label-sm text-error uppercase">Live</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Time markers */}
        <div className="flex justify-between mb-2 text-xs text-outline font-mono">
          <span>0:00</span>
          <span>{formatTime(buckets[buckets.length - 1]?.end || 0)}</span>
        </div>

        {/* Buckets */}
        <div className="flex gap-1 mb-4" style={{ height: '80px' }}>
          {buckets.map((bucket) => (
            <div
              key={bucket.index}
              className="flex-1 relative group"
              onMouseEnter={() => setHoveredBucket(bucket.index)}
              onMouseLeave={() => setHoveredBucket(null)}
            >
              <div
                className={`h-full rounded-sm ${getIntensityColor(bucket.confusionCount)} transition-all duration-200 cursor-pointer group-hover:opacity-80 relative overflow-hidden`}
              >
                {/* Moment markers overlay */}
                {bucket.moments.length > 0 && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary"></div>
                )}
              </div>

              {/* Tooltip */}
              {hoveredBucket === bucket.index && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
                  <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-3 shadow-2xl min-w-[200px]">
                    <div className="text-xs font-mono text-primary mb-2">
                      {formatTime(bucket.start)} - {formatTime(bucket.end)}
                    </div>
                    <div className="text-sm text-on-surface mb-2">
                      <span className="font-semibold">{bucket.confusionCount}</span> confusion signal{bucket.confusionCount !== 1 ? 's' : ''}
                    </div>
                    {bucket.moments.length > 0 && (
                      <div className="border-t border-outline-variant/20 pt-2 mt-2">
                        <div className="text-xs text-primary font-semibold mb-1">Teaching Moment:</div>
                        {bucket.moments.map((m: any, idx: number) => (
                          <div key={idx} className="text-xs text-on-surface-variant">
                            • {m.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-surface-container border-r border-b border-outline-variant/20 transform rotate-45 mx-auto -mt-1"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-outline">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-error"></div>
            <span>High confusion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#E8A634]"></div>
            <span>Medium confusion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-error/30"></div>
            <span>Low confusion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-primary"></div>
            <span>Teaching moment marker</span>
          </div>
        </div>

        {/* Moment Labels */}
        {moments.length > 0 && (
          <div className="mt-6 border-t border-outline-variant/10 pt-4">
            <h3 className="font-label-sm text-outline uppercase tracking-wider mb-3">Teaching Moments</h3>
            <div className="space-y-2">
              {moments.map((moment: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-primary min-w-[50px]">
                    {formatTime(moment.timestamp_seconds)}
                  </span>
                  <div className="flex-1 bg-surface-bright px-3 py-2 rounded-lg">
                    <span className="text-on-surface">{moment.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
