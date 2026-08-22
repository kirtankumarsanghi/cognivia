# Cogniva Database Setup

This directory contains the database schema, seed data, and migrations for the Cogniva learning platform.

## Files

- **schema.sql** - Core database schema with all tables and RLS policies
- **seed.sql** - Complete curriculum seed data including:
  - CSE2101: Data Structures and Algorithms (5 lessons, 20+ concepts)
  - CSE2102: Relational Database Management System (4 lessons, 14 concepts)
  - CSE2103: Computer Organization & Architecture (4 lessons, 11 concepts)
  - CSE2201: Design and Analysis of Algorithms (4 lessons, 11 concepts)
  - CSE2202: Operating Systems (4 lessons, 10 concepts)
  - CSE3101: Computer Networks (4 lessons, 11 concepts)
  - CSE3102: Software Engineering (4 lessons, 12 concepts)
  - CSE3201: Machine Learning (4 lessons, 11 concepts)
  - Demo educator and student profiles
  - Cross-course concept dependencies
  - Sample practice questions and attempts
- **migrations/002_add_projects_table.sql** - Projects table for CSE4271 Major Project tracking
- **study-groups-schema.sql** - Study groups feature (optional)
- **verify-seed.sql** - Verification queries to check seed data
- **run-extended-seed.js** - Node.js script to verify seeded data

## Setup Instructions

### 1. Initialize Database

Run these SQL files in your Supabase SQL Editor in this order:

1. **schema.sql** - Creates all tables and policies
2. **seed.sql** - Populates courses, lessons, concepts, and demo data
3. **migrations/002_add_projects_table.sql** - Adds projects table for capstone tracking

### 2. Verify Data

After running the seed files, you can verify the data in two ways:

#### Option A: Run verification queries in SQL Editor
```sql
-- Copy and paste queries from verify-seed.sql
```

#### Option B: Run the Node.js verification script
```bash
cd database
node run-extended-seed.js
```

This will check:
- ✅ 8 courses created
- ✅ 32+ lessons across all courses
- ✅ 70+ concepts with proper difficulty tags
- ✅ 30+ concept dependencies
- ✅ 6+ cross-course dependencies (the key feature!)
- ✅ Projects table with demo seed
- ✅ Demo student enrolled in all courses

### 3. Expected Cross-Course Dependencies

The seed data includes these critical cross-course concept dependencies:

| Concept | Course | Depends On | Prerequisite Course |
|---------|--------|------------|-------------------|
| Divide and Conquer | CSE2201 (DAA) | Big-O Complexity | CSE2101 (DSA) |
| Dynamic Programming | CSE2201 (DAA) | Recursion | CSE2101 (DSA) |
| DP on Graphs | CSE2201 (DAA) | BFS/DFS | CSE2101 (DSA) |
| Routing Algorithms | CSE3101 (Networks) | IP Addressing | CSE3101 (Networks) |
| Design Patterns | CSE3102 (SE) | UML Diagrams | CSE3102 (SE) |
| SVM | CSE3201 (ML) | Linear Regression | CSE3201 (ML) |

These dependencies make the ConceptGraph visualization meaningful and enable the AI tutor to trace confusion across course boundaries.

## Demo Accounts

The seed data creates two demo users:

- **Educator**: Prof. Alan Turing (educator@cogniva.edu)
- **Student**: Ada Lovelace (student@cogniva.edu)
  - Enrolled in all 8 courses
  - Has sample mastery scores and confusion signals
  - Has an in-progress Major Project

## Database Schema Highlights

### Core Tables
- `profiles` - User profiles (extends Supabase auth)
- `courses` - Course catalog
- `lessons` - Lessons within courses (ordered)
- `concepts` - Individual learning concepts (with difficulty: beginner/intermediate/advanced)
- `concept_dependencies` - Prerequisite graph (supports cross-course dependencies)

### Learning Data
- `confusion_signals` - Student confusion tracking
- `mastery_scores` - Concept mastery levels (0-100)
- `practice_attempts` - Practice question results
- `ai_conversations` - AI tutor chat history
- `revision_plans` - Personalized revision schedules

### Projects (CSE4271)
- `projects` - Student capstone project tracking with milestones

## Troubleshooting

### Issue: "ON CONFLICT DO NOTHING" not working
- Make sure you've enabled the uuid-ossp extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Issue: RLS blocking queries
- Check that policies are created: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
- Verify you're using the service role key for admin operations

### Issue: Cross-course dependencies not showing
- Run the verification query from verify-seed.sql section 6
- Check that concepts from different courses are referenced

### Issue: Projects table doesn't exist
- Run migrations/002_add_projects_table.sql
- Verify with: `SELECT * FROM projects;`

## Notes

- All UUIDs are hardcoded for reproducibility
- The seed script is idempotent (safe to re-run with ON CONFLICT DO NOTHING)
- Cross-course dependencies are the key differentiator from simpler LMS systems
- The existing CS101 data is preserved and extended to CSE2101

## Next Steps

1. Create auth users in Supabase Auth that match the demo profile IDs
2. Test the AI tutor with cross-course confusion scenarios
3. Visualize the concept dependency graph in ConceptGraph.tsx
4. Add more practice questions for each concept
5. Implement the Major Project milestone tracking UI
