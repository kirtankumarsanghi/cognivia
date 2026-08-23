# 🎮 Anti-Gaming Rate Limits - Cheat Sheet

## 🚀 Quick Commands

### Setup
```bash
cd backend
apply-anti-gaming-migration.bat  # Apply DB schema
npm install                      # Install dependencies
npm run build                    # Build TypeScript
npm run dev                      # Start server
```

### Testing
```bash
npm run test:anti-gaming         # Run test suite
```

### Database
```sql
-- View violations
SELECT * FROM rate_limit_violations ORDER BY created_at DESC LIMIT 10;

-- View suspicious users
SELECT * FROM suspicious_activity;

-- View anomaly spikes
SELECT * FROM anomaly_spikes;

-- Get student stats
SELECT * FROM get_student_rate_limit_stats('student-uuid'::uuid);

-- Update config
UPDATE rate_limit_config 
SET config_value = '{"value": 10}'::jsonb 
WHERE config_key = 'cooldown_seconds';
```

## 📡 API Endpoints

### Student
```bash
# Submit attempt (rate limited)
POST /api/practice/attempt
Body: { "concept_id": "...", "correct": true }

# Check status
GET /api/anti-gaming/status/:conceptId
```

### Admin
```bash
# View anomaly stats
GET /api/anti-gaming/anomaly-stats

# View suspicious activity
GET /api/anti-gaming/suspicious-activity

# View violations for student
GET /api/anti-gaming/violations/:studentId

# Reset rate limit
POST /api/anti-gaming/reset/:studentId/:conceptId

# View config
GET /api/anti-gaming/config

# Update config
PUT /api/anti-gaming/config/:configKey
Body: { "value": 10, "description": "..." }

# View violations timeline
GET /api/anti-gaming/violations-timeline?hours=24
```

## ⚙️ Configuration

### Default Values
```javascript
cooldownSeconds: 5              // Time between attempts
diminishingWindowSeconds: 60    // Window for diminishing returns
maxAttemptsInWindow: 10         // Max attempts before spam block
spikeThreshold: 50              // Global attempts/min for anomaly
```

### Adjust via SQL
```sql
-- Stricter (more gaming prevention)
UPDATE rate_limit_config SET config_value = '{"value": 10}'::jsonb WHERE config_key = 'cooldown_seconds';
UPDATE rate_limit_config SET config_value = '{"value": 5}'::jsonb WHERE config_key = 'max_attempts_in_window';

-- Relaxed (better UX)
UPDATE rate_limit_config SET config_value = '{"value": 3}'::jsonb WHERE config_key = 'cooldown_seconds';
UPDATE rate_limit_config SET config_value = '{"value": 15}'::jsonb WHERE config_key = 'max_attempts_in_window';
```

## 🎯 Weight Examples

| Attempts (60s) | Weight | Impact | Status |
|---------------|--------|--------|--------|
| 0-1 | 1.00 | 100% | 🟢 Normal |
| 2-3 | 0.73-0.82 | 73-82% | 🟡 Warning |
| 4-6 | 0.46-0.64 | 46-64% | 🟠 Diminished |
| 7-9 | 0.19-0.37 | 19-37% | 🔴 Heavy penalty |
| 10+ | 0.10 | 10% | 🚫 Minimal |

## 📊 Monitoring Queries

### Top Violators (24h)
```sql
SELECT student_id, COUNT(*) as violations
FROM rate_limit_violations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY student_id
ORDER BY violations DESC
LIMIT 10;
```

### Violations by Type
```sql
SELECT violation_type, COUNT(*) as count
FROM rate_limit_violations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY violation_type;
```

### Anomaly Count (1h)
```sql
SELECT COUNT(*) as anomaly_count
FROM rate_limit_violations
WHERE violation_type = 'coordinated_spike'
AND created_at > NOW() - INTERVAL '1 hour';
```

### Average Weight per Student
```sql
SELECT student_id, AVG(weight) as avg_weight
FROM practice_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY student_id
HAVING AVG(weight) < 0.8
ORDER BY avg_weight ASC;
```

## 🔧 Troubleshooting

### Problem: Students blocked too often
```sql
-- Reduce cooldown
UPDATE rate_limit_config 
SET config_value = '{"value": 3}'::jsonb 
WHERE config_key = 'cooldown_seconds';
```

### Problem: Too many false anomaly alerts
```sql
-- Increase threshold
UPDATE rate_limit_config 
SET config_value = '{"value": 100}'::jsonb 
WHERE config_key = 'spike_threshold';
```

### Problem: Weight not applying
```bash
# Check column exists
psql -c "SELECT column_name FROM information_schema.columns WHERE table_name='practice_attempts' AND column_name='weight';"

# Restart server
npm run dev
```

### Problem: Cache not persisting
```
This is expected with in-memory cache.
For production: Migrate to Redis
```

## 📝 Response Codes

| Code | Type | Meaning |
|------|------|---------|
| 200 | Success | Attempt recorded |
| 429 | Cooldown | Wait N seconds |
| 429 | Spam | Too many attempts |
| 500 | Error | Server error |

## 🔐 Security

### RLS Policies
```sql
-- Students see own violations
SELECT * FROM rate_limit_violations WHERE student_id = auth.uid();

-- Educators see all
SELECT * FROM rate_limit_violations; -- If role IN ('educator', 'admin')
```

## 📈 Success Metrics

### Track These
- **Violation Rate**: Should decrease over time
- **Average Weight**: Should stay > 0.9 for healthy usage
- **Anomaly Frequency**: Should be rare (< 1/day)
- **User Complaints**: Should be minimal

### Query Dashboard Stats
```sql
-- Overall health
SELECT 
  (SELECT COUNT(*) FROM rate_limit_violations WHERE created_at > NOW() - INTERVAL '24 hours') as violations_24h,
  (SELECT AVG(weight) FROM practice_attempts WHERE created_at > NOW() - INTERVAL '24 hours') as avg_weight_24h,
  (SELECT COUNT(*) FROM rate_limit_violations WHERE violation_type = 'coordinated_spike' AND created_at > NOW() - INTERVAL '24 hours') as anomalies_24h;
```

## 🎓 For Students

### Why Am I Blocked?
1. **Cooldown**: Submitted too quickly (< 5s)
   - Solution: Wait the displayed seconds
   
2. **Spam**: Too many attempts (> 10 in 60s)
   - Solution: Take a break, review material

3. **Diminished**: Rapid submissions
   - Not blocked, but lower impact
   - Solution: Slow down for better learning

## 👨‍💼 For Admins

### Daily Checklist
```bash
# 1. Check anomalies
curl /api/anti-gaming/anomaly-stats

# 2. Review suspicious users
curl /api/anti-gaming/suspicious-activity

# 3. Check system health
psql -c "SELECT * FROM suspicious_activity WHERE violation_count > 10;"

# 4. Review configuration
curl /api/anti-gaming/config
```

### Weekly Review
```sql
-- Violation trends
SELECT 
  DATE(created_at) as date,
  violation_type,
  COUNT(*) as count
FROM rate_limit_violations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), violation_type
ORDER BY date DESC, violation_type;

-- Student behavior patterns
SELECT 
  student_id,
  COUNT(*) as total_attempts,
  AVG(weight) as avg_weight,
  COUNT(DISTINCT violation_id) as violations
FROM practice_attempts pa
LEFT JOIN rate_limit_violations rlv ON rlv.student_id = pa.student_id
WHERE pa.created_at > NOW() - INTERVAL '7 days'
GROUP BY student_id
ORDER BY violations DESC;
```

## 🚨 Emergency Actions

### Disable Rate Limiting (Emergency)
```typescript
// In backend/src/routes/index.ts
// Comment out the middleware:
// router.post('/api/practice/attempt', requireAuth, antiGamingMiddleware, ...

// Then restart server
```

### Reset All Rate Limits
```javascript
// In Node.js console or API endpoint
rateLimitCache.clear();
```

### Clear Violation History
```sql
-- WARNING: This deletes all violation records
DELETE FROM rate_limit_violations;
```

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `backend/src/middleware/antiGamingMiddleware.ts` | Core logic |
| `backend/src/routes/antiGamingRoutes.ts` | API endpoints |
| `backend/ml/inference/bkt.py` | Weighted BKT |
| `database/rate_limiting_schema.sql` | DB schema |
| `test-anti-gaming.ts` | Test suite |

## 🔗 Quick Links

- 📖 [Full Documentation](./ANTI_GAMING_FEATURE.md)
- 🏗️ [Architecture](./ANTI_GAMING_ARCHITECTURE.md)
- 🚀 [Quick Start](./ANTI_GAMING_QUICKSTART.md)
- 📊 [Summary](./ANTI_GAMING_SUMMARY.md)
- 🎨 [UI Spec](./ANTI_GAMING_UI_SPEC.md)

---

**Need Help?** Check the full docs or run `npm run test:anti-gaming`
