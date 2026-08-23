import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const isAiAvailable = !!env.geminiApiKey;
const genAI = isAiAvailable ? new GoogleGenerativeAI(env.geminiApiKey) : null;
const model = isAiAvailable ? genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

export const geminiService = {
  isAvailable: () => isAiAvailable,

  async askTutor(question: string, context?: string, momentContext?: string): Promise<any> {
    if (!isAiAvailable || !model) {
      throw new Error('AI Tutor is temporarily unavailable. Please check your configuration and try again.');
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
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean up markdown if model returned it despite instructions
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);
    
    return { ...parsed, isDemo: false, hasMomentContext: !!momentContext };
  },

  async explainAgain(question: string, previousExplanation: string): Promise<any> {
    if (!isAiAvailable || !model) {
      throw new Error('AI Tutor is temporarily unavailable. Please check your configuration and try again.');
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
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);
    
    return { ...parsed, isDemo: false };
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


