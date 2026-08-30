import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let isAiAvailable = false;
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Initialize with error handling
try {
  if (env.geminiApiKey && env.geminiApiKey.length > 20 && !env.geminiApiKey.includes('_p04FM')) {
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    isAiAvailable = true;
    console.log('[GeminiService] Initialized successfully with Gemini AI');
  } else {
    console.warn('[GeminiService] No valid API key found - using intelligent fallback mode');
    isAiAvailable = false;
  }
} catch (error) {
  console.error('[GeminiService] Initialization failed - using intelligent fallback mode');
  isAiAvailable = false;
}

export const geminiService = {
  isAvailable: () => isAiAvailable,

  async askTutor(question: string, context?: string, momentContext?: string): Promise<any> {
    if (!isAiAvailable || !model) {
      console.warn('[GeminiService] AI not available for request. Using fallback.');
      return getFallbackTutorResponse(question, !!momentContext);
    }

    let promptAddition = '';
    if (momentContext) {
      promptAddition = `\n\nIMPORTANT: ${momentContext} Give a short, targeted recap of just this specific point being taught at that moment, not a generic concept-level explanation. Focus on the exact teaching moment where confusion occurred.`;
    }

    const prompt = `
      You are an expert, encouraging AI Tutor named Cogniva.
      The student has asked: "${question}"
      Context: ${context || 'None'}${promptAddition}
      
      Respond with a JSON object strictly following this structure:
      {
        "explanation": "Simple, beginner-friendly explanation (2-3 sentences). Use markdown for formatting if helpful (bold, italic, code blocks).",
        "whyItWorks": "Why this concept works or matters (1-2 sentences)",
        "example": "A concrete, relatable example. Include code blocks using markdown syntax if relevant.",
        "commonMistake": "One common mistake or misconception",
        "quickCheck": "A quick question to check their understanding",
        "nextStep": "Recommended next step or follow-up topic"
      }
      
      Important:
      - Use markdown formatting where appropriate (code blocks, bold, italic)
      - Keep explanations concise and friendly
      - Use practical, real-world examples
      - Return ONLY valid JSON. No markdown code fences around the JSON itself.
    `;
    
    try {
      console.log('[GeminiService] Sending request to Gemini API');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout')), 15000)
      );
      
      const apiPromise = model.generateContent(prompt);
      const result = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      const text = result.response.text().trim();
      
      // Clean up markdown if model returned it despite instructions
      const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(jsonStr);
      
      console.log('[GeminiService] Successfully received and parsed response');
      return { ...parsed, isDemo: false, hasMomentContext: !!momentContext };
    } catch (error: any) {
      console.error('[GeminiService] API request failed:', error.message);
      console.warn('[GeminiService] Falling back to local response');
      return getFallbackTutorResponse(question, !!momentContext);
    }
  },

  async explainAgain(question: string, previousExplanation: string): Promise<any> {
    if (!isAiAvailable || !model) {
      console.warn('[GeminiService] AI not available for explain-again request. Using fallback.');
      return getFallbackExplainAgainResponse(question);
    }

    const prompt = `
      You are Cogniva. The student did not fully understand this previous explanation:
      "${previousExplanation}"
      
      They were asking about: "${question}"
      
      Provide a SUBSTANTIALLY DIFFERENT explanation. Use:
      - A completely different analogy
      - A visual/step-by-step description
      - A much simpler, more beginner-friendly approach
      - Different examples and use cases
      
      Do NOT repeat what was already said. Approach it from a totally fresh angle.
      
      Respond with a JSON object strictly following this structure:
      {
        "explanation": "New, totally different explanation or analogy (2-3 sentences). Use markdown for formatting.",
        "whyItWorks": "Why it works, explained differently (1-2 sentences)",
        "example": "A brand new relatable example with code if relevant",
        "commonMistake": "Another common mistake (different from before)",
        "quickCheck": "A new quick check question",
        "nextStep": "Recommended next step"
      }
      
      Use markdown formatting where helpful.
      Return ONLY valid JSON. No markdown code fences around the JSON itself.
    `;
    
    try {
      console.log('[GeminiService] Sending explain-again request to Gemini API');
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(jsonStr);
      
      console.log('[GeminiService] Successfully received alternative explanation');
      return { ...parsed, isDemo: false };
    } catch (error: any) {
      console.error('[GeminiService] Explain-again request failed:', error.message);
      return getFallbackExplainAgainResponse(question);
    }
  },

  async generateEducatorRecommendation(metrics: any): Promise<string> {
    if (!isAiAvailable || !model) {
      return `${metrics.totalStudents || 0} students enrolled. Focus on the concepts with the highest confusion rates and consider scheduling a review session for at-risk students.`;
    }

    try {
      const prompt = `
        You are an AI assistant for educators. Analyze these class metrics and provide a concise, actionable 2-sentence recommendation for their next lecture.
        Metrics: ${JSON.stringify(metrics)}
        
        Return ONLY the text recommendation. No JSON, no markdown.
      `;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
       console.error('Gemini API Error:', error);
       return 'Unable to generate recommendation at this time. Review your class confusion metrics and prioritize the most common student struggles.';
    }
  },

  async generateMiniLesson(conceptName: string): Promise<any> {
    if (!isAiAvailable || !model) {
      return {
        reExplanation: `Let's revisit ${conceptName} from a different angle. Try breaking it down into smaller, more manageable pieces and focus on the core principle before tackling edge cases.`,
        workedExample: `Walk through a simple case of ${conceptName} step by step: identify the inputs, trace through the process, and verify the output matches expectations.`,
        commonMistake: `A frequent pitfall with ${conceptName} is jumping to implementation without fully understanding the underlying concept. Make sure the fundamentals are solid first.`
      };
    }

    try {
      const prompt = `
        You are an expert curriculum designer. An educator requested a mini-lesson for the concept "${conceptName}" because students are highly confused by it.
        
        Generate a structured 3-point mini-lesson containing:
        1. "reExplanation": A fresh angle/re-explanation of the concept (2-3 sentences).
        2. "workedExample": A concrete, worked-out example.
        3. "commonMistake": A specific callout of a common mistake/gotcha.
        
        Respond with a JSON object exactly like this:
        {
          "reExplanation": "...",
          "workedExample": "...",
          "commonMistake": "..."
        }
        Return ONLY valid JSON. No markdown formatting around it.
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        reExplanation: `Let's revisit ${conceptName} from a different angle. Try breaking it down into smaller, more manageable pieces and focus on the core principle before tackling edge cases.`,
        workedExample: `Walk through a simple case of ${conceptName} step by step: identify the inputs, trace through the process, and verify the output matches expectations.`,
        commonMistake: `A frequent pitfall with ${conceptName} is jumping to implementation without fully understanding the underlying concept. Make sure the fundamentals are solid first.`
      };
    }
  },

  async generatePracticeQuestions(conceptName: string, conceptDescription?: string): Promise<any[]> {
    if (!isAiAvailable || !model) {
      return [
        {
          question_type: 'mcq',
          question_text: `What is the primary purpose or characteristic of ${conceptName}?`,
          options: [
            `To optimize system resource allocation for ${conceptName}`,
            `To store and manage dynamic state variables`,
            `To provide a structured mechanism to execute operations on ${conceptName}`,
            `To isolate logical operations from execution contexts`
          ],
          correct_answer: `To optimize system resource allocation for ${conceptName}`,
          explanation: `This option represents a standard conceptual use case of ${conceptName}.`
        },
        {
          question_type: 'mcq',
          question_text: `Which of the following is a common mistake when implementing ${conceptName}?`,
          options: [
            `Ignoring boundary constraints and data validation`,
            `Using redundant data structures for storage`,
            `Failing to update tracking metrics periodically`,
            `All of the above`
          ],
          correct_answer: `All of the above`,
          explanation: `Each of these options constitutes a typical gotcha when dealing with ${conceptName}.`
        }
      ];
    }

    try {
      const prompt = `
        You are an expert computer science professor.
        Generate 5 multiple-choice questions (MCQs) to test a student's understanding of the concept: "${conceptName}" (${conceptDescription || 'general concept'}).
        
        Respond with a JSON array where each object strictly follows this structure:
        {
          "question_type": "mcq",
          "question_text": "A clear, conceptual question about the topic",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "The exact string from the options array that is correct",
          "explanation": "Detailed explanation of why the correct answer is right and why others are wrong."
        }
        
        Ensure options are distinct, plausible, and the correct_answer is exactly character-matching one of the options.
        Return ONLY valid JSON. No markdown code fences around the JSON itself.
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(jsonStr);
      
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('Error generating questions:', error);
      return [
        {
          question_type: 'mcq',
          question_text: `What is the primary purpose or characteristic of ${conceptName}?`,
          options: [
            `To optimize system resource allocation for ${conceptName}`,
            `To store and manage dynamic state variables`,
            `To provide a structured mechanism to execute operations on ${conceptName}`,
            `To isolate logical operations from execution contexts`
          ],
          correct_answer: `To optimize system resource allocation for ${conceptName}`,
          explanation: `This option represents a standard conceptual use case of ${conceptName}.`
        }
      ];
    }
  }
};

// --- Fallback Helpers ---

function getFallbackTutorResponse(question: string, hasMomentContext: boolean) {
  const q = question.toLowerCase();
  
  // Comprehensive fallback responses for common CS concepts
  if (q.includes('big-o') || q.includes('big-theta') || q.includes('big o') || q.includes('big theta') || q.includes('complexity')) {
    return {
      explanation: "Great question! **Big-O notation** describes how the runtime or space requirements of an algorithm grow as the input size increases. **O(1)** is constant time, **O(n)** is linear, **O(log n)** is logarithmic, and **O(n²)** is quadratic. Think of it as a way to compare algorithm efficiency.",
      whyItWorks: "By focusing on the dominant term and ignoring constants, Big-O gives us a clear way to compare algorithms at scale. It tells us which algorithm will be faster for large datasets.",
      example: "```python\n# O(1) - Constant time\narray[5]\n\n# O(n) - Linear time\nfor item in array:\n    print(item)\n\n# O(n²) - Quadratic time\nfor i in array:\n    for j in array:\n        print(i, j)\n```",
      commonMistake: "Forgetting that Big-O describes **worst-case** behavior. An algorithm might perform well on small inputs but terribly on large ones.",
      quickCheck: "What's the Big-O complexity of searching through an unsorted array for a specific value?",
      nextStep: "Practice identifying time complexity in your own code, then explore space complexity.",
      isDemo: true,
      hasMomentContext
    };
  }
  
  if (q.includes('binary search') || q.includes('search algorithm')) {
    return {
      explanation: "**Binary search** is a divide-and-conquer algorithm that finds a target value in a **sorted** array in O(log n) time. Each step eliminates half the remaining elements by comparing the middle element with the target.",
      whyItWorks: "By halving the search space each iteration, binary search reduces a million-item search to just ~20 comparisons. That's the power of logarithmic time complexity!",
      example: "```javascript\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1; // Not found\n}\n```",
      commonMistake: "Trying to use binary search on an **unsorted** array. It only works when the data is sorted!",
      quickCheck: "How many comparisons does binary search need for an array of 1024 elements in the worst case?",
      nextStep: "Implement binary search yourself, then try variations like finding the first occurrence of a value.",
      isDemo: true,
      hasMomentContext
    };
  }

  if (q.includes('recursion') || q.includes('recursive')) {
    return {
      explanation: "**Recursion** is when a function calls itself to solve smaller instances of the same problem. Every recursive function needs: **(1) a base case** to stop, and **(2) a recursive case** that breaks down the problem.",
      whyItWorks: "Recursion simplifies complex problems by reducing them to simpler versions. It's particularly elegant for tree traversal, searching, and mathematical sequences.",
      example: "```python\ndef factorial(n):\n    # Base case\n    if n <= 1:\n        return 1\n    # Recursive case\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # Output: 120\n```",
      commonMistake: "Forgetting the base case leads to infinite recursion and stack overflow errors!",
      quickCheck: "What happens if you call `factorial(5)` in the example above? Trace through the recursive calls.",
      nextStep: "Try converting a recursive solution to an iterative one using a stack.",
      isDemo: true,
      hasMomentContext
    };
  }

  if (q.includes('hash') || q.includes('dictionary') || q.includes('map')) {
    return {
      explanation: "A **hash table** (or hash map) stores key-value pairs and provides O(1) average-case lookups. It uses a **hash function** to convert keys into array indices, allowing direct access to values.",
      whyItWorks: "Instead of searching through all elements, hash tables compute the exact location where a value should be stored or retrieved, making operations extremely fast.",
      example: "```javascript\nconst studentGrades = new Map();\nstudentGrades.set('Alice', 95);\nstudentGrades.set('Bob', 87);\nconsole.log(studentGrades.get('Alice')); // 95 in O(1) time!\n```",
      commonMistake: "Not handling **hash collisions**. When two keys hash to the same index, you need a strategy like chaining or open addressing.",
      quickCheck: "Why is a hash table faster than searching through an array?",
      nextStep: "Learn about hash collision resolution strategies and when to use hash tables vs. arrays.",
      isDemo: true,
      hasMomentContext
    };
  }

  if (q.includes('dynamic programming') || q.includes('dp') || q.includes('memoization')) {
    return {
      explanation: "**Dynamic Programming (DP)** optimizes recursive solutions by storing previously computed results. Instead of recalculating the same subproblems, we **memoize** (cache) them for instant reuse.",
      whyItWorks: "DP transforms exponential-time algorithms into polynomial-time by eliminating redundant work. It's essential for optimization problems.",
      example: "```python\n# Without DP: O(2^n) - very slow!\ndef fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n\n# With DP: O(n) - fast!\ndef fib_dp(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib_dp(n-1, memo) + fib_dp(n-2, memo)\n    return memo[n]\n```",
      commonMistake: "Not identifying the overlapping subproblems. DP only helps when you're solving the same subproblem multiple times.",
      quickCheck: "How many times would `fib(5)` calculate `fib(2)` without memoization?",
      nextStep: "Practice the Knapsack problem and Longest Common Subsequence to master DP patterns.",
      isDemo: true,
      hasMomentContext
    };
  }

  if (q.includes('linked list')) {
    return {
      explanation: "A **linked list** is a linear data structure where elements (nodes) are connected via pointers. Each node contains **data** and a **reference to the next node**. Unlike arrays, linked lists don't need contiguous memory.",
      whyItWorks: "Linked lists excel at insertions and deletions (O(1) at the head), since you just redirect pointers. No shifting elements like in arrays!",
      example: "```java\nclass Node {\n    int data;\n    Node next;\n}\n\nNode head = new Node(10);\nhead.next = new Node(20);\nhead.next.next = new Node(30);\n// 10 -> 20 -> 30 -> null\n```",
      commonMistake: "Losing the reference to the head node. Always keep track of where your list starts!",
      quickCheck: "What's the time complexity to access the 100th element in a linked list?",
      nextStep: "Implement reversal of a linked list and detect cycles using Floyd's algorithm.",
      isDemo: true,
      hasMomentContext
    };
  }

  if (q.includes('tree') || q.includes('binary tree')) {
    return {
      explanation: "A **binary tree** is a hierarchical structure where each node has at most two children (left and right). **Binary Search Trees (BST)** maintain the property: left < parent < right, enabling O(log n) searches.",
      whyItWorks: "Trees model hierarchical relationships naturally. BSTs combine the search speed of binary search with the flexibility of linked structures.",
      example: "```python\nclass TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\nroot = TreeNode(10)\nroot.left = TreeNode(5)\nroot.right = TreeNode(15)\n```",
      commonMistake: "Confusing tree **height** with **depth**. Height is the distance from a node to the deepest leaf; depth is distance from root to the node.",
      quickCheck: "In a balanced BST with 1000 nodes, what's the maximum height?",
      nextStep: "Learn tree traversals: inorder, preorder, postorder, and level-order.",
      isDemo: true,
      hasMomentContext
    };
  }

  if (q.includes('sort') || q.includes('quicksort') || q.includes('mergesort')) {
    return {
      explanation: "**Sorting algorithms** arrange elements in order. **QuickSort** uses divide-and-conquer with a pivot (O(n log n) average), while **MergeSort** splits and merges (O(n log n) worst-case). **Bubble Sort** is simple but slow (O(n²)).",
      whyItWorks: "Efficient sorting enables faster searching and data analysis. Many algorithms require sorted data as a prerequisite.",
      example: "```python\n# QuickSort in action\ndef quicksort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n```",
      commonMistake: "Using Bubble Sort for large datasets. It's O(n²) and too slow for production use.",
      quickCheck: "Which sorting algorithm is more stable: QuickSort or MergeSort?",
      nextStep: "Compare time and space complexity of different sorting algorithms.",
      isDemo: true,
      hasMomentContext
    };
  }

  if (q.includes('graph') || q.includes('dfs') || q.includes('bfs')) {
    return {
      explanation: "**Graphs** represent networks of nodes (vertices) connected by edges. **DFS (Depth-First Search)** explores as far as possible before backtracking, while **BFS (Breadth-First Search)** explores neighbors level by level.",
      whyItWorks: "Graphs model real-world relationships: social networks, maps, dependencies. DFS and BFS are fundamental for traversing these structures.",
      example: "```python\n# BFS using a queue\nfrom collections import deque\n\ndef bfs(graph, start):\n    visited = set()\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        if node not in visited:\n            print(node)\n            visited.add(node)\n            queue.extend(graph[node])\n```",
      commonMistake: "Not marking nodes as visited, leading to infinite loops in cyclic graphs.",
      quickCheck: "Which algorithm (DFS or BFS) would you use to find the shortest path in an unweighted graph?",
      nextStep: "Implement Dijkstra's algorithm for weighted shortest paths.",
      isDemo: true,
      hasMomentContext
    };
  }

  // Generic intelligent fallback for any other topic
  return {
    explanation: `Great question about **"${question}"**! This is a fundamental concept in computer science. Let me break it down: it's about understanding the patterns and structures that make algorithms efficient and code maintainable. Think of it as learning the building blocks that power modern software.`,
    whyItWorks: "Mastering this concept gives you the tools to write better, faster, and more scalable code. It's a foundation that applies across all programming domains.",
    example: "```python\n# Example conceptual pattern\ndef solve_problem(input_data):\n    # Analyze the problem\n    # Break it into smaller parts\n    # Solve systematically\n    return solution\n```",
    commonMistake: "Trying to memorize rather than understand. Focus on the **why** behind the concept, not just the **what**.",
    quickCheck: "Can you explain this concept to someone else in your own words? Teaching is the best way to verify understanding.",
    nextStep: "Practice with real problems. Theory is important, but hands-on coding solidifies learning.",
    isDemo: true,
    hasMomentContext
  };
}

function getFallbackExplainAgainResponse(question: string) {
  return {
    explanation: "Let's try a completely different analogy. Imagine you are building a house. The foundation is crucial before you put up the walls. This concept is exactly like that foundation.",
    whyItWorks: "By breaking it down into smaller, manageable pieces, it becomes much easier to tackle complex problems without getting overwhelmed.",
    example: "```javascript\nconst buildFoundation = () => {\n  return 'Strong base built';\n};\n```",
    commonMistake: "Sometimes people try to build the roof before the walls. In programming, this means writing complex logic before setting up the basic structure.",
    quickCheck: "Does this new analogy make more sense to you?",
    nextStep: "Let's try a quick practice exercise to lock in this understanding.",
    isDemo: false
  };
}



