# 🎨 Anti-Gaming UI Specification

## Overview

This document describes the user interface components for the Anti-Gaming Rate Limits feature. These components display rate limiting information to students and monitoring dashboards to educators/admins.

## 🎓 Student-Facing UI

### 1. Practice Attempt Feedback

**Location:** After submitting a practice question

**Normal Submission (weight = 1.0):**
```
✅ Correct!
Your mastery increased to 67%
```

**Diminished Weight Submission (weight < 1.0):**
```
✅ Correct!
Your mastery increased to 68%

⚠️ Quick submissions have reduced impact
This attempt counted at 73% weight
Take your time to maximize learning!
```

**Rate Limited (429 response):**
```
⏱️ Please slow down

You need to wait 3 seconds before submitting another answer.

Why? We want to ensure you're taking time to learn, not just
clicking through rapidly.

[Continue in 3 seconds...]
```

### 2. Rate Limit Status Badge

**Location:** Next to practice question submit button

**States:**

**Ready to Submit:**
```
🟢 Ready
```

**Cooldown Active:**
```
🔴 Wait 2s
```

**Diminished Weight Warning:**
```
🟡 Rapid submissions (73% impact)
```

### 3. Practice History with Weights

**Location:** Student dashboard > Practice tab

```
Recent Practice Attempts

📊 Quadratic Equations
─────────────────────────────────
✅ Correct     2 min ago   Weight: 1.00 ████████████
✅ Correct     3 min ago   Weight: 0.85 ██████████░░
❌ Incorrect   4 min ago   Weight: 0.73 █████████░░░
✅ Correct     5 min ago   Weight: 1.00 ████████████
─────────────────────────────────
Average Weight: 0.90
```

## 👨‍🏫 Educator/Admin UI

### 1. Anti-Gaming Dashboard

**Route:** `/admin/anti-gaming`

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Anti-Gaming Monitoring Dashboard                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Current Status                        🕐 Last 60 minutes│
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│  │ Attempts/Min    │ │ Active Violations│ │ Anomaly      │ │
│  │                 │ │                  │ │              │ │
│  │      23         │ │        3         │ │   🟢 None    │ │
│  │  (Threshold:50) │ │                  │ │              │ │
│  └─────────────────┘ └─────────────────┘ └──────────────┘ │
│                                                              │
│  📈 Violations Timeline (Last 24 Hours)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   8 │                                                  │  │
│  │   6 │      ▄▄                                          │  │
│  │   4 │  ▄▄  ██  ▄▄      ▄▄                              │  │
│  │   2 │  ██  ██  ██  ▄▄  ██      ▄▄                      │  │
│  │   0 │──██──██──██──██──██──────██──────────────────────│  │
│  │     0h  4h  8h  12h 16h 20h  24h                       │  │
│  │                                                          │  │
│  │  Legend: █ Cooldown  █ Spam  █ Anomaly                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  🚨 Suspicious Activity (Last 24 Hours)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Student          Violations  Types           Actions  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Alice Johnson    12         Cooldown, Spam   [View]  │  │
│  │ Bob Smith        8          Cooldown         [View]  │  │
│  │ Carol White      6          Spam             [View]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ⚙️ Configuration                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Cooldown Period:       [5] seconds          [Update] │  │
│  │ Diminishing Window:    [60] seconds         [Update] │  │
│  │ Max Attempts:          [10] per window      [Update] │  │
│  │ Spike Threshold:       [50] attempts/min    [Update] │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2. Student Violation Detail Modal

**Triggered by:** Clicking [View] on suspicious activity row

```
┌─────────────────────────────────────────┐
│  Alice Johnson - Violations Detail      │
├─────────────────────────────────────────┤
│                                          │
│  📊 Statistics (Last 24 Hours)          │
│  • Total Attempts: 45                    │
│  • Violations: 12                        │
│  • Avg Time Between: 3.2 seconds         │
│  • Spam Violations: 8                    │
│  • Cooldown Violations: 4                │
│                                          │
│  📋 Recent Violations                    │
│  ┌────────────────────────────────────┐ │
│  │ 2:34 PM  Spam Detection             │ │
│  │          15 attempts in 60s         │ │
│  │                                     │ │
│  │ 2:31 PM  Cooldown Violation         │ │
│  │          Waited only 1.2s           │ │
│  │                                     │ │
│  │ 2:28 PM  Cooldown Violation         │ │
│  │          Waited only 0.8s           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  🔧 Actions                              │
│  [Reset Rate Limit] [Send Warning]      │
│  [View All Activity]                     │
│                                          │
│                       [Close]            │
└─────────────────────────────────────────┘
```

### 3. Real-Time Anomaly Alert

**Triggered by:** Anomaly spike detected

```
┌─────────────────────────────────────────┐
│  🚨 Anomaly Detected!                    │
├─────────────────────────────────────────┤
│                                          │
│  67 attempts per minute detected         │
│  (Threshold: 50 attempts/min)            │
│                                          │
│  This could indicate:                    │
│  • Coordinated gaming behavior           │
│  • Bot/script usage                      │
│  • System test (check logs)              │
│                                          │
│  Automatic mitigation:                   │
│  ✓ Weight reduced by 50%                 │
│  ✓ Logged to database                    │
│                                          │
│  [View Details] [Dismiss]                │
└─────────────────────────────────────────┘
```

### 4. Configuration Update Confirmation

```
┌─────────────────────────────────────────┐
│  ⚙️ Update Configuration                 │
├─────────────────────────────────────────┤
│                                          │
│  Setting: Cooldown Period                │
│  Current Value: 5 seconds                │
│  New Value: 10 seconds                   │
│                                          │
│  ⚠️ Note: Server restart may be          │
│  required for changes to take effect.    │
│                                          │
│  Proceed with update?                    │
│                                          │
│  [Cancel] [Update Configuration]         │
└─────────────────────────────────────────┘
```

## 📱 Mobile Responsive Design

### Student Mobile View

**Practice Attempt Feedback:**
```
┌──────────────────────┐
│  ✅ Correct!         │
│                      │
│  Mastery: 68%        │
│                      │
│  ⚠️ Quick Submit     │
│  73% impact          │
│                      │
│  Tip: Take your time │
│  to learn better!    │
└──────────────────────┘
```

**Rate Limit Warning:**
```
┌──────────────────────┐
│  ⏱️ Slow Down        │
│                      │
│  [■■■■■░░░] 3s       │
│                      │
│  Take a moment to    │
│  review your work    │
└──────────────────────┘
```

## 🎨 Color Scheme

### Status Colors
- **Green (#10B981):** Normal operation, ready to submit
- **Yellow (#F59E0B):** Diminished weight warning
- **Red (#EF4444):** Rate limit active, blocked
- **Orange (#F97316):** Anomaly detected

### Weight Visualization
```typescript
const getWeightColor = (weight: number) => {
  if (weight >= 0.9) return '#10B981'; // Green
  if (weight >= 0.7) return '#F59E0B'; // Yellow
  if (weight >= 0.5) return '#F97316'; // Orange
  return '#EF4444'; // Red
};
```

## 🔔 Notifications

### Student Notifications

**First Violation:**
```
💡 Learning Tip
We noticed you're submitting answers very quickly. Taking more time 
helps reinforce learning. Rapid submissions have reduced impact on 
your mastery score.
```

**Repeated Violations:**
```
⚠️ Slow Down
You've hit the rate limit multiple times. Please take breaks between 
practice attempts. This helps you learn better and prevents system gaming.
```

### Educator Notifications

**High Violation Count:**
```
🚨 Anti-Gaming Alert
Student Alice Johnson has 12 violations in the last hour. 
This may require your attention.
[View Details]
```

**Anomaly Spike:**
```
🚨 System Alert
Anomaly spike detected: 67 attempts/min (threshold: 50)
Check the Anti-Gaming Dashboard for details.
[View Dashboard]
```

## 📊 Analytics Widgets

### For Student Dashboard

**"Your Practice Pace" Widget:**
```
┌─────────────────────────────────┐
│  Your Practice Pace              │
├─────────────────────────────────┤
│                                  │
│  Average time per question       │
│  ▓▓▓▓▓▓▓▓░░  32 seconds         │
│                                  │
│  Recommended: 30-60 seconds      │
│                                  │
│  💡 You're doing great! Taking   │
│  time to think helps learning.   │
└─────────────────────────────────┘
```

### For Educator Dashboard

**"Class Engagement Quality" Widget:**
```
┌─────────────────────────────────┐
│  Class Engagement Quality        │
├─────────────────────────────────┤
│                                  │
│  Average attempt weight: 0.94    │
│  Students with violations: 3/25  │
│  Anomaly incidents: 0            │
│                                  │
│  🟢 Healthy engagement patterns  │
└─────────────────────────────────┘
```

## 🔧 Implementation Notes

### React Components (Suggested Structure)

```typescript
// Student Components
components/
  ├── practice/
  │   ├── RateLimitBadge.tsx
  │   ├── PracticeFeedback.tsx
  │   ├── RateLimitWarning.tsx
  │   └── PracticeHistory.tsx

// Admin Components
components/
  ├── admin/
  │   ├── AntiGamingDashboard.tsx
  │   ├── ViolationsTimeline.tsx
  │   ├── SuspiciousActivityTable.tsx
  │   ├── StudentViolationModal.tsx
  │   ├── AnomalyAlert.tsx
  │   └── ConfigurationPanel.tsx
```

### API Integration

```typescript
// Student side
const { data: status } = useQuery(
  ['rateLimitStatus', conceptId],
  () => api.get(`/anti-gaming/status/${conceptId}`)
);

// Admin side
const { data: anomalyStats } = useQuery(
  'anomalyStats',
  () => api.get('/anti-gaming/anomaly-stats'),
  { refetchInterval: 30000 } // Poll every 30 seconds
);
```

### Real-Time Updates

Use WebSocket for real-time anomaly alerts:

```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.cognivia.com/ws');
  
  ws.on('anomaly_detected', (data) => {
    showAnomalyAlert(data);
  });
  
  return () => ws.close();
}, []);
```

## 🧪 Testing Checklist

- [ ] Rate limit badge updates in real-time
- [ ] Feedback messages display correctly for all weight levels
- [ ] Timeline chart renders violation data accurately
- [ ] Suspicious activity table sorts by violation count
- [ ] Configuration updates require confirmation
- [ ] Mobile views are responsive and usable
- [ ] Anomaly alerts appear immediately when triggered
- [ ] Student can see their own violations
- [ ] Educator can view all student violations
- [ ] Admin can update configuration
- [ ] Notifications are non-intrusive but visible

## 🚀 Future Enhancements

1. **Gamification Reversal**
   - Award "Thoughtful Learner" badge for maintaining high weights
   - Show streak of attempts with weight > 0.9

2. **Predictive Analytics**
   - Predict gaming behavior before it happens
   - Show warning when pattern indicates potential gaming

3. **Adaptive UI**
   - Automatically adjust cooldown timer visibility
   - Hide for students with good track record
   - Emphasize for repeat offenders

4. **Educator Insights**
   - Show correlation between attempt pace and learning outcomes
   - Recommend interventions for students with violations

---

**Note:** This is a specification document. Actual implementation will be done in the frontend codebase using React/TypeScript.
