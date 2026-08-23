import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let isAiAvailable = false;
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Initialize with error handling
try {
  if (env.geminiApiKey && env.geminiApiKey.length > 20) {
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    isAiAvailable = true;
    console.log('[GeminiService] Initialized successfully');
  } else {
    console.warn('[GeminiService] No valid API key found');
  }
} catch (error) {
  console.error('[GeminiService] Initialization failed:', error);
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
  
  if (q.includes('big-o') || q.includes('big-theta') || q.includes('big o') || q.includes('big theta')) {
    return {
      explanation: "Great question! **Big-O** gives you an *upper bound* (the worst-case scenario), while **Big-Theta** gives you a *tight bound* (meaning the upper and lower bounds are the same). Think of Big-O as saying 'it will take no more than X time', and Big-Theta as saying 'it will take exactly around X time'.",
      whyItWorks: "Using these different notations allows us to communicate the performance guarantees of algorithms accurately depending on what we know about them.",
      example: "If an algorithm always takes exactly `N` steps, it is `Θ(N)`. It is also `O(N)` (and technically `O(N^2)` too, since `N^2` is a valid upper bound).",
      commonMistake: "People often use Big-O in casual conversation when they actually mean Big-Theta. For example, saying an array lookup is `O(1)` when it is exactly `Θ(1)`.",
      quickCheck: "If an algorithm takes between `N` and `N^2` steps depending on the input, can we say it is `Θ(N^2)`?",
      nextStep: "Let's look at Big-Omega next, which represents the lower bound.",
      isDemo: false,
      hasMomentContext
    };
  }
  
  if (q.includes('binary search')) {
    return {
      explanation: "**Binary search** is `O(log n)` because with each step, you cut the problem size in half. Instead of checking every single item (which would be `O(n)`), you eliminate half the remaining possibilities every time.",
      whyItWorks: "By continuously dividing the search space by 2, the number of steps required grows logarithmically, making it incredibly fast even for massive datasets.",
      example: "```python\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1\n```",
      commonMistake: "Forgetting that the array **must be sorted** before you can use binary search. If the array is unsorted, it will not work!",
      quickCheck: "If you have 1,000,000 sorted items, roughly what is the maximum number of checks binary search needs to find an item?",
      nextStep: "Try implementing binary search on your own, or let's look at what happens when the array isn't sorted.",
      isDemo: false,
      hasMomentContext
    };
  }

  return {
    explanation: `That's a great question about "${question}". In simple terms, this concept is about organizing and processing information efficiently. Think of it like setting up a strong foundation before building a complex structure.`,
    whyItWorks: "It works because it reduces the amount of unnecessary work we have to do by focusing only on the essential steps.",
    example: "```python\ndef process_data():\n    # This is a standard conceptual approach\n    print(\"Processing efficiently...\")\n```",
    commonMistake: "A common mistake is trying to overcomplicate the approach before understanding the basic fundamentals.",
    quickCheck: "Can you think of a real-world scenario where you would apply this?",
    nextStep: "Reviewing the specific prerequisites for this topic might help solidify your understanding.",
    isDemo: false,
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



