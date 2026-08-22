import React from 'react';
import { useAuth } from './useAuth';
import { mockData } from './mockData';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

// ─── Initialize Realtime Broadcast for Demo Sync ────────
const demoChannel = supabase.channel('demo-sync', {
  config: { broadcast: { self: true } }
});

demoChannel.on('broadcast', { event: 'confusion_signal' }, (payload) => {
  const { body, user } = payload.payload;
  applyConfusionSignalToMockData(body, user);
  window.dispatchEvent(new CustomEvent('mockDataUpdated'));
}).on('broadcast', { event: 'session_created' }, (payload) => {
  const { session } = payload.payload;
  // Make sure we don't duplicate if we created it ourselves
  if (!mockData.studyGroupSessions.find(s => s.id === session.id)) {
    mockData.studyGroupSessions.unshift(session);
    window.dispatchEvent(new CustomEvent('mockDataUpdated'));
  }
}).subscribe();

function applyConfusionSignalToMockData(body: any, user: any) {
  const conceptName = body.concept || 'Newly Submitted Concept';
  const courseId = body.courseId || 'cse2101';

  mockData.pulse.unshift({
    status: body.signal === 'Confused' ? 'HIGH' : body.signal === 'Partially Clear' ? 'MEDIUM' : 'LOW',
    name: conceptName,
    student_name: user?.name || 'Current Student',
    time: 'Just now',
    confusion_percentage: 100
  });

  // @ts-ignore
  if (!mockData.courseAnalytics[courseId]) {
    // @ts-ignore
    mockData.courseAnalytics[courseId] = JSON.parse(JSON.stringify(mockData.educatorAnalytics));
  }

  // @ts-ignore
  const analytics = mockData.courseAnalytics[courseId];
  
  const metric = analytics.confusionMetrics.find((m: any) => m.name === conceptName);
  if (metric) {
    metric.confusion_percentage = Math.min(100, metric.confusion_percentage + (body.signal === 'Confused' ? 15 : 5));
  } else {
    analytics.confusionMetrics.push({ name: conceptName, confusion_percentage: body.signal === 'Confused' ? 70 : 40 });
  }

  analytics.confusionMetrics.sort((a: any, b: any) => b.confusion_percentage - a.confusion_percentage);

  const mostConfusing = analytics.confusionMetrics[0];
  analytics.mostConfusing = {
    concept_id: body.concept_id || 'auto-gen-id',
    name: mostConfusing.name,
    confusion_percentage: mostConfusing.confusion_percentage
  };

  analytics.aiRecommendation = `Alert: Spiking confusion detected! ${mostConfusing.confusion_percentage}% of your class is now struggling with ${mostConfusing.name}. A mini-lesson is highly recommended.`;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useApi() {
  const { user, logout } = useAuth();

  const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    // ─── Attach Bearer token instead of spoofable headers ────────
    const token = await authService.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Try hitting real backend first, fallback to mock data if backend is unavailable
    const USE_REAL_BACKEND = import.meta.env.VITE_USE_REAL_BACKEND !== 'false'; // Default to true
    
    if (USE_REAL_BACKEND) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: options.method || 'GET',
          headers,
          body: options.body
        });
        
        if (res.ok) {
          return await res.json();
        }
        
        // If endpoint doesn't exist (404) or server error, fall through to mock data
        console.warn(`Backend returned ${res.status} for ${endpoint}, using mock data`);
      } catch (e: any) {
        console.warn(`Backend unavailable for ${endpoint}, using mock data:`, e.message);
      }
    }
    
    // FALLBACK: Mock data when backend is unavailable
    await new Promise(resolve => setTimeout(resolve, 300)); // Small artificial delay

    if (endpoint === '/analytics/student') return mockData.studentAnalytics;
    if (endpoint.startsWith('/analytics/educator')) {
      const url = new URL('http://localhost' + endpoint);
      const courseId = url.searchParams.get('courseId') || 'cse2101';
      
      // @ts-ignore
      if (!mockData.courseAnalytics[courseId]) {
        // @ts-ignore
        mockData.courseAnalytics[courseId] = JSON.parse(JSON.stringify(mockData.educatorAnalytics));
      }
      
      // @ts-ignore
      const analytics = mockData.courseAnalytics[courseId];
      return analytics;
    }
    if (endpoint === '/courses') return mockData.courses;
    if (endpoint.startsWith('/courses/')) {
      const id = endpoint.split('/')[2];
      const course = mockData.courses.find(c => c.id === id);
      if (course) {
        return {
          ...mockData.courseDetail,
          id: course.id,
          title: course.name,
          description: course.description,
          lessons: course.lessons || mockData.courseDetail.lessons
        };
      }
      return mockData.courseDetail;
    }
    if (endpoint.startsWith('/confusion/pulse')) return mockData.pulse;
    if (endpoint.startsWith('/confusion/history')) return mockData.confusionHistory;
    if (endpoint.startsWith('/concepts/graph')) return mockData.conceptGraph;
    if (endpoint.startsWith('/notifications')) return mockData.notifications;
    if (endpoint === '/study-groups/matches') return mockData.studyGroupMatches;
    if (endpoint === '/study-groups/sessions') return mockData.studyGroupSessions;
    if (endpoint === '/revision/plan') return mockData.studentAnalytics.revisionPlan;
    if (endpoint.startsWith('/practice?')) {
      const url = new URL('http://localhost' + endpoint);
      const conceptId = url.searchParams.get('concept_id');
      if (conceptId && (mockData.practiceQuestions as any)[conceptId]) {
        return (mockData.practiceQuestions as any)[conceptId];
      }
      return [];
    }
    
    if (options.method === 'POST') {
      if (endpoint === '/confusion/signal') {
        const body = JSON.parse(options.body as string);
        
        // Broadcast the event to all connected clients (including ourselves, thanks to self: true)
        demoChannel.send({
          type: 'broadcast',
          event: 'confusion_signal',
          payload: { body, user }
        });

        return { success: true };
      }
      if (endpoint === '/educator/mini-lesson') return { reExplanation: "Mock explanation: This approach simplifies the core concepts so students understand it better.", workedExample: "Example: x = 5", commonMistake: "Mistaking X for Y" };
      
      if (endpoint === '/educator/intervene') {
        const body = JSON.parse(options.body as string);
        const newNotification = {
          id: 'n' + Date.now(),
          type: 'intervention',
          message: body.message || 'Your educator sent an intervention.',
          topic: body.topic,
          created_at: new Date().toISOString(),
          read: false
        };
        mockData.notifications.unshift(newNotification);
        return { success: true, message: 'Intervention sent successfully.' };
      }

      if (endpoint === '/revision/generate-smart-plan') {
        mockData.studentAnalytics.revisionPlan = [
          {
            id: 'mock-plan-1',
            concept_id: 'c1-con1',
            priority: 'High',
            minutes: 15,
            concepts: { name: 'Big O Notation' }
          },
          {
            id: 'mock-plan-2',
            concept_id: 'c3-con1',
            priority: 'Medium',
            minutes: 25,
            concepts: { name: 'Binary Search Trees' }
          }
        ];
        return { message: 'Smart revision plan generated successfully!' };
      }

      if (endpoint === '/practice/attempt') {
        const body = JSON.parse(options.body as string);
        console.log('[Mock Backend] Logged practice attempt:', body);
        return { success: true };
      }

      if (endpoint === '/study-groups/connect') {
        const body = JSON.parse(options.body as string);
        console.log('[Mock Backend] Connected to peer:', body.peerId);
        return { success: true };
      }

      if (endpoint === '/study-groups/sessions') {
        const body = JSON.parse(options.body as string);
        const newSession = {
          id: 's' + Date.now(),
          title: body.title,
          topic: body.topic,
          participants: 1,
          isLive: true
        };
        mockData.studyGroupSessions.unshift(newSession);
        
        // Broadcast the event
        demoChannel.send({
          type: 'broadcast',
          event: 'session_created',
          payload: { session: newSession }
        });

        return newSession;
      }

      if (endpoint.startsWith('/study-groups/sessions/') && endpoint.endsWith('/join')) {
        const id = endpoint.split('/')[2];
        const session = mockData.studyGroupSessions.find((s: any) => s.id === id);
        if (session) {
          session.participants += 1;
        }
        return { success: true };
      }

      if (endpoint === '/tutor/chat') {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        const q = (body.question || '').toLowerCase();
        
        let explanation = `Here is a breakdown to help you understand "${body.question}".`;
        let whyItWorks = "This works because it breaks the problem down into smaller, manageable chunks.";
        let example = "Imagine you have a sorted dictionary. Instead of reading page by page, you open it in the middle. If the word is earlier, you only search the first half. You keep halving it.";
        let commonMistake = "A common mistake is forgetting the edge cases, like when the item doesn't exist.";
        let quickCheck = "If you double the input size, how much longer does it take? (Hint: just 1 more step!)";
        
        if (q.includes('binary search') || q.includes('log')) {
          explanation = "Binary search is O(log n) because at each step, you eliminate half of the remaining elements. You don't have to look at every single item.";
          whyItWorks = "By dividing the search space in half repeatedly, the number of steps required grows logarithmically, not linearly.";
          example = "Think of a phone book. To find 'Smith', you open the middle, see 'M', and know 'Smith' is in the second half. You just eliminated half the book in one step!";
          commonMistake = "Forgetting that the array MUST be sorted first before you can use binary search.";
          quickCheck = "What is the maximum number of steps to find an item in a sorted array of 16 elements using binary search?";
        } else if (q.includes('normalization')) {
          explanation = "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.";
          whyItWorks = "It works by dividing larger tables into smaller, related tables and linking them using relationships (foreign keys).";
          example = "Instead of storing a customer's address on every single order row, you store it once in a 'Customers' table and link it to the 'Orders' table.";
          commonMistake = "Over-normalizing, which forces the database to perform too many complex JOINs and slows down read queries.";
          quickCheck = "What is the primary goal of 1st Normal Form (1NF)?";
        }

        return {
          isDemo: true,
          explanation,
          whyItWorks,
          example,
          commonMistake,
          quickCheck,
          nextStep: "Try applying this to the practice problem in Module 2."
        };
      }

      if (endpoint === '/tutor/explain-again') {
        return {
          isDemo: true,
          explanation: "Let me try explaining it with an analogy this time. Think of it like sorting a deck of cards. You don't look at all 52 cards at once.",
          whyItWorks: "Analogies map abstract technical concepts to familiar physical actions, giving your brain an anchor.",
          example: "If you want to find the Ace of Spades, you can split the deck into red and black, discard the red, split the black into spades and clubs, discard the clubs. You are filtering!",
          commonMistake: "Trying to memorize the code syntax before understanding the physical logic.",
          quickCheck: "Does this card deck analogy make the concept feel more intuitive?",
          nextStep: "Let's write out the logic in plain English pseudo-code before writing real code."
        };
      }
      
      if (endpoint === '/ml/early-warning') {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return {
          success: true,
          risk_probability: 0.82,
          risk_level: 'high',
          risk_percentage: 82,
          recommended_action: 'Review prerequisite concepts before proceeding',
          model: 'early_warning',
          feature_contributions: [
            { factor: 'Prerequisite mastery is low', value: '40%', impact: 'high' },
            { factor: 'Learning velocity is declining', value: '-0.10', impact: 'medium' }
          ]
        };
      }

      if (endpoint === '/ml/student-profile') {
        return {
          success: true,
          cluster: 'Steady Learner',
          cluster_id: 1,
          confidence: 0.85,
          model: 'kmeans_student_profile',
          profile_description: 'You have a consistent and reliable learning pace. Your systematic approach serves you well.'
        };
      }
      
      if (endpoint === '/ml/learning-risk') {
        return {
          success: true,
          at_risk: true,
          risk_probability: 0.78,
          risk_level: 'high',
          contributing_factors: [
            { factor: 'Rapid drop in accuracy', impact: 'high' },
            { factor: 'Increased time spent per problem', impact: 'medium' }
          ]
        };
      }

      if (endpoint === '/ml/nlp-classifier') {
        const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        return {
          success: true,
          text: body.text || 'I do not understand this at all',
          sentiment: 'negative',
          intent: 'request_explanation',
          topic: 'general',
          urgency: 0.85
        };
      }
      
      if (endpoint === '/ml/recommendation') {
        return {
          success: true,
          next_best_action: 'review_prerequisites',
          target_concept: 'c1-con1',
          confidence: 0.92,
          reasoning: 'Mastery in foundational concepts is low.'
        };
      }
      
      if (endpoint === '/ml/concept-difficulty') {
        return {
          success: true,
          difficulty_score: 75,
          difficulty_level: 'hard',
          adaptive_level: 'hard',
          estimated_time_mins: 15,
          prerequisite_mastery_required: 0.8,
          common_misconception: 'Students confuse recursion depth with time complexity',
          average_time_spent: 840
        };
      }

      // Match revision completion
      if (endpoint.startsWith('/revision/') && endpoint.endsWith('/complete')) {
        const id = endpoint.split('/')[2];
        mockData.studentAnalytics.revisionPlan = mockData.studentAnalytics.revisionPlan.filter((p: any) => p.id !== id);
        mockData.studentAnalytics.masteredCount += 1;
        if (mockData.studentAnalytics.needsAttentionCount > 0) {
          mockData.studentAnalytics.needsAttentionCount -= 1;
        }
        mockData.studentAnalytics.learningScore = Math.min(100, mockData.studentAnalytics.learningScore + 5);
        return { success: true };
      }

      // Match notification read
      if (endpoint.startsWith('/notifications/') && endpoint.endsWith('/read')) {
        const id = endpoint.split('/')[2];
        mockData.notifications = mockData.notifications.map((n: any) => 
          n.id === id ? { ...n, read: true } : n
        );
        return { success: true };
      }
    }
    
    return null;
  };

  const api = React.useMemo(() => ({
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  }), [user]); // user is the only dependency that changes the headers

  return api;
}
