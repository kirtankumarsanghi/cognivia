# 🎮 Anti-Gaming Rate Limits

> **Preventing system gaming while encouraging thoughtful learning**

<div align="center">

![Status](https://img.shields.io/badge/status-production%20ready-success?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Coverage](https://img.shields.io/badge/coverage-backend%20%2B%20ML%20%2B%20DB-orange?style=for-the-badge)

</div>

## 📋 Overview

The Anti-Gaming Rate Limits system protects the integrity of Cognivia's learning analytics by preventing students from artificially inflating their mastery scores through rapid-fire submissions or coordinated gaming behavior.

### The Problem

Without rate limiting, students could:
- ❌ Submit answers rapidly without thinking
- ❌ Click through practice questions to boost scores
- ❌ Game the mastery tracking system
- ❌ Invalidate learning analytics

### The Solution

Three-layered defense:

```
1. ⏱️  PER-STUDENT COOLDOWNS
   └─ 5-second pause between attempts
      
2. 📉 DIMINISHING RETURNS
   └─ Weight decreases: 1.0 → 0.1 with rapid attempts
      
3. 🚨 ANOMALY DETECTION
   └─ Flags coordinated spikes (>50 attempts/min)
```

## ✨ Key Features

<table>
<tr>
<td width="33%" valign="top">

### ⏱️ Cooldowns
**5-second minimum** between practice attempts for the same concept

- Prevents rapid-fire clicking
- Clear error messages
- Countdown timer support

</td>
<td width="33%" valign="top">

### 📉 Diminishing Weight
**Sliding window** tracks recent activity (60 seconds)

- 1st attempt: 100% weight
- 3rd attempt: 73% weight
- 10th attempt: 10% weight
- Affects mastery calculation

</td>
<td width="33%" valign="top">

### 🚨 Anomaly Detection
**Global monitoring** across all students

- Detects spikes >50/min
- Logs to database
- Reduces weight by 50%
- Admin alerts

</td>
</tr>
</table>

## 🚀 Quick Start

### 1. Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Apply database migration
apply-anti-gaming-migration.bat

# Install dependencies
npm install

# Start server
npm run dev
```

### 2. Test

```bash
npm run test:anti-gaming
```

### 3. Monitor

```bash
# View suspicious activity
curl http://localhost:5000/api/anti-gaming/suspicious-activity \
  -H "Authorization: Bearer <admin-token>"

# Check anomaly stats
curl http://localhost:5000/api/anti-gaming/anomaly-stats \
  -H "Authorization: Bearer <admin-token>"
```

## 📊 How It Works

### For Students

```
┌────────────────────────────────────────────────┐
│ Student Practice Flow                          │
└────────────────────────────────────────────────┘

Submit Answer
     ↓
Check Cooldown (5s)
     ├─ Too soon → ⚠️ "Wait 3 seconds"
     └─ OK → Continue
     ↓
Calculate Weight
     ├─ Few attempts → 🟢 Weight 1.0 (100%)
     ├─ Some attempts → 🟡 Weight 0.7 (70%)
     └─ Many attempts → 🔴 Weight 0.1 (10%)
     ↓
Check Spam (>10 in 60s)
     ├─ Too many → 🚫 "Take a break"
     └─ OK → Continue
     ↓
Record with Weight
     ↓
Update Mastery (weighted)
     ↓
✅ Success
```

### Weight Impact

```javascript
// Weight decreases with rapid attempts
const attempts = [1, 3, 5, 10];
const weights = [1.0, 0.73, 0.55, 0.1];

// Weight affects mastery calculation
mastery += learning_rate * weight;

// Example:
// Full weight: 0.1 * 1.0 = 0.1 (10% gain)
// Half weight: 0.1 * 0.5 = 0.05 (5% gain)
// Min weight: 0.1 * 0.1 = 0.01 (1% gain)
```

## 🗄️ Database Schema

### New Tables

```sql
-- Violation tracking
CREATE TABLE rate_limit_violations (
  id UUID PRIMARY KEY,
  student_id UUID,
  concept_id UUID,
  violation_type TEXT, -- cooldown, spam, anomaly
  details JSONB,
  created_at TIMESTAMPTZ
);

-- Dynamic configuration
CREATE TABLE rate_limit_config (
  config_key TEXT PRIMARY KEY,
  config_value JSONB,
  updated_at TIMESTAMPTZ
);

-- Enhanced practice attempts
ALTER TABLE practice_attempts 
  ADD COLUMN weight NUMERIC(3,2) DEFAULT 1.0;
```

### Monitoring Views

```sql
-- Top violators
CREATE VIEW suspicious_activity AS
  SELECT student_id, COUNT(*) as violation_count
  FROM rate_limit_violations
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY student_id
  HAVING COUNT(*) >= 5;

-- Anomaly spikes
CREATE VIEW anomaly_spikes AS
  SELECT DATE_TRUNC('minute', created_at) as spike_time,
         COUNT(*) as violation_count
  FROM rate_limit_violations
  WHERE violation_type = 'coordinated_spike'
  GROUP BY spike_time;
```

## 📡 API Reference

### Student Endpoints

```bash
# Submit attempt (rate limited)
POST /api/practice/attempt
{
  "concept_id": "uuid",
  "correct": true
}

# Response includes anti-gaming metadata
{
  "id": "...",
  "weight": 0.73,
  "antiGaming": {
    "weight": "0.73",
    "recentAttempts": 3,
    "message": "73% impact due to recent activity"
  }
}

# Check rate limit status
GET /api/anti-gaming/status/:conceptId
```

### Admin Endpoints

```bash
# View anomaly statistics
GET /api/anti-gaming/anomaly-stats

# View suspicious users
GET /api/anti-gaming/suspicious-activity

# View violations for student
GET /api/anti-gaming/violations/:studentId

# Reset rate limit
POST /api/anti-gaming/reset/:studentId/:conceptId

# Update configuration
PUT /api/anti-gaming/config/:configKey
{
  "value": 10,
  "description": "Increased cooldown"
}
```

## ⚙️ Configuration

### Default Settings

```typescript
{
  cooldownSeconds: 5,              // Min time between attempts
  diminishingWindowSeconds: 60,    // Window for weight calculation
  maxAttemptsInWindow: 10,         // Spam threshold
  spikeThreshold: 50               // Global anomaly threshold
}
```

### Tuning Recommendations

**Strict (More Protection)**
```sql
UPDATE rate_limit_config SET config_value = '{"value": 10}' WHERE config_key = 'cooldown_seconds';
UPDATE rate_limit_config SET config_value = '{"value": 5}' WHERE config_key = 'max_attempts_in_window';
```

**Balanced (Default)**
```sql
-- Already set, no changes needed
```

**Relaxed (Better UX)**
```sql
UPDATE rate_limit_config SET config_value = '{"value": 3}' WHERE config_key = 'cooldown_seconds';
UPDATE rate_limit_config SET config_value = '{"value": 15}' WHERE config_key = 'max_attempts_in_window';
```

## 📈 Monitoring & Analytics

### SQL Queries

```sql
-- Top violators (24h)
SELECT * FROM suspicious_activity 
ORDER BY violation_count DESC 
LIMIT 10;

-- Violations by type
SELECT violation_type, COUNT(*) 
FROM rate_limit_violations 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY violation_type;

-- Average weight per student
SELECT student_id, AVG(weight) as avg_weight
FROM practice_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY student_id
HAVING AVG(weight) < 0.8;

-- Student statistics
SELECT * FROM get_student_rate_limit_stats('student-uuid'::uuid);
```

### Health Metrics

Track these KPIs:
- **Violation Rate**: Should trend downward
- **Average Weight**: Should stay above 0.9
- **Anomaly Frequency**: Should be rare (<1/day)
- **Student Complaints**: Should be minimal

## 🧪 Testing

### Automated Tests

```bash
npm run test:anti-gaming
```

Tests include:
- ✅ Cooldown enforcement
- ✅ Diminishing weight calculation
- ✅ Spam detection
- ✅ Rate limit status endpoint

### Manual Testing

```bash
# Test 1: Cooldown
curl -X POST /api/practice/attempt ... # Should succeed
curl -X POST /api/practice/attempt ... # Should fail (429)
sleep 5
curl -X POST /api/practice/attempt ... # Should succeed

# Test 2: Weight progression
for i in {1..5}; do
  curl -X POST /api/practice/attempt ...
  echo "Check weight in response"
  sleep 5
done
```

## 🎨 UI Integration (Recommended)

### Student Feedback

```jsx
// Show rate limit status
<RateLimitBadge status={status}>
  {status.canSubmit ? '🟢 Ready' : `🔴 Wait ${status.cooldownRemaining}s`}
</RateLimitBadge>

// Show weight warning
{weight < 1.0 && (
  <Alert type="warning">
    ⚠️ Quick submissions have reduced impact
    This attempt counted at {(weight * 100).toFixed(0)}% weight
  </Alert>
)}
```

### Admin Dashboard

```jsx
<AntiGamingDashboard>
  <AnomalyStats />
  <ViolationsTimeline />
  <SuspiciousActivityTable />
  <ConfigurationPanel />
</AntiGamingDashboard>
```

See [ANTI_GAMING_UI_SPEC.md](./ANTI_GAMING_UI_SPEC.md) for complete UI design.

## 🔒 Security & Performance

### Current Implementation
- ✅ In-memory cache for rate limiting
- ✅ Database logging for violations
- ✅ RLS policies for data access
- ✅ Proper error handling

### Production Recommendations
- 🔄 **Redis Migration**: For distributed rate limiting
- 🔄 **WebSocket Support**: For real-time alerts
- 🔄 **Monitoring Dashboards**: Grafana/Datadog integration
- 🔄 **Alerting**: Email/Slack notifications for anomalies

### Migration to Redis

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Store with TTL
await redis.setex(
  `ratelimit:${userId}:${conceptId}`,
  300, // 5 minutes
  JSON.stringify(rateLimitData)
);
```

## 📚 Documentation

- 📖 **[Full Documentation](./ANTI_GAMING_FEATURE.md)** - Complete technical details
- 🚀 **[Quick Start Guide](./ANTI_GAMING_QUICKSTART.md)** - Setup in 3 steps
- 🏗️ **[Architecture](./ANTI_GAMING_ARCHITECTURE.md)** - System design & data flow
- 📝 **[Cheat Sheet](./ANTI_GAMING_CHEATSHEET.md)** - Quick reference
- 🎨 **[UI Specification](./ANTI_GAMING_UI_SPEC.md)** - Frontend design
- 📊 **[Summary](./ANTI_GAMING_SUMMARY.md)** - Implementation overview

## 🤝 Contributing

### File Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── antiGamingMiddleware.ts   # Core logic
│   └── routes/
│       └── antiGamingRoutes.ts        # API endpoints
├── ml/
│   └── inference/
│       └── bkt.py                     # Weighted BKT
└── test-anti-gaming.ts                # Test suite

database/
└── rate_limiting_schema.sql           # DB schema

docs/
├── ANTI_GAMING_FEATURE.md            # Full docs
├── ANTI_GAMING_QUICKSTART.md         # Quick guide
├── ANTI_GAMING_ARCHITECTURE.md       # Architecture
├── ANTI_GAMING_CHEATSHEET.md         # Reference
├── ANTI_GAMING_UI_SPEC.md            # UI design
└── ANTI_GAMING_README.md             # This file
```

## ❓ FAQ

**Q: Why not just block all rapid submissions?**  
A: Some students genuinely work fast. Diminishing returns allows speed but reduces gaming impact.

**Q: What happens if the server restarts?**  
A: In-memory cache is lost. Rate limits reset. Migrate to Redis for persistence.

**Q: Can students see their violations?**  
A: Yes, via `GET /api/anti-gaming/violations/:studentId` (own data only).

**Q: How do I disable rate limiting?**  
A: Comment out middleware in routes or set `cooldownSeconds: 0` in config.

**Q: Does this affect mastery scores retroactively?**  
A: No. Only new attempts use weighted BKT. Historical data unchanged.

## 📞 Support

- 🐛 **Issues**: Check [ANTI_GAMING_FEATURE.md](./ANTI_GAMING_FEATURE.md) troubleshooting section
- 💬 **Questions**: Review [ANTI_GAMING_CHEATSHEET.md](./ANTI_GAMING_CHEATSHEET.md)
- 🔧 **Configuration**: See [ANTI_GAMING_QUICKSTART.md](./ANTI_GAMING_QUICKSTART.md)

## 🎉 Status

**Ready for Production** ✅

- ✅ Backend implementation complete
- ✅ ML model updated
- ✅ Database schema created
- ✅ API endpoints tested
- ✅ Documentation complete
- ✅ Test suite included

---

<div align="center">

**Made with 🧠 for better learning**

[Architecture](./ANTI_GAMING_ARCHITECTURE.md) · [Quick Start](./ANTI_GAMING_QUICKSTART.md) · [Cheat Sheet](./ANTI_GAMING_CHEATSHEET.md)

</div>
