# 🚀 Anti-Gaming Quick Start Guide

## What is it?

The Anti-Gaming Rate Limits feature prevents students from gaming the system by:
- 🚫 **Blocking rapid submissions** (5-second cooldown)
- 📉 **Reducing impact of spam** (diminishing returns on weight)
- 🚨 **Detecting coordinated attacks** (global anomaly detection)

## Quick Setup (3 steps)

### 1️⃣ Apply Database Migration

```bash
cd backend
apply-anti-gaming-migration.bat
```

Or manually run: `database/rate_limiting_schema.sql` in Supabase SQL Editor

### 2️⃣ Install Dependencies

```bash
cd backend
npm install
```

This installs the new dependencies (`chalk`, `ts-node`) for testing.

### 3️⃣ Restart Backend

```bash
npm run dev
```

That's it! The feature is now active. 🎉

## Testing

Run the automated test suite:

```bash
npm run test:anti-gaming
```

This will test:
- ✅ Cooldown enforcement (5s between attempts)
- ✅ Diminishing weight calculation
- ✅ Spam detection (10+ attempts/minute)
- ✅ Rate limit status endpoint

## How It Works

### For Students

```
Submit Answer → 5-second cooldown → Submit Again
                     ↓
              (If too fast = blocked)
```

**Rapid attempts = Lower weight = Slower mastery growth**

### Weight Examples

| Attempts in 60s | Weight | Impact |
|----------------|--------|---------|
| 1 | 1.0 | 100% |
| 3 | 0.73 | 73% |
| 5 | 0.55 | 55% |
| 10+ | 0.1 | 10% |

### For Educators/Admins

**View suspicious activity:**
```
GET /api/anti-gaming/suspicious-activity
```

**View anomaly spikes:**
```
GET /api/anti-gaming/anomaly-stats
```

**Reset a student's rate limit:**
```
POST /api/anti-gaming/reset/:studentId/:conceptId
```

## Configuration

Edit in database or via API (admin only):

```sql
UPDATE rate_limit_config 
SET config_value = '{"value": 10}'::jsonb
WHERE config_key = 'cooldown_seconds';
```

**Default Settings:**
- Cooldown: 5 seconds
- Window: 60 seconds
- Max attempts: 10 per minute
- Spike threshold: 50 attempts/min globally

## Monitoring

### Database Queries

**Get violations in last 24 hours:**
```sql
SELECT * FROM suspicious_activity;
```

**Get anomaly spikes:**
```sql
SELECT * FROM anomaly_spikes;
```

**Get student stats:**
```sql
SELECT * FROM get_student_rate_limit_stats('student-uuid'::uuid);
```

### API Endpoints

**Student:** Check own status
```
GET /api/anti-gaming/status/:conceptId
```

**Admin:** View all violations
```
GET /api/anti-gaming/violations-timeline?hours=24
```

## Troubleshooting

### Issue: Students getting blocked too often

**Solution:** Increase cooldown or window size
```sql
UPDATE rate_limit_config 
SET config_value = '{"value": 3}'::jsonb
WHERE config_key = 'cooldown_seconds';
```

### Issue: False positive anomaly detections

**Solution:** Increase spike threshold
```sql
UPDATE rate_limit_config 
SET config_value = '{"value": 100}'::jsonb
WHERE config_key = 'spike_threshold';
```

### Issue: Weights not decreasing

**Solution:** Check that `weight` column exists in `practice_attempts` table
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'practice_attempts' AND column_name = 'weight';
```

## Production Recommendations

### 1. Migrate to Redis
Current implementation uses in-memory cache. For production:

```typescript
// Install: npm install ioredis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

### 2. Set Up Monitoring Alerts
Alert when:
- Anomaly spike detected
- Student has 10+ violations
- Global attempts/min > threshold

### 3. Tune Parameters
Monitor for 1-2 weeks and adjust based on:
- False positive rate
- User complaints
- Actual gaming behavior patterns

## Learn More

📖 **Full Documentation:** [ANTI_GAMING_FEATURE.md](./ANTI_GAMING_FEATURE.md)

🔧 **Database Schema:** [database/rate_limiting_schema.sql](./database/rate_limiting_schema.sql)

💻 **Middleware Code:** [backend/src/middleware/antiGamingMiddleware.ts](./backend/src/middleware/antiGamingMiddleware.ts)

---

**Questions?** Check the full docs or contact the dev team.
