import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const isAiAvailable = !!env.geminiApiKey;
const genAI = isAiAvailable ? new GoogleGenerativeAI(env.geminiApiKey) : null;
const model = isAiAvailable ? genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

export const geminiService = {
  isAvailable: () => isAiAvailable,

  async askTutor(question: string, context?: string): Promise<any> {
    if (!isAiAvailable || !model) {
      // Return Fallback Demo Mode Response
      return {
        explanation: "Demo Mode: Binary search works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
        whyItWorks: "It works because in a sorted array, checking the middle element tells you exactly which half of the array your target must be in.",
        example: "Like looking up a word in a dictionary. You don't read page by page; you open the middle, see if your word is earlier or later, and repeat.",
        commonMistake: "Forgetting that the array MUST be sorted before you can use binary search.",
        quickCheck: "If you have 100 items, what is the maximum number of checks binary search needs? (Answer: roughly 7)",
        nextStep: "Practice implementing binary search in code.",
        isDemo: true
      };
    }

    try {
      const prompt = `
        You are an expert, encouraging AI Tutor named Cogniva.
        The student has asked: "${question}"
        Context: ${context || 'None'}
        
        Respond with a JSON object strictly following this structure:
        {
          "explanation": "Simple, beginner-friendly explanation (2-3 sentences)",
          "whyItWorks": "Why this concept works or matters (1-2 sentences)",
          "example": "A concrete, relatable example",
          "commonMistake": "One common mistake or misconception",
          "quickCheck": "A quick question to check their understanding",
          "nextStep": "Recommended next step"
        }
        Return ONLY valid JSON. No markdown formatting around it.
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Clean up markdown if model returned it despite instructions
      const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      return { ...JSON.parse(jsonStr), isDemo: false };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  },

  async explainAgain(question: string, previousExplanation: string): Promise<any> {
    if (!isAiAvailable || !model) {
      return {
        explanation: "Demo Alternative: Imagine guessing a number between 1 and 100. If you guess 50 and I say \"higher\", you've instantly eliminated 1-50. That's the power of binary search.",
        whyItWorks: "Every step cuts the problem size in half, making it incredibly fast even for massive datasets.",
        example: "Searching a phone book with 1 million names takes at most 20 checks.",
        commonMistake: "Calculating the middle index incorrectly, leading to an infinite loop or out-of-bounds error (e.g. integer overflow).",
        quickCheck: "Why is O(log n) better than O(n)?",
        nextStep: "Try writing the condition for when the search should terminate.",
        isDemo: true
      };
    }

    try {
      const prompt = `
        You are Cogniva. The student did not fully understand this previous explanation:
        "${previousExplanation}"
        
        They were asking about: "${question}"
        
        Provide a SUBSTANTIALLY DIFFERENT explanation. Use an analogy, a visual description, or a much simpler beginner-friendly approach. Do not just repeat what was said.
        
        Respond with a JSON object strictly following this structure:
        {
          "explanation": "New, totally different explanation or analogy (2-3 sentences)",
          "whyItWorks": "Why it works, explained differently (1-2 sentences)",
          "example": "A brand new relatable example",
          "commonMistake": "Another common mistake",
          "quickCheck": "A new quick check question",
          "nextStep": "Recommended next step"
        }
        Return ONLY valid JSON. No markdown formatting around it.
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      return { ...JSON.parse(jsonStr), isDemo: false };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate alternative AI response');
    }
  },

  async generateEducatorRecommendation(metrics: any): Promise<string> {
    if (!isAiAvailable || !model) {
      return `Demo Recommendation: 42% of students are struggling with ${metrics.highestConfusionConcept || 'Algorithm Complexity'}. Recommended intervention: Review Big-O notation with a visual example before introducing Amortized Analysis.`;
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
       return 'Unable to generate recommendation at this time.';
    }
  }
  async generateMiniLesson(conceptName: string): Promise<any> {
    if (!isAiAvailable || !model) {
      return {
        reExplanation: "Demo Re-Explanation: Let's try looking at this from a different angle. Imagine a completely different scenario where the core principle still applies.",
        workedExample: "Demo Example: Step 1: Do X. Step 2: Do Y. Result: Z.",
        commonMistake: "Demo Mistake: Watch out for assuming A is B without checking C."
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
      throw new Error('Failed to generate mini-lesson');
    }
  }
};
