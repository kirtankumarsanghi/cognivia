# Anti-Gaming Quick Start Guide

## ⚡ TL;DR

Anti-gaming rate limits are now **fully implemented** for confusion signals. The pitch deck claim is 100% accurate.

---

## 🚀 What You Need to Do

### 1️⃣ Run Database Migration (REQUIRED)

**Option A: Supabase Dashboard** (Easiest)
```
1. Open Supabase dashboard
2. Go to SQL Editor
3. Paste contents of: backend/add-weight-column-migration.sql
4. Click RUN
```

**Option B: Command Line**
```bash
psql "your_connection_string" < backend/add-weight-column-migration.sql
```

**What it does**: Adds `weight` column to `confusion_signals` table

---

### 2️⃣ Restart Backend (REQUIRED)

```bash
cd backend
npm run dev  # or however you start the backend
```

---

### 3️⃣ (Optional) Start ML Service for Advanced Anomaly Detection

```bash
cd backend/ml
pip install -r requirements.txt  # First time only
python app.py  # Runs on port 5001
```

**Note**: Basic anti-gaming works WITHOUT the ML service. ML adds sophisticated anomaly detection.

---

## ✅ How to Test It Works

### Quick Test (2 minutes)

1. **Login as a student**
2. **Click "Confused" on any concept**
3. **Immediately click "Confused" again** → Should see error toast: "Please wait X seconds"
4. **Wait 5 seconds**
5. **Click again** → Should work

### Spam Test (5 minutes)

1. **Click "Confused" 10 times** (wait 5.5 seconds between each)
2. **Check browser console** → Should see weight decreasing from 1.00 to 0.10
3. **Switch to educator view** → Check confusion pulse
4. **Verify**: Spammed concept doesn't show 100% confusion

---

## 🛡️ What's Protected Now

| Feature | Before | After |
|---------|--------|-------|
| **Spam Prevention** | ❌ Students could click 100× in 10 seconds | ✅ 5-second cooldown enforced |
| **Weight Reduction** | ❌ All signals counted equally | ✅ 10th signal in 60s = 10% weight |
| **Coordinated Attacks** | ❌ No detection | ✅ Platform-wide spike detection |
| **ML Anomaly Detection** | ❌ Not wired | ✅ Isolation Forest detects unusual patterns |

---

## 📊 How It Works

```
Student spams "Confused" 10 times in 60 seconds:

Signal #1: weight 1.00 ✅ Full impact
Signal #2: weight 0.90 ✅ 90% impact  
Signal #5: weight 0.60 ⚠️ 60% impact
Signal #10: weight 0.10 🚫 10% impact
Signal #11+: BLOCKED ❌ "Too many attempts"

Result: 
- Old confusion score: 100% (10/10 signals)
- New confusion score: ~55% (weighted average)
```

---

## 🔧 Configuration

All settings in `backend/src/middleware/antiGamingMiddleware.ts`:

```typescript
cooldownSeconds: 5,              // Wait between signals
diminishingWindowSeconds: 60,    // Tracking window
maxAttemptsInWindow: 10,         // Max before blocking
spikeThreshold: 50,              // Platform-wide spike threshold
```

---

## 📝 What Changed

### Files Modified
- ✅ `backend/src/routes/index.ts` - Added middleware + weighted scoring
- ✅ `backend/add-weight-column-migration.sql` - New migration file

### Files Created
- 📄 `ANTI_GAMING_AUDIT_REPORT.md` - Full audit details
- 📄 `ANTI_GAMING_IMPLEMENTATION.md` - Complete implementation guide
- 📄 `ANTI_GAMING_QUICK_START.md` - This file

---

## ⚠️ Important Notes

1. **Migration is REQUIRED** - Backend will fail without the weight column
2. **ML service is OPTIONAL** - Basic anti-gaming works without it
3. **Cache is in-memory** - Resets on server restart (use Redis for production)
4. **Cooldown blocks fast spam** - Students need 5 seconds between signals

---

## 🆘 Troubleshooting

### Error: "column weight does not exist"
→ Run the database migration (step 1 above)

### Error: "ML anomaly detection failed"
→ Normal if ML service isn't running. Feature degrades gracefully.

### Students complain about "rate limit exceeded"
→ Working as intended! They're trying to spam signals.

### Confusion pulse still shows high scores despite spam
→ Check that weight column exists and signals have weight < 1.0

---

## 📞 Need Help?

- **Full audit**: Read `ANTI_GAMING_AUDIT_REPORT.md`
- **Implementation details**: Read `ANTI_GAMING_IMPLEMENTATION.md`
- **Testing**: Run `npx tsx backend/test-anti-gaming.ts`

---

## ✨ Summary

**Before**: Confusion signals had zero protection. Students could spam freely.

**After**: Full anti-gaming protection with cooldowns, weight reduction, and anomaly detection.

**Action Required**: Run database migration, restart backend.

**Time to Deploy**: ~5 minutes

🎉 **The pitch deck claim is now 100% true!**
