import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIStudyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI study assistant. Ask me anything about your courses, concepts, or study strategies! 🎓",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { icon: 'quiz', label: 'Generate Quiz', action: 'quiz' },
    { icon: 'psychology', label: 'Explain Concept', action: 'explain' },
    { icon: 'tips_and_updates', label: 'Study Tips', action: 'tips' },
    { icon: 'schedule', label: 'Plan Schedule', action: 'schedule' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('quiz')) {
      return "I can generate a personalized quiz for you! Which concept would you like to practice? I'll create questions based on your current mastery level.";
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      return "I'd be happy to explain that! Could you tell me which specific concept you'd like me to break down? I can provide examples, analogies, and step-by-step explanations.";
    } else if (lowerMessage.includes('study') || lowerMessage.includes('tips')) {
      return "Here are some personalized study tips based on your learning patterns:\n\n1. Focus on 'Functions' - you've shown 70% mastery but haven't practiced in 3 days\n2. Review 'Classes' before moving to advanced topics\n3. Your best learning time is between 2-4 PM based on your activity\n4. Try the Pomodoro technique - 25 min focused study, 5 min break";
    } else if (lowerMessage.includes('schedule') || lowerMessage.includes('plan')) {
      return "Based on your current progress and upcoming deadlines, here's an optimized study plan:\n\n📅 Today: Review Arrays (30 min) → Practice Loops (45 min)\n📅 Tomorrow: Deep dive into Objects (1 hour)\n📅 This Week: Master Classes and Async/Await\n\nWould you like me to add these to your calendar?";
    } else if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand')) {
      return "I see you're having trouble! Let me help break this down:\n\n1. Let's start with the fundamentals\n2. I'll provide visual examples\n3. We can work through practice problems together\n\nWhich specific part is confusing?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! 👋 How can I help you with your studies today? I can explain concepts, generate quizzes, provide study tips, or help you plan your learning schedule.";
    } else {
      return "That's a great question! Based on your learning history and current progress, I recommend:\n\n• Breaking this down into smaller sub-topics\n• Starting with the prerequisite concepts you've mastered\n• Practicing with interactive exercises\n\nWould you like me to create a personalized learning path for this?";
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: simulateAIResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: { [key: string]: string } = {
      quiz: 'Generate a quiz for me',
      explain: 'Explain a concept in detail',
      tips: 'Give me study tips',
      schedule: 'Help me plan my study schedule'
    };
    
    setInputValue(actionMessages[action]);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-primary to-red-600 rounded-full shadow-2xl flex items-center justify-center group"
            style={{ boxShadow: '0 0 30px rgba(232, 64, 64, 0.5)' }}
          >
            <span className="material-symbols-outlined text-white text-[28px] group-hover:scale-110 transition-transform">
              psychology
            </span>
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-8 right-8 z-50 w-96 h-[600px] bg-surface-container rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-red-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-white text-[24px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-white">AI Study Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-white/80">Online</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </motion.button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-surface border-b border-outline-variant/10 flex gap-2 overflow-x-auto">
              {quickActions.map((action) => (
                <motion.button
                  key={action.action}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg text-on-surface hover:bg-surface-bright transition-colors whitespace-nowrap text-sm border border-outline-variant/10"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">{action.icon}</span>
                  {action.label}
                </motion.button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-on-primary rounded-br-sm'
                        : 'bg-surface-container text-on-surface rounded-bl-sm border border-outline-variant/10'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    <span className={`text-xs mt-1 block ${
                      message.type === 'user' ? 'text-on-primary/60' : 'text-on-surface-variant'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-surface-container border border-outline-variant/10 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-on-surface-variant rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-surface-container border-t border-outline-variant/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary transition-colors text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 bg-primary hover:bg-primary/90 disabled:bg-surface-bright disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-on-primary text-[24px]">send</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
