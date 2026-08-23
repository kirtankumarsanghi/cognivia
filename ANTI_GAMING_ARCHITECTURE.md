# 🏗️ Anti-Gaming Rate Limits - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Student Device                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  React Frontend                                                 │ │
│  │  • Practice Question Component                                  │ │
│  │  • Rate Limit Badge                                            │ │
│  │  • Feedback Display                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                        │
│                              │ POST /api/practice/attempt             │
│                              ▼                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      Backend Server (Node.js/Express)                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Middleware Pipeline                                            │ │
│  │  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐  │ │
│  │  │ requireAuth │→ │ antiGamingMiddle│→ │ applyDiminishing │  │ │
│  │  │             │  │ ware            │  │ Weight           │  │ │
│  │  └─────────────┘  └─────────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                        │
│                              ▼                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  In-Memory Rate Limit Cache                                     │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Map<userId:conceptId, {                                   │ │ │
│  │  │   lastAttempt: Date,                                      │ │ │
│  │  │   recentAttempts: Date[],                                 │ │ │
│  │  │   violationCount: number                                  │ │ │
│  │  │ }>                                                         │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                        │
│                              ▼                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Global Anomaly Tracker                                         │ │
│  │  • globalAttemptTimestamps: Date[]                             │ │
│  │  • Tracks all attempts across students                          │ │
│  │  • Detects spikes > threshold                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                        │
│                              ▼                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Route Handler: POST /api/practice/attempt                     │ │
│  │  1. Insert attempt with weight                                  │ │
│  │  2. Call masteryService.updateMastery()                        │ │
│  │  3. Log learning session                                       │ │
│  │  4. Return response with anti-gaming metadata                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                        │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Database (Supabase/PostgreSQL)                  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  practice_attempts                                              │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ id, student_id, concept_id, correct, weight, created_at  │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  rate_limit_violations                                          │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ id, student_id, concept_id, violation_type, details,     │ │ │
│  │  │ created_at                                                │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  rate_limit_config                                              │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ config_key, config_value (JSONB), updated_at             │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Views                                                          │ │
│  │  • suspicious_activity                                          │ │
│  │  • anomaly_spikes                                              │ │
│  │                                                                 │ │
│  │  Functions                                                      │ │
│  │  • get_student_rate_limit_stats()                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Python ML Service (Flask)                       │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  POST /ml/mastery                                               │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Input: { attempts: [{correct, weight}], params }         │ │ │
│  │  │                                                           │ │ │
│  │  │ BKT Calculation (Weighted):                               │ │ │
│  │  │ for each attempt:                                         │ │ │
│  │  │   posterior = update_posterior(prior, correct)            │ │ │
│  │  │   weighted_p_t = p_transit * weight                       │ │ │
│  │  │   mastery = posterior + (1-posterior) * weighted_p_t      │ │ │
│  │  │                                                           │ │ │
│  │  │ Output: { mastery_probability, status, trace }            │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Practice Attempt Submission

```
┌─────────────────┐
│ Student submits │
│ practice answer │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Step 1: Authentication                              │
│ • Verify JWT token                                  │
│ • Extract user ID                                   │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Step 2: Anti-Gaming Middleware                      │
│                                                      │
│ A. Check Cooldown                                   │
│    ├─ Get last attempt time from cache              │
│    ├─ Calculate time since last                     │
│    └─ If < 5s → Return 429 Error                    │
│                                                      │
│ B. Calculate Weight                                 │
│    ├─ Get recent attempts (last 60s)                │
│    ├─ weight = 1.0 - (count/10) * 0.9               │
│    └─ Clamp to [0.1, 1.0]                           │
│                                                      │
│ C. Detect Anomaly                                   │
│    ├─ Add to global tracker                         │
│    ├─ Count attempts in last minute                 │
│    ├─ If > 50 → Log anomaly                         │
│    └─ Reduce weight by 50%                          │
│                                                      │
│ D. Check Spam                                       │
│    ├─ If recent attempts > 10 → Return 429          │
│    └─ Log spam violation                            │
│                                                      │
│ E. Update Cache                                     │
│    ├─ Set lastAttempt = now                         │
│    └─ Add to recentAttempts array                   │
│                                                      │
│ F. Attach Metadata to Request                       │
│    └─ req.antiGaming = { weight, ... }              │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Step 3: Store Practice Attempt                      │
│ • INSERT INTO practice_attempts                     │
│   (student_id, concept_id, correct, weight)         │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Step 4: Update Mastery                              │
│                                                      │
│ A. Fetch all attempts for student+concept           │
│    └─ SELECT correct, weight FROM practice_attempts │
│                                                      │
│ B. Call ML Service with weighted attempts           │
│    └─ POST /ml/mastery                              │
│       { attempts: [{correct, weight}] }             │
│                                                      │
│ C. Python BKT processes weighted attempts           │
│    └─ For each: mastery += transition * weight      │
│                                                      │
│ D. Store new mastery score                          │
│    └─ UPSERT INTO mastery_scores                    │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Step 5: Return Response                             │
│ {                                                    │
│   id, student_id, concept_id, correct, weight,      │
│   antiGaming: {                                      │
│     weight: "0.73",                                  │
│     recentAttempts: 3,                               │
│     anomalyDetected: false,                          │
│     message: "73% impact due to recent activity"    │
│   }                                                  │
│ }                                                    │
└─────────────────────────────────────────────────────┘
```

## Rate Limit State Machine

```
┌─────────────────────────────────────────────────────────┐
│                    Student State                        │
└─────────────────────────────────────────────────────────┘

State 1: READY
┌──────────────────┐
│ • No recent      │
│   attempts       │
│ • Weight = 1.0   │
│ • Can submit     │
└────────┬─────────┘
         │ Submit Attempt
         ▼
State 2: COOLDOWN
┌──────────────────┐
│ • Just submitted │
│ • 0-5s elapsed   │
│ • Cannot submit  │
└────────┬─────────┘
         │ 5s elapsed
         ▼
State 3: DIMINISHED
┌──────────────────┐
│ • Multiple       │
│   recent         │
│ • Weight < 1.0   │
│ • Can submit     │
└────────┬─────────┘
         │ Submit More
         ▼
State 4: SPAM BLOCKED
┌──────────────────┐
│ • Too many       │
│   attempts       │
│ • Weight = 0.1   │
│ • Cannot submit  │
└────────┬─────────┘
         │ 60s window expires
         ▼
State 1: READY (reset)
```

## Weight Calculation Formula

```
Input:
  recentAttempts = attempts in last 60 seconds
  MAX_ATTEMPTS = 10

Algorithm:
  if recentAttempts == 0:
    weight = 1.0
  else:
    ratio = recentAttempts / MAX_ATTEMPTS
    weight = max(0.1, 1.0 - ratio * 0.9)

Examples:
  0 attempts → weight = 1.0  (100%)
  1 attempt  → weight = 0.91 (91%)
  3 attempts → weight = 0.73 (73%)
  5 attempts → weight = 0.55 (55%)
  10 attempts → weight = 0.1 (10%)
  15 attempts → weight = 0.1 (10% minimum)
```

## Weighted BKT Formula

```
Standard BKT:
  P(L_{n+1}) = P(L_n|obs) + (1 - P(L_n|obs)) * P(T)
  
  Where:
    P(L_{n+1}) = mastery after this attempt
    P(L_n|obs) = posterior mastery given observation
    P(T)       = learning transition probability

Weighted BKT (Anti-Gaming):
  P(L_{n+1}) = P(L_n|obs) + (1 - P(L_n|obs)) * (P(T) * weight)
  
  Effect:
    weight = 1.0 → full learning rate
    weight = 0.5 → half learning rate
    weight = 0.1 → minimal learning rate

Example:
  P(T) = 0.1 (10% learning per correct attempt)
  
  Full weight (1.0):
    Learning gain = 0.1 * 1.0 = 0.1 (10%)
  
  Half weight (0.5):
    Learning gain = 0.1 * 0.5 = 0.05 (5%)
  
  Min weight (0.1):
    Learning gain = 0.1 * 0.1 = 0.01 (1%)
```

## Anomaly Detection Algorithm

```
┌─────────────────────────────────────────┐
│ Global Anomaly Detection                │
└─────────────────────────────────────────┘

Data Structure:
  globalAttemptTimestamps = [
    timestamp1,
    timestamp2,
    ...
  ]

On Each Request:
  1. Add current timestamp
  2. Remove timestamps > 60s old
  3. Count remaining timestamps
  4. If count > THRESHOLD (50):
     a. Log anomaly to database
     b. Reduce weight by 50%
     c. Flag as anomaly

Cleanup (every minute):
  Remove timestamps older than 60s

Example:
  Time    | Attempts/min | Action
  ────────────────────────────────
  10:00   | 15          | Normal
  10:01   | 23          | Normal
  10:02   | 67          | 🚨 ANOMALY!
  10:03   | 12          | Normal (spike ended)
```

## Database Schema Relationships

```
┌─────────────────────┐
│ profiles            │
│ ─────────────────── │
│ id (PK)             │
│ name                │
│ email               │
│ role                │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐         ┌─────────────────────┐
│ practice_attempts   │         │ concepts            │
│ ─────────────────── │         │ ─────────────────── │
│ id (PK)             │────N:1──│ id (PK)             │
│ student_id (FK)     │         │ name                │
│ concept_id (FK)     │         │ lesson_id           │
│ correct             │         └─────────────────────┘
│ weight ⭐ NEW       │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:1 per student+concept
           │
┌──────────▼──────────┐
│ mastery_scores      │
│ ─────────────────── │
│ id (PK)             │
│ student_id (FK)     │
│ concept_id (FK)     │
│ score               │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐
│ rate_limit_         │
│ violations ⭐ NEW   │
│ ─────────────────── │
│ id (PK)             │
│ student_id (FK)     │
│ concept_id (FK)     │
│ violation_type      │
│ details (JSONB)     │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│ rate_limit_         │
│ config ⭐ NEW       │
│ ─────────────────── │
│ config_key (PK)     │
│ config_value (JSON) │
│ updated_at          │
└─────────────────────┘
```

## API Request/Response Examples

### Successful Submission
```http
POST /api/practice/attempt
Authorization: Bearer <token>
Content-Type: application/json

{
  "concept_id": "abc-123",
  "correct": true
}

→ 200 OK
{
  "id": "xyz-789",
  "student_id": "user-456",
  "concept_id": "abc-123",
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

### Rate Limited (Cooldown)
```http
POST /api/practice/attempt
...

→ 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "message": "Please wait 3 seconds before submitting another answer.",
  "waitTime": 3,
  "type": "cooldown"
}
```

### Rate Limited (Spam)
```http
POST /api/practice/attempt
...

→ 429 Too Many Requests
{
  "error": "Too many attempts",
  "message": "You've made too many attempts in a short time. Please take a break and try again later.",
  "type": "spam",
  "attemptsInWindow": 12,
  "maxAllowed": 10
}
```

### Diminished Weight
```http
POST /api/practice/attempt
...

→ 200 OK
{
  "id": "xyz-790",
  "student_id": "user-456",
  "concept_id": "abc-123",
  "correct": true,
  "weight": 0.73,
  "created_at": "2026-08-23T10:00:30Z",
  "antiGaming": {
    "weight": "0.73",
    "recentAttempts": 3,
    "anomalyDetected": false,
    "message": "This attempt has 73% weight due to recent activity."
  }
}
```

## Monitoring Dashboard Data Flow

```
┌────────────────────────────────────────────────────┐
│ Admin/Educator Opens Dashboard                     │
└────────────────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Anomaly│  │ Suspi- │  │ Config │
    │ Stats  │  │ cious  │  │ Data   │
    │        │  │ Users  │  │        │
    └───┬────┘  └───┬────┘  └───┬────┘
        │           │           │
        ▼           ▼           ▼
┌──────────────────────────────────────┐
│ Backend API Queries                  │
├──────────────────────────────────────┤
│ GET /api/anti-gaming/anomaly-stats   │
│ GET /api/anti-gaming/suspicious-act  │
│ GET /api/anti-gaming/config          │
└──────────────────────────────────────┘
        │           │           │
        ▼           ▼           ▼
┌──────────────────────────────────────┐
│ Database Queries                     │
├──────────────────────────────────────┤
│ SELECT * FROM anomaly_spikes         │
│ SELECT * FROM suspicious_activity    │
│ SELECT * FROM rate_limit_config      │
└──────────────────────────────────────┘
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │ Render Dashboard    │
        │ • Charts            │
        │ • Tables            │
        │ • Alerts            │
        └─────────────────────┘
```

## Performance Considerations

### In-Memory Cache
```
Pros:
  ✅ Ultra-fast lookups (O(1))
  ✅ No network latency
  ✅ Simple implementation

Cons:
  ❌ Lost on server restart
  ❌ Not shared across instances
  ❌ Memory usage grows with users

Solution for Production:
  Migrate to Redis for:
  • Persistence
  • Distributed rate limiting
  • TTL management
```

### Database Writes
```
Writes per Attempt:
  1. INSERT practice_attempt
  2. UPSERT mastery_score
  3. INSERT learning_session
  4. INSERT violation (if violated)

Optimization:
  • Batch violation writes
  • Use database connection pooling
  • Index key lookup fields
```

### Anomaly Detection
```
Current: O(n) scan of timestamp array
Optimization: Use circular buffer

Before:
  Filter array every time → O(n)

After:
  Track count and oldest timestamp → O(1)
```

---

**This architecture enables:**
- ✅ Real-time rate limiting
- ✅ Accurate mastery tracking with weighted attempts
- ✅ Comprehensive monitoring and analytics
- ✅ Scalable to thousands of concurrent students
- ✅ Configurable thresholds and policies

