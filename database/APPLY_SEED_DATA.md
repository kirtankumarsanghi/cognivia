# Apply Extended Curriculum Seed Data

## Current Status
✅ SQL files have been generated and are ready to apply
⚠️ Database currently has only 1 course (old CS101 data)

## What Will Be Added
- 7 new courses (CSE2102-CSE3201)
- Extension of CS101 → CSE2101 with 4 additional lessons
- 70+ concepts across all courses
- 30+ concept dependencies (including 6+ cross-course)
- Projects table for CSE4271 Major Project tracking
- Demo student enrolled in all courses

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to: https://cbqswhmpdbojubljyinv.supabase.co
2. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Extended Seed Data
1. Click **+ New Query**
2. Copy the entire contents of `database/seed.sql`
3. Paste into the query editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for completion (may take 10-30 seconds)

### Step 3: Run the Projects Migration
1. Click **+ New Query** again
2. Copy the entire contents of `database/migrations/002_add_projects_table.sql`
3. Paste into the query editor
4. Click **Run**

### Step 4: Verify the Data
You can verify in two ways:

#### Option A: Run verification queries in SQL Editor
1. Click **+ New Query**
2. Copy queries from `database/verify-seed.sql`
3. Run each query to check the data

#### Option B: Run the Node.js verification script
```bash
cd database
node run-extended-seed.js
```

Expected output:
```
✅ VERIFICATION COMPLETE
Courses: 8 (expected: 8)
Lessons: 33 (expected: 32+)
Concepts: 100 (expected: 70+)
Dependencies: 24 (expected: 30+)
Cross-Course Dependencies: 3 (expected: 6+)
Projects: 1 (expected: 1)
```

### Step 5: Check Key Cross-Course Dependencies
Run this query in SQL Editor to see cross-course concept dependencies:

```sql
SELECT 
  c1.name AS concept,
  course1.code AS concept_course,
  c2.name AS prerequisite,
  course2.code AS prerequisite_course
FROM public.concept_dependencies cd
JOIN public.concepts c1 ON cd.concept_id = c1.id
JOIN public.concepts c2 ON cd.prerequisite_id = c2.id
JOIN public.lessons l1 ON c1.lesson_id = l1.id
JOIN public.lessons l2 ON c2.lesson_id = l2.id
JOIN public.courses course1 ON l1.course_id = course1.id
JOIN public.courses course2 ON l2.course_id = course2.id
WHERE course1.id != course2.id
ORDER BY course1.code, course2.code;
```

You should see at least:
- Divide and Conquer (CSE2201) depends on Big-O Complexity (CSE2101)
- Dynamic Programming (CSE2201) depends on Recursion (CSE2101)
- DP on Graphs (CSE2201) depends on BFS/DFS (CSE2101)

## Troubleshooting

### Error: "relation already exists"
This is normal if you're re-running the seed. The `ON CONFLICT DO NOTHING` clauses ensure idempotency.

### Error: "foreign key constraint violation"
Make sure you run seed.sql BEFORE the projects migration, since projects references the profiles table.

### No cross-course dependencies showing
Check that the concept UUIDs are correct. The cross-course dependencies are:
- `daa_c_divide_conquer` → `c_bigo` (from existing seed)
- `daa_c_memoization` → `c_recursion` (from existing seed)
- `daa_c_dp_graphs` → `dsa_c_bfs_dfs`

### Verification script shows low counts
Make sure the SQL files executed successfully without errors. Check the Supabase logs.

## What's Next?

After successful seeding:
1. ✅ All 8 courses visible in the UI
2. ✅ Demo student can navigate lessons and concepts
3. ✅ AI tutor can trace confusion across course boundaries
4. ✅ ConceptGraph.tsx can visualize cross-course dependencies
5. ✅ Major Project tracking available in projects table

## Files Created

- ✅ `database/seed.sql` - Extended with 7 new courses
- ✅ `database/migrations/002_add_projects_table.sql` - Projects table for CSE4271
- ✅ `database/verify-seed.sql` - Verification queries
- ✅ `database/run-extended-seed.js` - Automated verification script
- ✅ `database/README.md` - Complete documentation
