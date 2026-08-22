export const mockData = {
  studentAnalytics: {
    learningScore: 85,
    weeklyChange: 5,
    masteredCount: 12,
    needsAttentionCount: 3,
    streak: 7,
    recommendedNext: "Understanding Big O Notation",
    rank: "Gold Scholar",
    weeklySessionCount: 5,
    practiceAccuracy: 78,
    revisionPlan: [
      {
        id: 'mock-plan-1',
        concept_id: 'c1-con1',
        priority: 'High',
        minutes: 15,
        concepts: { name: 'Big O Notation' }
      }
    ]
  },
  
  educatorAnalytics: {
    studentCount: 45,
    averageClassScore: 78,
    confusionMetrics: [
      { name: 'Binary Search Trees', confusion_percentage: 85 },
      { name: 'Dynamic Programming', confusion_percentage: 72 },
      { name: 'Big O Notation', confusion_percentage: 45 },
      { name: 'Graph Traversal', confusion_percentage: 30 },
      { name: 'Hash Tables', confusion_percentage: 15 }
    ],
    mostConfusing: {
      concept_id: 'c3-con1',
      name: 'Binary Search Trees',
      confusion_percentage: 85
    },
    aiRecommendation: 'Based on recent activity, 85% of your class is struggling with Binary Search Trees. Generating a targeted mini-lesson could resolve this bottleneck.'
  },

  // Stateful tracking for each course's analytics so confusion reports persist in the mock backend
  courseAnalytics: {
    'cse2101': {
      studentCount: 45,
      averageClassScore: 78,
      confusionMetrics: [
        { name: 'Binary Search Trees', confusion_percentage: 85 },
        { name: 'Graph Traversal', confusion_percentage: 65 },
        { name: 'Big O Notation', confusion_percentage: 45 },
        { name: 'Hash Tables', confusion_percentage: 15 }
      ],
      mostConfusing: {
        concept_id: 'c3-con1',
        name: 'Binary Search Trees',
        confusion_percentage: 85
      },
      aiRecommendation: 'Based on recent activity, 85% of your class is struggling with Binary Search Trees. Generating a targeted mini-lesson could resolve this bottleneck.'
    },
    'cse2102': {
      studentCount: 38,
      averageClassScore: 82,
      confusionMetrics: [
        { name: 'Normalization (1NF to BCNF)', confusion_percentage: 92 },
        { name: 'Window Functions', confusion_percentage: 75 },
        { name: 'Complex Joins', confusion_percentage: 45 },
        { name: 'ER Diagrams', confusion_percentage: 20 }
      ],
      mostConfusing: {
        concept_id: 'db-con2',
        name: 'Normalization (1NF to BCNF)',
        confusion_percentage: 92
      },
      aiRecommendation: 'Based on recent activity, 92% of your class is struggling with Normalization. Generating a targeted mini-lesson could resolve this bottleneck.'
    }
  },

  courses: [
    {
      id: 'cse2101',
      code: 'CSE2101',
      name: 'Data Structures and Algorithms',
      description: 'Learn foundational data structures like Trees, Graphs, and Hash Tables and algorithm analysis.',
      lessons: [
        {
          id: 'l1',
          title: 'Trees and Graphs',
          concepts: [
            { id: 'c3-con1', name: 'Binary Search Trees', difficulty: 'intermediate' },
            { id: 'c3-con2', name: 'Graph Traversal', difficulty: 'advanced' }
          ]
        },
        {
          id: 'l2',
          title: 'Algorithmic Complexity',
          concepts: [
            { id: 'c1-con1', name: 'Big O Notation', difficulty: 'beginner' },
            { id: 'c1-con2', name: 'Time vs Space Complexity', difficulty: 'beginner' }
          ]
        }
      ]
    },
    {
      id: 'cse2102',
      code: 'CSE2102',
      name: 'Relational Database Management System',
      description: 'Master SQL, normalization, and database architecture for scalable applications.',
      lessons: [
        {
          id: 'l1',
          title: 'Database Design',
          concepts: [
            { id: 'db-con1', name: 'ER Diagrams', difficulty: 'beginner' },
            { id: 'db-con2', name: 'Normalization (1NF to BCNF)', difficulty: 'advanced' }
          ]
        },
        {
          id: 'l2',
          title: 'Advanced SQL',
          concepts: [
            { id: 'db-con3', name: 'Complex Joins', difficulty: 'intermediate' },
            { id: 'db-con4', name: 'Window Functions', difficulty: 'advanced' }
          ]
        }
      ]
    },
    {
      id: 'cse2103',
      code: 'CSE2103',
      name: 'Computer Organization & Architecture',
      description: 'Understand the internal workings of computer systems, instruction sets, and memory hierarchy.',
    },
    {
      id: 'cse2201',
      code: 'CSE2201',
      name: 'Design and Analysis of Algorithms',
      description: 'Advanced algorithmic paradigms including dynamic programming, greedy algorithms, and graph theory.',
    },
    {
      id: 'cse2202',
      code: 'CSE2202',
      name: 'Operating Systems',
      description: 'Core concepts of OS including process management, threading, concurrency, and memory allocation.',
    },
    {
      id: 'cse3101',
      code: 'CSE3101',
      name: 'Computer Networks',
      description: 'Dive deep into the OSI model, TCP/IP protocols, routing, and network security.',
    },
    {
      id: 'cse3102',
      code: 'CSE3102',
      name: 'Software Engineering',
      description: 'Learn Agile methodologies, system design, testing frameworks, and software lifecycles.',
    },
    {
      id: 'cse3201',
      code: 'CSE3201',
      name: 'Machine Learning',
      description: 'Introduction to supervised and unsupervised learning, neural networks, and predictive modeling.',
    },
    {
      id: 'cse4271',
      code: 'CSE4271',
      name: 'Major Project',
      description: 'Capstone project applying all accumulated knowledge to solve a complex real-world problem.',
    }
  ],

  courseDetail: {
    id: 'course-1',
    title: 'Computer Science 101',
    description: 'Introduction to foundational computer science concepts',
    lessons: [
      {
        id: 'l1',
        title: 'Algorithms Basics',
        description: 'Learn the fundamentals of algorithms.',
        concepts: [
          { id: 'c1-con1', name: 'Big O Notation' },
          { id: 'c1-con2', name: 'Binary Search' }
        ]
      },
      {
        id: 'l2',
        title: 'Data Structures',
        description: 'Understand how data is stored.',
        concepts: [
          { id: 'c2-con1', name: 'Arrays' },
          { id: 'c2-con2', name: 'Linked Lists' }
        ]
      }
    ]
  },

  pulse: [
    { status: 'HIGH', name: 'Memory Allocation', confusion_percentage: 100, student_name: 'Alex Johnson', time: 'Just now' },
    { status: 'MEDIUM', name: 'Variables', confusion_percentage: 45, student_name: 'Emma Jones', time: '2 mins ago' },
    { status: 'LOW', name: 'For Loops', confusion_percentage: 12, student_name: 'Sam Smith', time: '5 mins ago' }
  ],

  confusionHistory: [
    { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), level: 80, concept: 'Binary Search Trees' },
    { timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), level: 40, concept: 'Big O Notation' },
    { timestamp: new Date().toISOString(), level: 60, concept: 'Dynamic Programming' }
  ],

  conceptGraph: {
    nodes: [
      { id: 'c1-con1', name: 'Big O Notation', group: 1, val: 5 },
      { id: 'c1-con2', name: 'Binary Search', group: 1, val: 10 },
      { id: 'c2-con1', name: 'Arrays', group: 2, val: 2 },
      { id: 'c2-con2', name: 'Linked Lists', group: 2, val: 2 }
    ],
    links: [
      { source: 'c2-con1', target: 'c1-con2', value: 1 },
      { source: 'c1-con1', target: 'c1-con2', value: 1 }
    ]
  },

  notifications: [
    {
      id: 'n1',
      message: 'You have a new study guide ready for Big O Notation.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: false
    },
    {
      id: 'n2',
      message: 'Your peer group just finished a session on Hash Tables.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false
    }
  ],
  
  studyGroupMatches: [
    { id: 'u1', name: 'Alex Johnson', strength: 'Binary Search Trees', match: 95 },
    { id: 'u2', name: 'Emma Jones', strength: 'Dynamic Programming', match: 88 },
    { id: 'u3', name: 'Sam Smith', strength: 'Hash Tables', match: 76 }
  ],
  
  studyGroupSessions: [
    { id: 's1', title: 'Late Night DSA', topic: 'Graph Traversal algorithms and topological sorting', participants: 8, isLive: true },
    { id: 's2', title: 'Midterm Prep', topic: 'Reviewing Big O Notation and recursion', participants: 4, isLive: true },
    { id: 's3', title: 'Weekend Hackers', topic: 'Building a simple REST API', participants: 12, isLive: false }
  ],

  practiceQuestions: {
    'c1-con1': [ // Big O Notation
      {
        id: 'q1',
        question_text: 'What is the time complexity of accessing an element in an array by index?',
        question_type: 'mcq',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
        correct_answer: 'O(1)',
        explanation: 'Array elements are stored in contiguous memory, allowing direct access via mathematical offset calculations in constant time O(1).'
      },
      {
        id: 'q2',
        question_text: 'Which Big O notation represents a logarithmic time complexity?',
        question_type: 'mcq',
        options: ['O(n)', 'O(n log n)', 'O(1)', 'O(log n)'],
        correct_answer: 'O(log n)',
        explanation: 'O(log n) represents logarithmic time complexity, typical of algorithms like Binary Search that halve the search space each step.'
      },
      {
        id: 'q3',
        question_text: 'What is the worst-case time complexity of standard Bubble Sort?',
        question_type: 'mcq',
        options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'],
        correct_answer: 'O(n^2)',
        explanation: 'In the worst case (reverse sorted array), Bubble Sort must compare and swap every pair of elements, resulting in n * n iterations.'
      }
    ],
    'c3-con1': [ // Binary Search Trees
      {
        id: 'q4',
        question_text: 'In a valid Binary Search Tree (BST), where are all elements smaller than the root node located?',
        question_type: 'mcq',
        options: ['Right subtree', 'Left subtree', 'Randomly distributed', 'Leaf nodes only'],
        correct_answer: 'Left subtree',
        explanation: 'By definition, a BST maintains the invariant that all nodes in the left subtree are smaller than the parent node.'
      }
    ]
  }
};
