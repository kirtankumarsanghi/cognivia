import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpChild, premiumEase } from '../../utils/animation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Suggested questions for empty state
const SUGGESTED_QUESTIONS = [
  "Why is binary search O(log n)?",
  "What's the difference between Big-O and Big-Theta?",
  "Explain recursion with a simple example",
  "How do I know when to use which data structure?"
];

interface TutorResponse {
  explanation: string;
  whyItWorks: string;
  example: string;
  commonMistake: string;
  quickCheck: string;
  nextStep: string;
  isDemo?: boolean;
}

interface MessageExchange {
  id: string;
  question: string;
  response: TutorResponse | null;
  timestamp: Date;
  isLoading: boolean;
  error?: string;
  showDetails: boolean;
}

function CelebrateBurst({ onComplete }: { onComplete: () => void }) {
  const dots = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const distance = 40 + Math.random() * 30;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: dot.x, y: dot.y, opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.6, ease: premiumEase as unknown as [number, number, number, number] }}
          onAnimationComplete={i === 0 ? onComplete : undefined}
        />
      ))}
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <motion.div
        className="flex gap-1"
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            variants={{
              initial: { opacity: 0.3 },
              animate: { opacity: 1 }
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
      <span className="font-label-sm text-sm text-on-surface-variant">Thinking...</span>
    </div>
  );
}

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const wordsArray = text.split(' ');
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    // Handle visibility change
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      if (document.hidden && intervalRef.current) {
        // Pause animation when tab loses focus
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (!document.hidden && !isComplete && indexRef.current < wordsArray.length) {
        // Resume animation when tab gains focus
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const startAnimation = () => {
      if (intervalRef.current) return;
      
      intervalRef.current = setInterval(() => {
        if (indexRef.current < wordsArray.length) {
          setDisplayedText(wordsArray.slice(0, indexRef.current + 1).join(' '));
          indexRef.current++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsComplete(true);
          onComplete?.();
        }
      }, 80); // ~1.25 seconds for ~15 words
    };

    startAnimation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [text]);

  return <span>{displayedText}</span>;
}

function MessageCard({ 
  message, 
  conceptId, 
  onExplainAgain, 
  onClear, 
  onToggleDetails,
  isLatest 
}: { 
  message: MessageExchange; 
  conceptId: string | null;
  onExplainAgain: (messageId: string) => void;
  onClear: (messageId: string) => void;
  onToggleDetails: (messageId: string) => void;
  isLatest: boolean;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const navigate = useNavigate();

  const handleClear = async () => {
    setCelebrating(true);
    await onClear(message.id);
    // After celebration animation completes (600ms)
    setTimeout(() => {
      setShowConfirmation(false);
      setCelebrating(false);
      // Optionally show a success message or toast
    }, 700);
  };

  if (message.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 shadow-md"
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="material-symbols-outlined text-[20px] text-primary">person</span>
          <p className="font-body-md text-on-surface flex-1">{message.question}</p>
        </div>
        <div className="flex items-start gap-3 pl-8">
          <ThinkingIndicator />
        </div>
      </motion.div>
    );
  }

  if (message.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container border border-error/20 rounded-2xl p-6 shadow-md"
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="material-symbols-outlined text-[20px] text-primary">person</span>
          <p className="font-body-md text-on-surface flex-1">{message.question}</p>
        </div>
        <div className="bg-error-container/20 border border-error/30 rounded-xl p-4 ml-8">
          <div className="flex items-start gap-2 mb-3">
            <span className="material-symbols-outlined text-[20px] text-error">error</span>
            <p className="font-body-md text-error flex-1">{message.error}</p>
          </div>
          <button
            onClick={() => onExplainAgain(message.id)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-label-sm text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!message.response) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 shadow-md space-y-4"
    >
      {/* Question */}
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[20px] text-primary">person</span>
        <p className="font-body-md text-on-surface flex-1">{message.question}</p>
      </div>

      {/* Demo Mode Badge - Hidden for production */}
      {/* {message.response.isDemo && (
        <div className="bg-error-container text-on-error-container px-3 py-1.5 rounded-lg text-xs border border-error/20 inline-flex items-center gap-2 font-label-sm">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          Demo Mode Active - Using fallback responses
        </div>
      )} */}

      {/* Response */}
      <div className="pl-8 space-y-4">
        {/* Main Explanation with Typewriter */}
        <div className="space-y-2">
          <h3 className="font-headline-sm text-sm text-primary uppercase tracking-wider">Explanation</h3>
          <div className="font-body-lg text-body-lg text-on-surface leading-relaxed prose prose-sm max-w-none">
            {isLatest && !typewriterComplete ? (
              <TypewriterText 
                text={message.response.explanation} 
                onComplete={() => setTypewriterComplete(true)}
              />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.response.explanation}
              </ReactMarkdown>
            )}
          </div>
        </div>

        {/* Toggle for detailed sections */}
        <button
          onClick={() => onToggleDetails(message.id)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-label-sm text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {message.showDetails ? 'expand_less' : 'expand_more'}
          </span>
          {message.showDetails ? 'Show Less' : 'Show More Details'}
        </button>

        {/* Collapsible Details */}
        <AnimatePresence>
          {message.showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-2">
                <h3 className="font-label-sm text-xs text-outline uppercase tracking-wider">Why It Works</h3>
                <div className="font-body-md text-body-md text-on-surface-variant prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.response.whyItWorks}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="bg-surface-bright/50 p-4 rounded-xl border border-outline-variant/10 space-y-2">
                <h3 className="font-label-sm text-xs text-secondary uppercase tracking-wider">Example</h3>
                <div className="font-body-md text-body-md text-on-surface prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.response.example}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="bg-error/5 p-4 rounded-xl border border-error/20 space-y-2">
                <h3 className="font-label-sm text-xs text-error uppercase tracking-wider">Common Mistake</h3>
                <div className="font-body-md text-body-md text-error/90 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.response.commonMistake}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
                <h3 className="font-label-sm text-xs text-primary uppercase tracking-wider">Quick Check</h3>
                <div className="font-body-md text-body-md text-primary/90 font-medium prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.response.quickCheck}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-label-sm text-xs text-outline uppercase tracking-wider">Next Step</h3>
                <div className="font-body-md text-body-md text-on-surface flex items-start gap-2 prose prose-sm max-w-none">
                  <span className="material-symbols-outlined text-[20px] text-primary flex-shrink-0 mt-0.5">arrow_forward</span>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.response.nextStep}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => onExplainAgain(message.id)}
            className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-bright text-on-surface px-4 py-2 rounded-xl border border-outline-variant/10 transition-colors font-label-sm text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Explain Another Way
          </button>

          {!celebrating && (
            <button
              onClick={() => setShowConfirmation(!showConfirmation)}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl border border-primary/20 transition-colors font-label-sm text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Now I'm Clear
            </button>
          )}
        </div>

        {/* Confirmation */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 overflow-hidden"
            >
              <p className="font-body-sm text-sm text-on-surface">
                Great! This will mark your confusion as resolved.
              </p>
              <div className="flex gap-3">
                <div className="relative">
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl hover:opacity-90 transition-opacity font-label-sm text-sm relative z-10"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Confirm
                  </button>
                  {celebrating && (
                    <CelebrateBurst onComplete={() => {
                      // Celebration complete
                    }} />
                  )}
                </div>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-bright text-on-surface px-4 py-2 rounded-xl border border-outline-variant/10 transition-colors font-label-sm text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Tutor() {
  const [searchParams] = useSearchParams();
  const conceptId = searchParams.get('concept');
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApi();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<MessageExchange[]>([]);
  const [conceptContext, setConceptContext] = useState<{ name: string; description: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSignalId, setCurrentSignalId] = useState<string | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial question from navigation state (from confusion history)
  useEffect(() => {
    if (location.state) {
      const { initialQuestion, signalId, hasTimestamp } = location.state as any;
      if (initialQuestion) {
        setQuestion(initialQuestion);
        setCurrentSignalId(signalId || null);
        // Clear the state so it doesn't re-trigger
        navigate(location.pathname + location.search, { replace: true, state: {} });
        
        if (hasTimestamp) {
          // Automatically submit for timestamped signals
          setTimeout(() => {
            // Will use the signalId stored in state
            handleAsk(initialQuestion);
          }, 100);
        }
      }
    }
  }, []);

  // Load concept context if conceptId is provided
  useEffect(() => {
    if (conceptId) {
      api.get(`/concepts/${conceptId}`)
        .then(data => {
          setConceptContext({ name: data.name, description: data.description });
        })
        .catch(err => console.error('Failed to load concept:', err));
    }
  }, [conceptId]);

  const handleAsk = async (questionText?: string, messageIdToRetry?: string) => {
    const questionToAsk = questionText || question.trim();
    if (!questionToAsk) return;

    let messageId = messageIdToRetry;
    
    if (!messageIdToRetry) {
      // New question
      messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newMessage: MessageExchange = {
        id: messageId,
        question: questionToAsk,
        response: null,
        timestamp: new Date(),
        isLoading: true,
        showDetails: false
      };

      setMessages(prev => [...prev, newMessage]);
      setQuestion(''); // Clear input
    } else {
      // Retry existing message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageIdToRetry
            ? { ...msg, isLoading: true, error: undefined }
            : msg
        )
      );
    }

    // Set timeout for request
    requestTimeoutRef.current = setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                isLoading: false,
                error: 'Request timed out. The AI is taking too long to respond. Please try again.'
              }
            : msg
        )
      );
    }, 15000); // 15 second timeout

    try {
      let context = '';
      if (conceptId && conceptContext) {
        context = `The student is currently learning about: ${conceptContext.name} - ${conceptContext.description}.`;
      }

      const data = await api.post('/tutor/chat', { 
        question: questionToAsk, 
        concept_id: conceptId,
        signal_id: currentSignalId
      });

      // Clear timeout on success
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                response: data,
                isLoading: false,
                error: undefined,
                showDetails: false
              }
            : msg
        )
      );
    } catch (err: any) {
      // Clear timeout on error
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      const errorMessage = err.message || 'Failed to get a response from the AI. Please try again.';
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                isLoading: false,
                error: errorMessage
              }
            : msg
        )
      );
    }
  };

  const handleExplainAgain = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.response) return;

    // Create a new message for the alternative explanation
    const newMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage: MessageExchange = {
      id: newMessageId,
      question: `${message.question} (explained differently)`,
      response: null,
      timestamp: new Date(),
      isLoading: true,
      showDetails: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Set timeout
    requestTimeoutRef.current = setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessageId
            ? {
                ...msg,
                isLoading: false,
                error: 'Request timed out. Please try again.'
              }
            : msg
        )
      );
    }, 15000);

    try {
      const data = await api.post('/tutor/explain-again', {
        question: message.question,
        previousExplanation: message.response.explanation
      });

      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessageId
            ? {
                ...msg,
                response: data,
                isLoading: false,
                showDetails: false
              }
            : msg
        )
      );
    } catch (err: any) {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessageId
            ? {
                ...msg,
                isLoading: false,
                error: err.message || 'Failed to generate alternative explanation.'
              }
            : msg
        )
      );
    }
  };

  const handleClear = async (messageId: string) => {
    if (conceptId) {
      try {
        await api.post('/confusion/signal', { concept_id: conceptId, signal: 'Clear' });
        console.log('Clarity signal sent successfully for message:', messageId);
      } catch (err) {
        console.error('Failed to signal clarity:', err);
      }
    }
  };

  const handleToggleDetails = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, showDetails: !msg.showDetails } : msg
      )
    );
  };

  const handleSuggestedQuestion = (suggestedQuestion: string) => {
    setQuestion(suggestedQuestion);
    handleAsk(suggestedQuestion);
  };

  // Generate follow-up suggestions from the latest message
  const getFollowUpSuggestions = (): string[] => {
    if (messages.length === 0) return [];
    
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage.response || latestMessage.isLoading) return [];

    const suggestions: string[] = [];
    
    // Add nextStep as a follow-up
    if (latestMessage.response.nextStep) {
      suggestions.push(latestMessage.response.nextStep);
    }

    // Add a clarification option
    suggestions.push("Can you explain that in simpler terms?");

    // Add a practical application question
    suggestions.push("Show me a real-world example of this");

    return suggestions.slice(0, 3);
  };

  const followUpSuggestions = getFollowUpSuggestions();

  return (
    <div className="page-shell min-h-[calc(100vh-4rem)] flex flex-col">
      <Link to="/dashboard" className="back-link">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to dashboard
      </Link>
      
      <header className="page-heading">
        <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0 flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary">psychology</span>
          Cogniva AI Tutor
        </h1>
        
        {conceptContext ? (
          <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 inline-block">
            <p className="font-label-md text-sm text-primary font-medium">
              Let's talk about: {conceptContext.name}
            </p>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1">
              {conceptContext.description}
            </p>
          </div>
        ) : (
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            I'm ready to help you understand anything you're stuck on.
          </p>
        )}
      </header>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-6 mt-6">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center text-on-surface-variant pt-12"
            >
              <span className="material-symbols-outlined text-[80px] opacity-20 mb-4">psychology</span>
              
              <p className="font-body-lg text-lg max-w-md mb-6">
                {conceptContext
                  ? `Ask me anything about ${conceptContext.name}`
                  : "I'm ready to help you understand anything you're stuck on."}
              </p>

              {/* Suggested Question Chips */}
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                {(conceptContext ? [
                  `What is ${conceptContext.name}?`,
                  `Why is ${conceptContext.name} important?`,
                  `Show me an example of ${conceptContext.name}`,
                  `What are common mistakes with ${conceptContext.name}?`
                ] : SUGGESTED_QUESTIONS).map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(suggestion)}
                    className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 hover:border-primary/30 text-on-surface px-4 py-2 rounded-full transition-all font-body-sm text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <MessageCard
              key={message.id}
              message={message}
              conceptId={conceptId}
              onExplainAgain={handleExplainAgain}
              onClear={handleClear}
              onToggleDetails={handleToggleDetails}
              isLatest={index === messages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Follow-up Suggestions */}
        {followUpSuggestions.length > 0 && !messages[messages.length - 1]?.isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pl-8"
          >
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider self-center">
              Continue with:
            </span>
            {followUpSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(suggestion)}
                className="bg-surface-bright hover:bg-surface-container-high border border-outline-variant/20 hover:border-primary/30 text-on-surface px-3 py-1.5 rounded-full transition-all font-body-sm text-xs"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background pt-4 pb-6 border-t border-outline-variant/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={conceptContext 
              ? `Ask about ${conceptContext.name}...` 
              : "E.g. Why is binary search O(log n)?"}
            className="font-body-md w-full bg-surface-container border border-outline-variant/20 rounded-2xl py-4 pl-6 pr-16 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors shadow-lg"
            disabled={messages.length > 0 && messages[messages.length - 1]?.isLoading}
          />
          <button
            type="submit"
            disabled={!question.trim() || (messages.length > 0 && messages[messages.length - 1]?.isLoading)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
