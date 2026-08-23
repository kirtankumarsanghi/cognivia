# 🎮 Anti-Gaming Rate Limits Feature

## Overview

The Anti-Gaming Rate Limits system prevents students from artificially inflating their mastery scores through rapid-fire answer submissions or coordinated gaming behavior. This feature ensures the integrity of learning analytics and mastery tracking.

## 🎯 Key Features

### 1. **Per-Student Cooldowns** ⏱️
- **5-second cooldown** between practice attempts for the same concept
- Prevents rapid-fire submissions that don't reflect genuine learning
- Returns clear error messages with remaining wait time

### 2. **Diminishing Weight on Repeat Taps** 📉
- Tracks recent attempts within a 60-second sliding window
- Applies **linear diminishing returns**: weight decreases from 1.0 → 0.1 as rapid attempts increase
- Weight affects mastery calculation in the BKT (Bayesian Knowledge Tracing) model
- Example: 10 attempts in 60 seconds → later attempts weighted at only 10% impact

### 3. **Anomaly Detection for Coordinated Spikes** 🚨
- Monitors global attempt rate across all students
- Flags when attempts-per-minute exceed threshold (default: 50/minute)
- Logs anomaly events to database for review
- Reduces weight further (50%) during detected anomaly periods

## 📊 How It Works

### Request Flow

```
Student submits practice attempt
          ↓
[Anti-Gaming Middleware]
          ↓
├─ Check cooldown (5s)
│  └─ Block if too soon
├─ Calculate weight based on recent activity
│  └─ Apply diminishing returns formula
├─ Detect global anomaly spikes
│  └─ Flag if threshold exceeded
└─ Store metadata on request
          ↓
[Practice Attempt Handler]
          ↓
├─ Store attempt with weight in database
├─ Update mastery using weighted BKT
└─ Return response with anti-gaming metadata
```

### Weight Calculation

```typescript
const attemptsInWindow = recentAttempts.filter(
  t => t > Date.now() - 60000 // Last 60 seconds
);

const weight = Math.max(
  0.1,  // Minimum weight
  1.0 - (attemptsInWindow.length / 10) * 0.9
);
```

**Weight Examples:**
- 1 attempt in 60s: weight = 1.0 (100%)
- 3 attempts in 60s: weight = 0.73 (73%)
- 5 attempts in 60s: weight = 0.55 (55%)
- 10+ attempts in 60s: weight = 0.1 (10%)

### Weighted BKT Mastery Calculation

The Bayesian Knowledge Tracing model now accepts weighted attempts:

```python
# Standard BKT transition
new_mastery = posterior + (1 - posterior) * p_transit

# Weighted BKT transition (anti-gaming)
weighted_p_t = p_transit * weight
new_mastery = posterior + (1 - posterior) * weighted_p_t
```

**Effect:** Lower weight = slower mastery progression, reflecting lower confidence in the learning signal.

## 🗄️ Database Schema

### New Tables

#### `rate_limit_violations`
Tracks all rate limit violations for monitoring and review.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Student who violated |
| concept_id | UUID | Concept being practiced |
| violation_type | TEXT | cooldown_violation, spam_detection, coordinated_spike |
| details | JSONB | Violation details (times, counts, etc.) |
| created_at | TIMESTAMPTZ | When violation occurred |

#### `rate_limit_config`
Dynamic configuration for rate limit parameters.

| Column | Type | Description |
|--------|------|-------------|
| config_key | TEXT | Configuration key (unique) |
| config_value | JSONB | Value and description |
| updated_at | TIMESTAMPTZ | Last update time |

### Enhanced Tables

#### `practice_attempts` - Added Column
- **weight** (NUMERIC): Range 0.1-1.0, default 1.0
- Stores the diminishing weight applied to this attempt

### Views for Monitoring

#### `suspicious_activity`
Shows students with 5+ violations in the last 24 hours.

```sql
SELECT student_name, email, violation_count, violation_types
FROM suspicious_activity
ORDER BY violation_count DESC;
```

#### `anomaly_spikes`
Shows coordinated spike events in the last hour.

```sql
SELECT spike_time, violation_count, affected_students
FROM anomaly_spikes
ORDER BY spike_time DESC;
```

## 🛠️ API Endpoints

### Student Endpoints

#### `POST /api/practice/attempt`
Submit a practice attempt (rate-limited).

**Request:**
```json
{
  "concept_id": "uuid",
  "correct": true
}
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "concept_id": "uuid",
  "correct": true,
  "weight": 1.0,
  "created_at": "2026-08-23T10:00:00Z",
  "antiGaming": {
    "weight": "1.00",
    "recentAttempts": 1,
    "anomalyDetected": false
  }
}
```

**Rate Limit Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Please wait 3 seconds before submitting another answer.",
  "waitTime": 3,
  "type": "cooldown"
}
```

**Spam Response (429):**
```json
{
  "error": "Too many attempts",
  "message": "You've made too many attempts in a short time. Please take a break and try again later.",
  "type": "spam",
  "attemptsInWindow": 12,
  "maxAllowed": 10
}
```

#### `GET /api/anti-gaming/status/:conceptId`
Get current rate limit status for a concept.

**Response:**
```json
{
  "success": true,
  "status": {
    "canSubmit": true,
    "weight": 0.73,
    "recentAttempts": 3,
    "violationCount": 0,
    "cooldownRemaining": 0
  }
}
```

### Admin/Educator Endpoints

#### `GET /api/anti-gaming/anomaly-stats`
Get global anomaly detection statistics.

**Response:**
```json
{
  "success": true,
  "currentStats": {
    "attemptsPerMinute": 23,
    "threshold": 50,
    "isAnomalyActive": false
  },
  "recentSpikes": [...]
}
```

#### `GET /api/anti-gaming/suspicious-activity`
Get list of students with multiple violations.

#### `GET /api/anti-gaming/violations/:studentId`
Get detailed violations for a specific student.

#### `POST /api/anti-gaming/reset/:studentId/:conceptId`
Reset rate limit for a student (admin only).

#### `GET /api/anti-gaming/config`
Get current rate limit configuration.

#### `PUT /api/anti-gaming/config/:configKey`
Update rate limit configuration (admin only).

#### `GET /api/anti-gaming/violations-timeline`
Get violations over time for visualization.

## ⚙️ Configuration

### Default Settings

```typescript
const DEFAULT_CONFIG = {
  cooldownSeconds: 5,              // 5 seconds between attempts
  diminishingWindowSeconds: 60,    // 60-second sliding window
  maxAttemptsInWindow: 10,         // Max 10 attempts in window
  spikeThreshold: 50,              // 50 attempts/min = anomaly
};
```

### Updating Configuration

Admins can update configuration dynamically:

```bash
curl -X PUT https://api.cognivia.com/api/anti-gaming/config/cooldown_seconds \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 10,
    "description": "Increased cooldown for testing"
  }'
```

**Note:** Some changes may require server restart to take effect.

## 📈 Monitoring & Analytics

### Database Queries

#### Get violation summary for last 24 hours
```sql
SELECT 
  violation_type,
  COUNT(*) as count,
  COUNT(DISTINCT student_id) as unique_students
FROM rate_limit_violations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY violation_type;
```

#### Get student rate limit stats
```sql
SELECT * FROM get_student_rate_limit_stats(
  'student-uuid'::uuid,
  INTERVAL '1 hour'
);
```

#### Find high-frequency violators
```sql
SELECT * FROM suspicious_activity
WHERE violation_count > 10
ORDER BY last_violation DESC;
```

### Log Messages

The system logs key events to console:

```
⚠️ Diminishing returns triggered for user abc123: weight = 0.55
⚠️ ANOMALY DETECTED: 67 attempts/minute (threshold: 50)
🚨 Anomaly spike detected while user xyz789 submitted attempt
📉 Applying diminishing weight: 0.73x for this attempt
```

## 🧪 Testing

### Manual Testing Scenarios

#### Test 1: Cooldown Enforcement
```bash
# Submit attempt 1
curl -X POST /api/practice/attempt -d '{"concept_id":"...", "correct":true}'

# Immediately submit attempt 2 (should fail with 429)
curl -X POST /api/practice/attempt -d '{"concept_id":"...", "correct":false}'

# Wait 5 seconds and submit attempt 3 (should succeed)
sleep 5
curl -X POST /api/practice/attempt -d '{"concept_id":"...", "correct":true}'
```

#### Test 2: Diminishing Returns
```bash
# Submit 5 attempts rapidly (with 5s cooldown)
for i in {1..5}; do
  curl -X POST /api/practice/attempt -d '{"concept_id":"...", "correct":true}'
  echo "Attempt $i - Check weight in response"
  sleep 5
done

# Later attempts should show weight < 1.0
```

#### Test 3: Spam Detection
```bash
# Submit 15 attempts in 60 seconds (10 max allowed)
# Should get blocked with spam error after 10th attempt
```

### Automated Tests

```typescript
// Test cooldown enforcement
test('blocks attempts within cooldown period', async () => {
  await submitAttempt(student, concept);
  const response = await submitAttempt(student, concept);
  expect(response.status).toBe(429);
  expect(response.body.type).toBe('cooldown');
});

// Test diminishing weight calculation
test('applies diminishing weight for rapid attempts', async () => {
  for (let i = 0; i < 5; i++) {
    await sleep(5000); // Wait for cooldown
    const response = await submitAttempt(student, concept);
    console.log(`Attempt ${i+1} weight:`, response.body.antiGaming.weight);
  }
  // Last attempt should have weight < 1.0
});
```

## 🚀 Deployment

### 1. Apply Database Schema

```bash
# Run the migration
psql $DATABASE_URL -f database/rate_limiting_schema.sql
```

### 2. Deploy Backend

The middleware is automatically loaded when the backend starts. No additional configuration needed.

### 3. Verify Deployment

```bash
# Check health
curl https://api.cognivia.com/api/health

# Submit test attempt
curl -X POST https://api.cognivia.com/api/practice/attempt \
  -H "Authorization: Bearer <token>" \
  -d '{"concept_id":"...", "correct":true}'

# Check rate limit status
curl https://api.cognivia.com/api/anti-gaming/status/<concept-id> \
  -H "Authorization: Bearer <token>"
```

## 🔒 Security Considerations

### In-Memory Cache
- Current implementation uses in-memory Map for rate limiting
- **Limitation:** Doesn't persist across server restarts
- **Production Recommendation:** Migrate to Redis for distributed rate limiting

### Redis Migration (Future Enhancement)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Store rate limit data in Redis with TTL
await redis.setex(
  `ratelimit:${userId}:${conceptId}`,
  300, // 5 minutes TTL
  JSON.stringify(rateLimitData)
);
```

### Database RLS
- Row-level security policies ensure students can only view their own violations
- Educators and admins have full access for monitoring

## 📝 Future Enhancements

1. **Redis Integration**
   - Distributed rate limiting across multiple server instances
   - Persistent rate limit state across restarts

2. **Machine Learning Anomaly Detection**
   - Train ML model to detect sophisticated gaming patterns
   - Predict gaming behavior before it happens

3. **Adaptive Thresholds**
   - Adjust rate limits based on student behavior patterns
   - More lenient for consistent learners, stricter for suspicious patterns

4. **Real-Time Dashboards**
   - Live monitoring dashboard for educators
   - Visualization of attempt patterns and anomalies

5. **Automated Interventions**
   - Send notifications to students showing gaming behavior
   - Temporarily lock accounts with excessive violations

6. **A/B Testing Framework**
   - Test different cooldown periods and weight formulas
   - Optimize for learning effectiveness vs. user experience

## 📚 References

- [Bayesian Knowledge Tracing](https://en.wikipedia.org/wiki/Bayesian_Knowledge_Tracing)
- [Rate Limiting Strategies](https://redis.io/glossary/rate-limiting/)
- [Express.js Middleware Guide](https://expressjs.com/en/guide/writing-middleware.html)

---

**Version:** 1.0.0  
**Last Updated:** August 23, 2026  
**Author:** Cognivia Team
