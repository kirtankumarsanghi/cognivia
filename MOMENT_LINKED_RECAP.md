# Moment-Linked Recap Feature - Implementation Guide

## Overview
This feature ties confusion signals to the exact moment in a lecture they happened, providing students with targeted mini-recaps instead of generic re-explanations.

## Tier 1 Implementation (COMPLETED)

### Part 1: Schema Extensions ✅
**File**: `database/migrations/003_moment_linked_recap.sql`

Created three key tables:
1. **class_sessions** - Live lecture sessions with start/end timestamps
2. **lecture_moments** - Educator-tagged moments with contextual labels
3. Enhanced **confusion_signals** with:
   - `lecture_timestamp_seconds` - Computed as `now() - session.started_at`
   - `session_id` - Reference to active class session

### Part 2: Educator Manual Moment-Tagging ✅
**Files**: 
- `backend/src/routes/sessionRoutes.ts` - Session CRUD APIs
- `frontend/src/components/educator/SessionManager.tsx` - Live session UI

**Features**:
- Start/end live sessions
- Quick-tag input: "What are you covering right now?"
- Real-time elapsed time display
- Tags stored with computed timestamp_seconds

**API Endpoints**:
- `POST /api/sessions/start` - Start new session
- `POST /api/sessions/:id/end` - End active session
- `POST /api/sessions/:id/moments` - Add moment tag
- `GET /api/sessions/active/:courseId` - Get active session
- `GET /api/sessions/:id` - Get session with moments & signals

### Part 3: Student Contextual Recap Generation ✅
**Files**:
- `backend/src/services/geminiService.ts` - Enhanced with momentContext
- `backend/src/routes/index.ts` - Updated tutor/chat endpoint
- `frontend/src/components/dashboard/ConfusionButton.tsx` - Session-aware
- `frontend/src/components/dashboard/ConfusionHistory.tsx` - Signal history with recap buttons
- `frontend/src/components/dashboard/Tutor.tsx` - Signal-aware AI responses

**Logic**:
1. When student raises confusion during active session:
   - Capture `session_id` 
   - Compute `lecture_timestamp_seconds = now() - session.started_at`
2. When requesting AI recap:
   - Find lecture_moments within ±90 second window
   - Pass moment labels as context to Gemini
   - Prompt: "The student got confused while the instructor was covering: [labels]. Give a short, targeted recap of just this specific point."

### Part 4: Educator Timeline Heatmap ✅
**Files**:
- `frontend/src/components/educator/SessionTimeline.tsx` - Interactive timeline
- `frontend/src/components/educator/EducatorDashboard.tsx` - Integration

**Features**:
- Horizontal timeline spanning session duration
- 30-second buckets with confusion density heatmap
- Color-coded intensity (high/medium/low confusion)
- Lecture moment markers overlay
- Hover tooltips showing:
  - Time range
  - Confusion count
  - Teaching moment labels
- Legend for visual clarity

**Visual Design**:
- Red gradient = high confusion
- Orange = medium confusion  
- Light red = low confusion
- Blue bar on top = moment marker

## Verification Checklist (Tier 1)

### 1. ✅ Start Session & Add Moment Tags
```bash
# As educator:
1. Navigate to Educator Dashboard
2. Select course from dropdown
3. Click "Start Live Session"
4. Enter session title (e.g., "Binary Search Trees Lecture")
5. Add 2-3 moment tags during session:
   - "Explaining tree traversal basics"
   - "Showing why binary search divides in half"
   - "Common mistakes with null pointers"
```

### 2. ✅ Raise Confusion Signal (Student)
```bash
# As student:
1. Click "I'm Confused" button
2. Select course/lesson/concept
3. Verify "Live session active" indicator appears
4. Submit confusion signal
5. Check that lecture_timestamp_seconds is captured in database
```

### 3. ✅ AI Tutor Moment-Aware Recap
```bash
# As student:
1. Go to Dashboard > Recent Confusion Signals
2. Click "Moment Recap" button on timestamped signal
3. Verify AI response mentions the specific moment labels
4. Response should be targeted, NOT generic concept explanation
```

### 4. ✅ Timeline Heatmap Visualization
```bash
# As educator:
1. Open Educator Dashboard with active/recent session
2. Verify timeline renders with:
   - Horizontal time axis (0:00 to session end)
   - Colored buckets showing confusion density
   - Blue markers for teaching moments
3. Hover over buckets to see:
   - Time range
   - Confusion count
   - Nearby moment labels
4. Verify 3+ signals create visually distinguishable heatmap
```

### 5. ✅ Graceful Fallback (No Active Session)
```bash
# As student:
1. Raise confusion signal OUTSIDE active session
2. Verify no crash occurs
3. AI Tutor should provide generic concept-based recap
4. lecture_timestamp_seconds should be NULL in database
```

## Database Migration Instructions

### Apply Schema Changes
```bash
# Option 1: Via Supabase Dashboard
1. Open Supabase project
2. Go to SQL Editor
3. Copy contents of `database/migrations/003_moment_linked_recap.sql`
4. Execute SQL

# Option 2: Via CLI (if configured)
supabase db push
```

### Verify Tables Created
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('class_sessions', 'lecture_moments');

-- Check columns added
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'confusion_signals' 
AND column_name IN ('lecture_timestamp_seconds', 'session_id');
```

## Testing Workflow

### Complete End-to-End Test
```bash
# 1. Educator Setup
- Login as educator
- Start session for CSE2101 course
- Add moment: "Explaining Big-O notation basics" (timestamp ~0:30)
- Wait 2 minutes
- Add moment: "Showing why O(log n) is faster" (timestamp ~2:00)

# 2. Student Confusion Signals
- Login as student
- Raise confusion on "Big O Notation" concept during active session
- Wait 1 minute
- Raise another confusion signal
- End session as educator

# 3. Verify Captures
- Query database:
  SELECT id, lecture_timestamp_seconds, session_id 
  FROM confusion_signals 
  WHERE session_id IS NOT NULL;
- Verify timestamps are reasonable (30s, 180s, etc.)

# 4. Test AI Recap
- As student, go to confusion history
- Click "Moment Recap" on first signal
- Verify AI mentions "Big-O notation basics" or "O(log n)"
- NOT just generic "Big-O is algorithmic complexity"

# 5. Check Timeline Heatmap
- As educator, view session timeline
- Verify 2 confusion buckets show up at correct times
- Hover to see moment labels
- Verify intensity colors differ if needed
```

## Architecture Notes

### Data Flow
1. **Session Start**: 
   - Educator → POST /api/sessions/start
   - DB: INSERT into class_sessions with started_at = NOW()

2. **Moment Tagging**:
   - Educator → POST /api/sessions/:id/moments {label}
   - Backend: timestamp_seconds = (NOW() - session.started_at) / 1000
   - DB: INSERT into lecture_moments

3. **Confusion Signal**:
   - Student → POST /api/confusion/signal {concept_id, signal, session_id}
   - Backend: If session_id provided, compute lecture_timestamp_seconds
   - DB: INSERT into confusion_signals with timestamp

4. **AI Recap Request**:
   - Student → POST /api/tutor/chat {question, concept_id, signal_id}
   - Backend: Query lecture_moments where timestamp ± 90s
   - Backend: Add momentContext to Gemini prompt
   - Return: Targeted mini-recap

5. **Timeline Render**:
   - Educator → GET /api/sessions/:id (includes moments + signals)
   - Frontend: Bucket signals into 30s windows
   - Frontend: Overlay moments on timeline
   - Display: Interactive heatmap

### Key Design Decisions
- **30-second buckets**: Balance between granularity and visual clarity
- **±90 second window**: Captures context before/after confusion moment
- **Null timestamps**: Gracefully handle signals outside sessions
- **Real-time updates**: Session details refresh every 10s
- **Auto-submit**: Timestamped signals auto-trigger AI recap for speed

## Known Limitations (Tier 1)
- No actual video/audio recording (Tier 2 feature)
- Moment tags are manual (educator must remember to tag)
- Timeline is post-lecture analysis (could add live view)
- No student-side visibility of active moments during lecture

## Tier 2 (Stretch - Not Yet Implemented)
If time permits:
- Part 5: Recording capture (audio/video tied to session)
- Part 6: Clip extraction (ffmpeg trim ~20s before to ~60s after)
- Serve clips alongside AI-generated recap

## Files Modified/Created

### Backend
- ✅ `database/migrations/003_moment_linked_recap.sql`
- ✅ `backend/src/routes/sessionRoutes.ts` (NEW)
- ✅ `backend/src/routes/index.ts` (MODIFIED - added session routes, signal_id)
- ✅ `backend/src/services/geminiService.ts` (MODIFIED - momentContext param)

### Frontend
- ✅ `frontend/src/components/educator/SessionManager.tsx` (NEW)
- ✅ `frontend/src/components/educator/SessionTimeline.tsx` (NEW)
- ✅ `frontend/src/components/educator/EducatorDashboard.tsx` (MODIFIED)
- ✅ `frontend/src/components/dashboard/ConfusionButton.tsx` (MODIFIED - session awareness)
- ✅ `frontend/src/components/dashboard/ConfusionHistory.tsx` (NEW)
- ✅ `frontend/src/components/dashboard/Tutor.tsx` (MODIFIED - signal_id handling)

## Next Steps
1. Apply database migration
2. Restart backend server
3. Rebuild frontend
4. Run verification checklist
5. Document any issues found
6. If stable, consider Tier 2 features
