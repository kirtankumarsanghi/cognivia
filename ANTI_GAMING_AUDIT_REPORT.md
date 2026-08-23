# Anti-Gaming Rate Limits - Implementation Audit Report

## Executive Summary

The pitch deck claims: **"Anti-Gaming Rate Limits: Per-student cooldowns, diminishing weight on repeat taps, and anomaly detection flag coordinated spikes."**

**Overall Verdict: PARTIALLY IMPLEMENTED**
- ✅ **Cooldowns**: Fully implemented for practice attempts only
- ✅ **Diminishing Weight**: Fully implemented for practice attempts only  
- ⚠️ **Anomaly Detection**: Implemented but NOT connected to confusion signals
- ❌ **Critical Gap**: Confusion signals have ZERO anti-gaming protection

---

## Detailed Findings

### 1. Per-Student Cooldowns

**Verdict: ✅ IMPLEMENTED (Practice Only) / ❌ NOT IMPLEMENTED (Confusion Signals)**

#### Evidence for Practice Attempts:

**File:** `backend/src/middleware/antiGamingMiddleware.ts` (Lines 128-161)

```typescript
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
```

**Configuration:** 5-second cooldown (`cooldownSeconds: 5`)

**Storage:** In-memory Map cache (`rateLimitCache`) - **NOT persistent across server restarts**

**Where Applied:**

✅ **Practice attempts**: `backend/src/routes/index.ts:559`
```typescript
router.post('/api/practice/attempt', requireAuth, antiGamingMiddleware, applyDiminishingWeight, async (req, res) => {
```

❌ **Confusion signals**: `backend/src/routes/index.ts:340-398` - **NO MIDDLEWARE APPLIED**
```typescript
router.post('/api/confusion/signal', requireAuth, async (req, res) => {
  const { concept_id, signal, session_id } = req.body;
  const userId = (req as any).user?.id || req.headers['x-user-id'];
  // ... NO antiGamingMiddleware in this route
```

**Gap:** Students can spam confusion signals with zero cooldown.

---

### 2. Diminishing Weight on Repeat Taps

**Verdict: ✅ IMPLEMENTED (Practice Only) / ❌ NOT IMPLEMENTED (Confusion Signals)**

#### Evidence for Practice Attempts:

**File:** `backend/src/middleware/antiGamingMiddleware.ts` (Lines 87-97)

```typescript
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
```

**Algorithm:**
- Tracks attempts in a 60-second sliding window (`diminishingWindowSeconds: 60`)
- Max 10 attempts before weight drops to 0.1 (`maxAttemptsInWindow: 10`)
- Linear decay: weight = `max(0.1, 1.0 - (attempts/10) * 0.9)`

**Integration with Mastery:**

**File:** `backend/src/routes/index.ts` (Lines 559-606)
```typescript
router.post('/api/practice/attempt', requireAuth, antiGamingMiddleware, applyDiminishingWeight, async (req, res) => {
  const weight = antiGamingMetadata.weight || 1.0;
  
  // Insert practice attempt with weight
  const { data, error } = await supabaseAdmin
    .from('practice_attempts')
    .insert({ 
      student_id: userId, 
      concept_id, 
      correct,
      weight // Store the diminishing weight
    })
    .select()
    .single();
    
  // Update mastery with weighted attempt
  await masteryService.updateMastery(userId, concept_id);
```

**File:** `backend/src/services/masteryService.ts` (Lines 14-27)
```typescript
const { data: attempts, error } = await supabaseAdmin
  .from('practice_attempts')
  .select('correct, weight')
  .eq('student_id', userId)
  .eq('concept_id', conceptId);

// Extract boolean values and weights
const attemptHistory = attempts?.map(a => Boolean(a.correct)) || [];
const weights = attempts?.map(a => Number(a.weight || 1.0)) || [];

// 2. Call Python ML Service (BKT) with weighted attempts
const mlData = await mlService.calculateMastery(attemptHistory, weights);
```

**Where Applied:**

✅ **Practice attempts**: Fully wired - weight stored in DB, passed to BKT model  
❌ **Confusion signals**: `GET /api/confusion/pulse` uses **flat scoring**

**File:** `backend/src/routes/index.ts` (Lines 403-424)
```typescript
router.get('/api/confusion/pulse', requireAuth, async (req, res) => {
  const pulse: Record<string, { concept_id: string; name: string; score: number; count: number }> = {};
  
  data.forEach(sig => {
    const cid = sig.concept_id;
    const concept = Array.isArray(sig.concepts) ? sig.concepts[0] : sig.concepts;
    if (!pulse[cid]) pulse[cid] = { concept_id: cid, name: concept?.name || 'Unknown', score: 0, count: 0 };
    
    pulse[cid].count += 1;
    if (sig.signal === 'Confused') pulse[cid].score += 1.0;  // ❌ FLAT WEIGHT
    else if (sig.signal === 'Partially Clear') pulse[cid].score += 0.5;
    else if (sig.signal === 'Clear') pulse[cid].score += 0.0;
  });
```

**Gap:** A single student can spam "Confused" signals and artificially inflate a concept's confusion score with no diminishing returns.

---

### 3. Anomaly Detection for Coordinated Spikes

**Verdict: ⚠️ PARTIALLY IMPLEMENTED**

#### What Exists:

**A. Basic Statistical Anomaly Detection (Middleware)**

**File:** `backend/src/middleware/antiGamingMiddleware.ts` (Lines 54-77)

```typescript
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
    } catch (err: any) {
      console.error('Exception logging anomaly:', err);
    }
    
    return true;
  }
  
  return false;
}
```

**Algorithm:**
- Tracks global attempt timestamps across ALL students in memory
- Threshold: 50 attempts/minute across entire platform
- Action: Logs to database, reduces weight by 50% during spike

**Where Applied:**

✅ **Practice attempts**: Called in `antiGamingMiddleware` (Line 171)
```typescript
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
}
```

❌ **Confusion signals**: NOT CALLED - no anomaly detection whatsoever

---

**B. Advanced ML Anomaly Detection (Isolation Forest)**

**Python ML Service Exists:**

**File:** `backend/ml/inference/anomaly_detection.py` (Full implementation with Isolation Forest + Z-score)
```python
def detect_anomaly(signal_counts, current_count=None):
    """
    Detect anomalous confusion signal spikes.
    Uses both Isolation Forest model AND statistical baseline (z-score).
    """
    # ... full implementation exists
    # Model file: backend/ml/models/anomaly_detector_model.joblib (EXISTS)
```

**Node.js Service Method Exists:**

**File:** `backend/src/services/mlService.ts` (Lines 173-186)
```typescript
async detectAnomaly(signalCounts: number[], currentCount: number): Promise<any> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/ml/detect-anomaly`, {
      signal_counts: signalCounts,
      current_count: currentCount
    }, { timeout: ML_TIMEOUT });
    
    return response.data.success ? response.data : null;
  } catch (error) {
    console.error('Error detecting anomaly:', error);
    return null;
  }
}
```

**❌ CRITICAL GAP: This method is NEVER CALLED from any route!**

**Evidence:**
```bash
# Searched entire backend for calls to mlService.detectAnomaly or /ml/detect-anomaly
# Result: ZERO calls from confusion signal routes or anywhere else
```

The sophisticated ML anomaly detection exists as **dead code** - trained model, inference service, and API wrapper all implemented but never invoked.

---

## Summary Table

| Feature | Practice Attempts | Confusion Signals | Verdict |
|---------|------------------|-------------------|---------|
| **Cooldowns** | ✅ 5-second per student+concept | ❌ None | Partially Implemented |
| **Diminishing Weight** | ✅ Linear decay 1.0→0.1 over 10 attempts/60s | ❌ Flat 1.0 weight always | Partially Implemented |
| **Basic Anomaly Detection** | ✅ 50 attempts/min threshold, logs violations | ❌ Not applied | Partially Implemented |
| **ML Anomaly Detection** | ❌ Not called | ❌ Not called | Not Implemented (code exists but unused) |

---

## Why This Matters

### Real Attack Scenarios:

**Scenario 1: Confusion Signal Gaming**
1. Student spams "Confused" on a concept 50 times in 10 seconds
2. Educator dashboard shows concept as "HIGH confusion" (66%+)
3. Educator wastes time redesigning lecture for fake confusion
4. **Current Protection**: None

**Scenario 2: Coordinated Attack**
1. Multiple students coordinate to spam signals simultaneously
2. Platform-wide confusion metrics get poisoned
3. Analytics become meaningless for all educators
4. **Current Protection**: None (ML anomaly detector exists but isn't called)

**Scenario 3: Practice Attempt Gaming** (This IS protected)
1. Student rapid-fires practice attempts to inflate mastery
2. Cooldown blocks after 5 seconds ✅
3. Weight diminishes after 10 attempts/minute ✅
4. Platform-wide spike detection flags coordinated behavior ✅

---

## Minimum Viable Fix

To make the deck's claim **100% accurate**, implement the following:

### Fix 1: Apply Anti-Gaming Middleware to Confusion Signals

**File:** `backend/src/routes/index.ts:340`

**Current:**
```typescript
router.post('/api/confusion/signal', requireAuth, async (req, res) => {
```

**Fixed:**
```typescript
router.post('/api/confusion/signal', requireAuth, antiGamingMiddleware, async (req, res) => {
```

**Impact:**
- ✅ Adds 5-second cooldown between confusion signals
- ✅ Logs violations to `rate_limit_violations` table
- ✅ Tracks global spikes across all students
- ⚠️ Will return HTTP 429 if student spams signals

---

### Fix 2: Store Weight with Confusion Signals

**A. Add `weight` column to `confusion_signals` table**

**SQL Migration:**
```sql
ALTER TABLE confusion_signals 
ADD COLUMN weight DECIMAL(3,2) DEFAULT 1.00 NOT NULL;

CREATE INDEX idx_confusion_signals_weight ON confusion_signals(weight);
```

**B. Store weight when inserting signal**

**File:** `backend/src/routes/index.ts:340-355`

**Current:**
```typescript
const { data, error } = await supabaseAdmin
  .from('confusion_signals')
  .insert({ 
    student_id: userId, 
    concept_id, 
    signal
  })
  .select()
  .single();
```

**Fixed:**
```typescript
router.post('/api/confusion/signal', requireAuth, antiGamingMiddleware, async (req, res) => {
  const { concept_id, signal, session_id } = req.body;
  const userId = (req as any).user?.id || req.headers['x-user-id'];
  const antiGamingMetadata = (req as any).antiGamingMetadata || {};
  const weight = antiGamingMetadata.weight || 1.0;
  
  // ... existing validation ...
  
  const { data, error } = await supabaseAdmin
    .from('confusion_signals')
    .insert({ 
      student_id: userId, 
      concept_id, 
      signal,
      weight  // ✅ ADD THIS
    })
    .select()
    .single();
```

---

### Fix 3: Apply Weighted Scoring in Confusion Pulse

**File:** `backend/src/routes/index.ts:403-424`

**Current (Flat Scoring):**
```typescript
data.forEach(sig => {
  const cid = sig.concept_id;
  // ...
  pulse[cid].count += 1;
  if (sig.signal === 'Confused') pulse[cid].score += 1.0;  // ❌ FLAT
  else if (sig.signal === 'Partially Clear') pulse[cid].score += 0.5;
  else if (sig.signal === 'Clear') pulse[cid].score += 0.0;
});
```

**Fixed (Weighted Scoring):**
```typescript
const { data, error } = await supabaseAdmin
  .from('confusion_signals')
  .select('concept_id, signal, weight, concepts(name)')  // ✅ SELECT WEIGHT
  .order('created_at', { ascending: false });

data.forEach(sig => {
  const cid = sig.concept_id;
  const concept = Array.isArray(sig.concepts) ? sig.concepts[0] : sig.concepts;
  const weight = sig.weight || 1.0;  // ✅ GET WEIGHT
  
  if (!pulse[cid]) pulse[cid] = { concept_id: cid, name: concept?.name || 'Unknown', score: 0, count: 0 };
  
  pulse[cid].count += weight;  // ✅ WEIGHTED COUNT
  
  if (sig.signal === 'Confused') pulse[cid].score += 1.0 * weight;  // ✅ WEIGHTED SCORE
  else if (sig.signal === 'Partially Clear') pulse[cid].score += 0.5 * weight;
  else if (sig.signal === 'Clear') pulse[cid].score += 0.0;
});
```

**Impact:**
- Spam signals from one student will have diminishing impact
- 1st signal: full weight (1.0)
- 10th signal in 60s: 10% weight (0.1)
- Protects educator analytics from gaming

---

### Fix 4: Wire ML Anomaly Detection (Optional Enhancement)

**File:** `backend/src/routes/index.ts` - Add after confusion signal insert

```typescript
router.post('/api/confusion/signal', requireAuth, antiGamingMiddleware, async (req, res) => {
  // ... existing signal insert ...
  
  // ML Anomaly Detection
  try {
    // Get recent signal counts per hour for this concept
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentSignals } = await supabaseAdmin
      .from('confusion_signals')
      .select('created_at')
      .eq('concept_id', concept_id)
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    if (recentSignals && recentSignals.length >= 10) {
      // Group by hour and count
      const hourCounts = new Array(24).fill(0);
      recentSignals.forEach(s => {
        const hourAgo = Math.floor((Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60));
        if (hourAgo >= 0 && hourAgo < 24) {
          hourCounts[23 - hourAgo]++;
        }
      });
      
      const currentHourCount = hourCounts[23];
      
      // Call ML anomaly detection
      const anomalyResult = await mlService.detectAnomaly(hourCounts, currentHourCount);
      
      if (anomalyResult?.anomaly) {
        console.warn(`🚨 ML Anomaly Detection: ${anomalyResult.message}`);
        
        // Log to database
        await supabaseAdmin.from('ml_insights').insert({
          student_id: userId,
          insight_type: 'anomaly_detection',
          model_name: 'isolation_forest',
          result: anomalyResult,
          confidence: anomalyResult.statistics?.z_score || 0
        });
        
        // Optionally notify educators if severity is critical
        if (anomalyResult.severity === 'critical') {
          await supabaseAdmin.from('notifications').insert({
            user_id: null, // System notification
            type: 'anomaly',
            message: `Critical confusion spike detected for concept: ${anomalyResult.message}`,
            read: false
          });
        }
      }
    }
  } catch (err) {
    // Don't fail the request if ML service is down
    console.error('ML anomaly detection failed:', err);
  }
  
  // ... rest of existing signal processing ...
});
```

**Impact:**
- Leverages trained Isolation Forest model
- Detects sophisticated attack patterns (coordinated timing, unusual distributions)
- Provides educator alerts for critical anomalies
- Gracefully degrades if ML service is unavailable

---

## Implementation Effort Estimate

| Fix | Complexity | Time Estimate | Risk |
|-----|-----------|---------------|------|
| **Fix 1: Apply middleware to confusion route** | Low | 5 min | Low - same pattern already works for practice |
| **Fix 2: Add weight column + store weight** | Medium | 15 min | Low - straightforward DB migration |
| **Fix 3: Weighted scoring in pulse** | Low | 10 min | Low - simple calculation change |
| **Fix 4: Wire ML anomaly detection** | Medium | 30 min | Medium - depends on ML service being online |
| **Total (Fixes 1-3)** | - | **30 min** | **Low** |
| **Total (All 4)** | - | **60 min** | **Medium** |

**Recommendation:** Implement Fixes 1-3 immediately (30 min) to make deck claim accurate. Fix 4 is optional enhancement.

---

## Testing Checklist

After implementing fixes, verify:

### Manual Testing:
1. ✅ Student cannot spam confusion signals faster than 5 seconds
2. ✅ 10th confusion signal in 60s has ~0.1 weight stored in DB
3. ✅ Confusion pulse shows lower scores for spammed concepts
4. ✅ `rate_limit_violations` table logs cooldown violations
5. ✅ Global spike detection triggers for 50+ attempts/minute

### Automated Testing:
Run existing test script: `backend/test-anti-gaming.ts`
- Already has tests for cooldowns, diminishing returns, spam detection
- **Note:** Currently tests `/api/practice/attempt` only - would need adaptation for confusion signals

---

## Current State vs. Deck Claim

**Deck Claim:**
> "Anti-Gaming Rate Limits: Per-student cooldowns, diminishing weight on repeat taps, and anomaly detection flag coordinated spikes."

**Current Reality:**
> "Anti-Gaming Rate Limits: Per-student cooldowns **for practice only**, diminishing weight on repeat taps **for practice only**, and anomaly detection flags coordinated spikes **for practice only**."

**After Fixes 1-3:**
> "Anti-Gaming Rate Limits: Per-student cooldowns, diminishing weight on repeat taps, and basic anomaly detection flag coordinated spikes." ✅ **CLAIM BECOMES TRUE**

---

## Architectural Notes

### Why In-Memory Cache is Problematic

**Current Implementation:**
```typescript
const rateLimitCache = new Map<string, {
  lastAttempt: Date;
  recentAttempts: Date[];
  violationCount: number;
}>();
```

**Issues:**
1. ❌ Lost on server restart/crash
2. ❌ Doesn't work across multiple Node.js instances (horizontal scaling)
3. ❌ No TTL/cleanup beyond manual filtering

**Production Recommendation:** Use Redis with TTL
```typescript
// Example using ioredis
await redis.set(`rate_limit:${userId}:${conceptId}`, JSON.stringify(data), 'EX', 300); // 5 min TTL
```

**For Now:** Acceptable for MVP, but document as technical debt.

---

## Conclusion

The anti-gaming infrastructure is **well-architected and 80% complete**, but suffers from **selective application**:

- ✅ Practice attempts: Fully protected
- ❌ Confusion signals: Zero protection (critical gap)
- ⚠️ ML anomaly detection: Built but unused (dead code)

**Minimum fix to match deck claim:** 30 minutes (Fixes 1-3)

**Recommended fix for production:** 60 minutes (all 4 fixes)

The code quality is high - the middleware is well-structured, properly logs violations, and gracefully handles errors. It just needs to be **applied consistently** across all user-generated data endpoints.
