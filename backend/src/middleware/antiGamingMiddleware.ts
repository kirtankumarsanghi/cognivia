import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

/**
 * Anti-Gaming Rate Limits Middleware
 * 
 * Features:
 * 1. Per-student cooldowns - Prevents rapid-fire submissions
 * 2. Diminishing weight on repeat taps - Reduces impact of repeated attempts
 * 3. Anomaly detection - Flags coordinated spikes across students
 */

interface AntiGamingConfig {
  // Cooldown period in seconds between attempts
  cooldownSeconds: number;
  // Minimum time window to consider for diminishing returns (in seconds)
  diminishingWindowSeconds: number;
  // Maximum attempts in the diminishing window before flagging
  maxAttemptsInWindow: number;
  // Anomaly detection: spike threshold (attempts per minute across all students)
  spikeThreshold: number;
}

const DEFAULT_CONFIG: AntiGamingConfig = {
  cooldownSeconds: 5,
  diminishingWindowSeconds: 60,
  maxAttemptsInWindow: 10,
  spikeThreshold: 50, // 50+ attempts per minute = suspicious
};

// In-memory cache for rate limiting (in production, use Redis)
const rateLimitCache = new Map<string, {
  lastAttempt: Date;
  recentAttempts: Date[];
  violationCount: number;
}>();

// Global anomaly detection tracker
let globalAttemptTimestamps: Date[] = [];

/**
 * Clean up old timestamps from global tracker
 */
function cleanupGlobalTracker() {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  globalAttemptTimestamps = globalAttemptTimestamps.filter(
    timestamp => timestamp > oneMinuteAgo
  );
}

/**
 * Check if there's a coordinated spike happening
 */
async function detectAnomalySpike(): Promise<boolean> {
  cleanupGlobalTracker();
  
  const attemptsPerMinute = globalAttemptTimestamps.length;
  
  if (attemptsPerMinute >= DEFAULT_CONFIG.spikeThreshold) {
    // Log the anomaly
    console.warn(`⚠️ ANOMALY DETECTED: ${attemptsPerMinute} attempts/minute (threshold: ${DEFAULT_CONFIG.spikeThreshold})`);
    
    try {
      const { error } = await supabaseAdmin.from('rate_limit_violations').insert({
        violation_type: 'coordinated_spike',
        details: {
          attempts_per_minute: attemptsPerMinute,
          threshold: DEFAULT_CONFIG.spikeThreshold,
          timestamp: new Date().toISOString()
        }
      });
      if (error) console.error('Failed to log anomaly:', error);
    } catch (err: any) {
      console.error('Exception logging anomaly:', err);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Calculate diminishing weight for an attempt based on recent activity
 */
function calculateDiminishingWeight(recentAttempts: Date[]): number {
  const windowStart = new Date(Date.now() - DEFAULT_CONFIG.diminishingWindowSeconds * 1000);
  const attemptsInWindow = recentAttempts.filter(t => t > windowStart);
  
  // Linear diminishing: 1.0 -> 0.1 as attempts increase
  const weight = Math.max(
    0.1,
    1.0 - (attemptsInWindow.length / DEFAULT_CONFIG.maxAttemptsInWindow) * 0.9
  );
  
  return weight;
}

/**
 * Main anti-gaming middleware
 */
export const antiGamingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.id;
  const { concept_id } = req.body;
  
  if (!userId || !concept_id) {
    return next();
  }
  
  const cacheKey = `${userId}:${concept_id}`;
  const now = new Date();
  
  // Initialize or get user's rate limit data
  if (!rateLimitCache.has(cacheKey)) {
    rateLimitCache.set(cacheKey, {
      lastAttempt: new Date(0),
      recentAttempts: [],
      violationCount: 0
    });
  }
  
  const userLimitData = rateLimitCache.get(cacheKey)!;
  
  // 1. Check cooldown period
  const timeSinceLastAttempt = (now.getTime() - userLimitData.lastAttempt.getTime()) / 1000;
  
  if (timeSinceLastAttempt < DEFAULT_CONFIG.cooldownSeconds) {
    const waitTime = Math.ceil(DEFAULT_CONFIG.cooldownSeconds - timeSinceLastAttempt);
    
    // Log violation
    userLimitData.violationCount++;
    
    // Store violation in database
    try {
      const { error } = await supabaseAdmin.from('rate_limit_violations').insert({
        student_id: userId,
        concept_id,
        violation_type: 'cooldown_violation',
        details: {
          time_since_last: timeSinceLastAttempt,
          required_cooldown: DEFAULT_CONFIG.cooldownSeconds,
          violation_count: userLimitData.violationCount
        }
      });
      if (error) console.error('Failed to log violation:', error);
    } catch (err: any) {
      console.error('Exception logging violation:', err);
    }
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Please wait ${waitTime} seconds before submitting another answer.`,
      waitTime,
      type: 'cooldown'
    });
  }
  
  // 2. Calculate diminishing weight
  const weight = calculateDiminishingWeight(userLimitData.recentAttempts);
  
  if (weight < 0.5) {
    console.warn(`⚠️ Diminishing returns triggered for user ${userId}: weight = ${weight.toFixed(2)}`);
  }
  
  // 3. Check for anomaly spikes
  globalAttemptTimestamps.push(now);
  const isAnomalyDetected = await detectAnomalySpike();
  
  if (isAnomalyDetected) {
    // Don't block, but flag for review and reduce weight
    console.warn(`🚨 Anomaly spike detected while user ${userId} submitted attempt`);
    (req as any).antiGaming = {
      weight: weight * 0.5, // Reduce weight further during anomaly
      anomalyDetected: true
    };
  } else {
    (req as any).antiGaming = {
      weight,
      anomalyDetected: false
    };
  }
  
  // 4. Update rate limit data
  userLimitData.lastAttempt = now;
  userLimitData.recentAttempts.push(now);
  
  // Clean up old attempts from the sliding window
  const windowStart = new Date(now.getTime() - DEFAULT_CONFIG.diminishingWindowSeconds * 1000);
  userLimitData.recentAttempts = userLimitData.recentAttempts.filter(t => t > windowStart);
  
  // 5. Check if user is spamming (exceeding max attempts in window)
  if (userLimitData.recentAttempts.length > DEFAULT_CONFIG.maxAttemptsInWindow) {
    userLimitData.violationCount++;
    
    try {
      const { error } = await supabaseAdmin.from('rate_limit_violations').insert({
        student_id: userId,
        concept_id,
        violation_type: 'spam_detection',
        details: {
          attempts_in_window: userLimitData.recentAttempts.length,
          max_allowed: DEFAULT_CONFIG.maxAttemptsInWindow,
          window_seconds: DEFAULT_CONFIG.diminishingWindowSeconds,
          violation_count: userLimitData.violationCount
        }
      });
      if (error) console.error('Failed to log spam violation:', error);
    } catch (err: any) {
      console.error('Exception logging spam violation:', err);
    }
    
    return res.status(429).json({
      error: 'Too many attempts',
      message: `You've made too many attempts in a short time. Please take a break and try again later.`,
      type: 'spam',
      attemptsInWindow: userLimitData.recentAttempts.length,
      maxAllowed: DEFAULT_CONFIG.maxAttemptsInWindow
    });
  }
  
  // Add metadata to request for downstream handlers
  (req as any).antiGamingMetadata = {
    weight,
    recentAttempts: userLimitData.recentAttempts.length,
    violationCount: userLimitData.violationCount,
    anomalyDetected: isAnomalyDetected,
    timeSinceLastAttempt
  };
  
  next();
};

/**
 * Middleware to apply diminishing weight to mastery calculations
 */
export const applyDiminishingWeight = (req: Request, res: Response, next: NextFunction) => {
  const antiGaming = (req as any).antiGaming;
  
  if (antiGaming && antiGaming.weight < 1.0) {
    // Reduce the impact of this attempt on mastery score
    (req as any).masteryWeightModifier = antiGaming.weight;
    
    console.log(`📉 Applying diminishing weight: ${antiGaming.weight.toFixed(2)}x for this attempt`);
  }
  
  next();
};

/**
 * Get rate limit status for a user
 */
export const getRateLimitStatus = (userId: string, conceptId: string) => {
  const cacheKey = `${userId}:${conceptId}`;
  const data = rateLimitCache.get(cacheKey);
  
  if (!data) {
    return {
      canSubmit: true,
      weight: 1.0,
      recentAttempts: 0,
      violationCount: 0
    };
  }
  
  const now = new Date();
  const timeSinceLastAttempt = (now.getTime() - data.lastAttempt.getTime()) / 1000;
  const canSubmit = timeSinceLastAttempt >= DEFAULT_CONFIG.cooldownSeconds;
  const weight = calculateDiminishingWeight(data.recentAttempts);
  
  return {
    canSubmit,
    weight,
    recentAttempts: data.recentAttempts.length,
    violationCount: data.violationCount,
    cooldownRemaining: canSubmit ? 0 : Math.ceil(DEFAULT_CONFIG.cooldownSeconds - timeSinceLastAttempt)
  };
};

/**
 * Reset rate limit for a user (admin function)
 */
export const resetRateLimit = (userId: string, conceptId: string) => {
  const cacheKey = `${userId}:${conceptId}`;
  rateLimitCache.delete(cacheKey);
};

/**
 * Get global anomaly statistics
 */
export const getAnomalyStats = () => {
  cleanupGlobalTracker();
  
  return {
    attemptsPerMinute: globalAttemptTimestamps.length,
    threshold: DEFAULT_CONFIG.spikeThreshold,
    isAnomalyActive: globalAttemptTimestamps.length >= DEFAULT_CONFIG.spikeThreshold
  };
};
