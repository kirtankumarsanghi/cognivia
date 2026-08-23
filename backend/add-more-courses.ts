import { supabaseAdmin } from './src/config/supabase';

/**
 * Add More Courses Script
 * Adds additional courses with lessons and concepts without affecting existing data
 */

async function addMoreCourses() {
  console.log('🎓 Adding more courses to Cognivia...\n');

  // Find or create educator
  let { data: educator } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'educator')
    .limit(1)
    .single();

  const educatorId = educator?.id;

  if (!educatorId) {
    console.log('⚠️  No educator found, courses will be created without educator assignment');
  } else {
    console.log(`✓ Using educator: ${educatorId}`);
  }

  // Define new courses with full curriculum
  const newCourses = [
    {
      name: 'Web Development Fundamentals',
      code: 'WEB101',
      description: 'Learn HTML, CSS, and JavaScript to build modern websites',
      lessons: [
        {
          title: 'HTML Basics',
          description: 'Structure and semantic HTML',
          order_number: 1,
          concepts: [
            { name: 'HTML Tags', description: 'Basic HTML elements and syntax', difficulty: 'beginner' },
            { name: 'Forms & Input', description: 'Creating interactive forms', difficulty: 'beginner' },
            { name: 'Semantic HTML', description: 'Meaningful markup for accessibility', difficulty: 'intermediate' },
            { name: 'HTML5 APIs', description: 'Modern browser APIs', difficulty: 'advanced' },
          ]
        },
        {
          title: 'CSS Styling',
          description: 'Visual design and layout',
          order_number: 2,
          concepts: [
            { name: 'CSS Selectors', description: 'Targeting HTML elements', difficulty: 'beginner' },
            { name: 'Box Model', description: 'Understanding margins, padding, borders', difficulty: 'intermediate' },
            { name: 'Flexbox', description: 'Flexible layout system', difficulty: 'intermediate' },
            { name: 'CSS Grid', description: 'Two-dimensional layout', difficulty: 'advanced' },
            { name: 'Responsive Design', description: 'Mobile-first design principles', difficulty: 'advanced' },
          ]
        },
        {
          title: 'JavaScript Essentials',
          description: 'Programming fundamentals',
          order_number: 3,
          concepts: [
            { name: 'Variables & Data Types', description: 'Storing and manipulating data', difficulty: 'beginner' },
            { name: 'Functions', description: 'Reusable code blocks', difficulty: 'beginner' },
            { name: 'DOM Manipulation', description: 'Interacting with web pages', difficulty: 'intermediate' },
            { name: 'Events & Listeners', description: 'Handling user interactions', difficulty: 'intermediate' },
            { name: 'Async JavaScript', description: 'Promises and async/await', difficulty: 'advanced' },
          ]
        }
      ]
    },
    {
      name: 'Python Programming',
      code: 'PY101',
      description: 'Master Python from basics to advanced concepts',
      lessons: [
        {
          title: 'Python Basics',
          description: 'Fundamental syntax and concepts',
          order_number: 1,
          concepts: [
            { name: 'Python Syntax', description: 'Basic Python structure', difficulty: 'beginner' },
            { name: 'Data Types', description: 'Numbers, strings, lists, dictionaries', difficulty: 'beginner' },
            { name: 'Control Flow', description: 'If statements and loops', difficulty: 'beginner' },
            { name: 'Functions', description: 'Defining and calling functions', difficulty: 'intermediate' },
          ]
        },
        {
          title: 'Object-Oriented Python',
          description: 'Classes and objects',
          order_number: 2,
          concepts: [
            { name: 'Classes & Objects', description: 'Creating custom data types', difficulty: 'intermediate' },
            { name: 'Inheritance', description: 'Extending classes', difficulty: 'intermediate' },
            { name: 'Polymorphism', description: 'Method overriding', difficulty: 'advanced' },
            { name: 'Magic Methods', description: 'Special Python methods', difficulty: 'advanced' },
          ]
        },
        {
          title: 'Python Libraries',
          description: 'Working with popular libraries',
          order_number: 3,
          concepts: [
            { name: 'NumPy', description: 'Numerical computing', difficulty: 'intermediate' },
            { name: 'Pandas', description: 'Data manipulation', difficulty: 'intermediate' },
            { name: 'Matplotlib', description: 'Data visualization', difficulty: 'intermediate' },
            { name: 'Flask/Django', description: 'Web frameworks', difficulty: 'advanced' },
          ]
        }
      ]
    },
    {
      name: 'Database Design & SQL',
      code: 'DB101',
      description: 'Relational databases and SQL query language',
      lessons: [
        {
          title: 'Database Fundamentals',
          description: 'Core database concepts',
          order_number: 1,
          concepts: [
            { name: 'Tables & Schemas', description: 'Database structure', difficulty: 'beginner' },
            { name: 'Primary Keys', description: 'Unique identifiers', difficulty: 'beginner' },
            { name: 'Foreign Keys', description: 'Relationships between tables', difficulty: 'intermediate' },
            { name: 'Normalization', description: 'Database optimization', difficulty: 'advanced' },
          ]
        },
        {
          title: 'SQL Queries',
          description: 'Retrieving and manipulating data',
          order_number: 2,
          concepts: [
            { name: 'SELECT Statements', description: 'Querying data', difficulty: 'beginner' },
            { name: 'WHERE Clauses', description: 'Filtering results', difficulty: 'beginner' },
            { name: 'JOINs', description: 'Combining tables', difficulty: 'intermediate' },
            { name: 'Subqueries', description: 'Nested queries', difficulty: 'advanced' },
            { name: 'Indexes', description: 'Query optimization', difficulty: 'advanced' },
          ]
        }
      ]
    },
    {
      name: 'React Development',
      code: 'REACT101',
      description: 'Build modern user interfaces with React',
      lessons: [
        {
          title: 'React Basics',
          description: 'Components and JSX',
          order_number: 1,
          concepts: [
            { name: 'JSX Syntax', description: 'JavaScript XML', difficulty: 'beginner' },
            { name: 'Components', description: 'Reusable UI elements', difficulty: 'beginner' },
            { name: 'Props', description: 'Passing data to components', difficulty: 'beginner' },
            { name: 'State', description: 'Component data management', difficulty: 'intermediate' },
          ]
        },
        {
          title: 'React Hooks',
          description: 'Modern React patterns',
          order_number: 2,
          concepts: [
            { name: 'useState', description: 'State management hook', difficulty: 'intermediate' },
            { name: 'useEffect', description: 'Side effects hook', difficulty: 'intermediate' },
            { name: 'useContext', description: 'Global state management', difficulty: 'advanced' },
            { name: 'Custom Hooks', description: 'Reusable logic', difficulty: 'advanced' },
          ]
        },
        {
          title: 'Advanced React',
          description: 'Performance and patterns',
          order_number: 3,
          concepts: [
            { name: 'React Router', description: 'Client-side routing', difficulty: 'intermediate' },
            { name: 'Performance Optimization', description: 'useMemo and useCallback', difficulty: 'advanced' },
            { name: 'Error Boundaries', description: 'Error handling', difficulty: 'advanced' },
            { name: 'Testing React', description: 'Jest and Testing Library', difficulty: 'advanced' },
          ]
        }
      ]
    },
    {
      name: 'Machine Learning Basics',
      code: 'ML101',
      description: 'Introduction to AI and machine learning',
      lessons: [
        {
          title: 'ML Fundamentals',
          description: 'Core concepts and terminology',
          order_number: 1,
          concepts: [
            { name: 'Supervised Learning', description: 'Learning from labeled data', difficulty: 'beginner' },
            { name: 'Unsupervised Learning', description: 'Finding patterns in data', difficulty: 'intermediate' },
            { name: 'Training & Testing', description: 'Model evaluation', difficulty: 'beginner' },
            { name: 'Overfitting', description: 'Model generalization', difficulty: 'intermediate' },
          ]
        },
        {
          title: 'ML Algorithms',
          description: 'Popular machine learning algorithms',
          order_number: 2,
          concepts: [
            { name: 'Linear Regression', description: 'Predicting continuous values', difficulty: 'intermediate' },
            { name: 'Logistic Regression', description: 'Binary classification', difficulty: 'intermediate' },
            { name: 'Decision Trees', description: 'Tree-based models', difficulty: 'intermediate' },
            { name: 'Neural Networks', description: 'Deep learning basics', difficulty: 'advanced' },
            { name: 'K-Means Clustering', description: 'Grouping data points', difficulty: 'intermediate' },
          ]
        }
      ]
    },
    {
      name: 'Git & Version Control',
      code: 'GIT101',
      description: 'Collaborate with Git and GitHub',
      lessons: [
        {
          title: 'Git Basics',
          description: 'Version control fundamentals',
          order_number: 1,
          concepts: [
            { name: 'Git Init', description: 'Creating repositories', difficulty: 'beginner' },
            { name: 'Commits', description: 'Saving changes', difficulty: 'beginner' },
            { name: 'Branches', description: 'Parallel development', difficulty: 'intermediate' },
            { name: 'Merging', description: 'Combining branches', difficulty: 'intermediate' },
          ]
        },
        {
          title: 'Collaboration',
          description: 'Working with teams',
          order_number: 2,
          concepts: [
            { name: 'Pull Requests', description: 'Code review workflow', difficulty: 'intermediate' },
            { name: 'Merge Conflicts', description: 'Resolving conflicts', difficulty: 'intermediate' },
            { name: 'Git Rebase', description: 'Clean commit history', difficulty: 'advanced' },
            { name: 'Git Workflows', description: 'Team strategies', difficulty: 'advanced' },
          ]
        }
      ]
    }
  ];

  // Insert courses with lessons and concepts
  for (const courseData of newCourses) {
    console.log(`\n📚 Adding course: ${courseData.name} (${courseData.code})`);

    // Check if course already exists
    const { data: existingCourse } = await supabaseAdmin
      .from('courses')
      .select('id, name')
      .eq('code', courseData.code)
      .single();

    if (existingCourse) {
      console.log(`  ⚠️  Course ${courseData.code} already exists, skipping...`);
      continue;
    }

    // Insert course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert({
        name: courseData.name,
        code: courseData.code,
        description: courseData.description,
        educator_id: educatorId
      })
      .select()
      .single();

    if (courseError) {
      console.error(`  ❌ Error creating course: ${courseError.message}`);
      continue;
    }

    console.log(`  ✓ Created course: ${course.id}`);

    // Insert lessons
    for (const lessonData of courseData.lessons) {
      const { data: lesson, error: lessonError } = await supabaseAdmin
        .from('lessons')
        .insert({
          course_id: course.id,
          title: lessonData.title,
          description: lessonData.description,
          order_number: lessonData.order_number
        })
        .select()
        .single();

      if (lessonError) {
        console.error(`    ❌ Error creating lesson: ${lessonError.message}`);
        continue;
      }

      console.log(`    ✓ Created lesson: ${lessonData.title}`);

      // Insert concepts
      const conceptInserts = lessonData.concepts.map(concept => ({
        lesson_id: lesson.id,
        name: concept.name,
        description: concept.description,
        difficulty: concept.difficulty
      }));

      const { data: concepts, error: conceptError } = await supabaseAdmin
        .from('concepts')
        .insert(conceptInserts)
        .select();

      if (conceptError) {
        console.error(`      ❌ Error creating concepts: ${conceptError.message}`);
        continue;
      }

      console.log(`      ✓ Created ${concepts?.length || 0} concepts`);
    }
  }

  console.log('\n✅ Successfully added new courses!\n');
  console.log('📊 Summary:');
  console.log(`  - ${newCourses.length} new courses added`);
  console.log(`  - Total lessons: ${newCourses.reduce((sum, c) => sum + c.lessons.length, 0)}`);
  console.log(`  - Total concepts: ${newCourses.reduce((sum, c) => sum + c.lessons.reduce((s, l) => s + l.concepts.length, 0), 0)}`);
}

addMoreCourses()
  .then(() => {
    console.log('\n🎉 Course addition complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
