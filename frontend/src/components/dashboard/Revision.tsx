import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUpChild } from '../../utils/animation';
import Loading from '../ui/Loading';
import { useToast } from '../ui/Toast';

interface PracticeQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export default function Revision() {
  const api = useApi();
  const { showToast } = useToast();
  const [revisionPlan, setRevisionPlan] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<any>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceResults, setPracticeResults] = useState<{correct: number; total: number}>({correct: 0, total: 0});
  const [showResults, setShowResults] = useState(false);


  const loadData = async () => {
    try {
      const revisionData = await api.get('/revision/plan');
      setRevisionPlan(revisionData || []);
    } catch (err: any) {
      console.error('Failed to load revision data', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartPlan = async () => {
    setGenerating(true);
    try {
      const result = await api.post('/revision/generate-smart-plan', {});
      showToast(result.message || 'Smart revision plan generated!', 'success');
      await loadData(); // Reload the plan
    } catch (err: any) {
      console.error('Failed to generate smart plan', err);
      showToast('Failed to generate revision plan. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startPractice = async (concept: any) => {
    setCurrentConcept(concept);
    setPracticeMode(true);
    try {
      const questions = await api.get(`/practice?concept_id=${concept.concept_id}`);
      if (questions && questions.length > 0) {
        setPracticeQuestions(questions);
        setCurrentQuestionIndex(0);
        setPracticeResults({correct: 0, total: 0});
        setShowResults(false);
      } else {
        showToast('No practice questions available for this concept yet.', 'info');
        setPracticeMode(false);
      }
    } catch (err: any) {
      console.error('Failed to load practice questions', err);
      showToast('Failed to load practice questions. Please try again.', 'error');
      setPracticeMode(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    // Submit attempt to backend
    try {
      await api.post('/practice/attempt', {
        concept_id: currentConcept.concept_id,
        question_id: currentQuestion.id,
        answer: selectedAnswer,
        correct: isCorrect
      });
    } catch (err) {
      console.error('Failed to record practice attempt', err);
    }

    setPracticeResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer('');
    
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleCompleteRevision = async (planId: string) => {
    try {
      await api.post(`/revision/${planId}/complete`, {});
      await loadData();
    } catch (err) {
      console.error('Failed to complete revision', err);
    }
  };

  const handleFinishPractice = async () => {
    if (practiceResults.correct / practiceResults.total >= 0.7) {
      await handleCompleteRevision(currentConcept.id);
    }
    setPracticeMode(false);
    setCurrentConcept(null);
  };

  if (loading) return <Loading variant="revision" />;

  if (practiceMode && currentConcept) {
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const accuracy = practiceResults.total > 0 ? (practiceResults.correct / practiceResults.total) * 100 : 0;

    return (
      <div className="page-shell min-h-screen">
        <button 
          onClick={() => setPracticeMode(false)} 
          className="back-link"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to revision plan
        </button>

        <header className="page-heading">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs block">Practice Mode</span>
              <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0">
                {currentConcept.concepts.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="font-body-sm text-on-surface-variant">Question </span>
                <span className="font-headline-md text-on-surface">{currentQuestionIndex + 1}</span>
                <span className="font-body-sm text-on-surface-variant"> / {practiceQuestions.length}</span>
              </div>
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="font-body-sm text-on-surface-variant">Accuracy: </span>
                <span className={`font-headline-md ${accuracy >= 70 ? 'text-[#3DD68C]' : accuracy >= 50 ? 'text-[#E8A634]' : 'text-error'}`}>
                  {Math.round(accuracy)}%
                </span>
              </div>
            </div>
          </div>
        </header>

        {showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container rounded-2xl p-12 shadow-lg border border-outline-variant/10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${
                accuracy >= 70 ? 'bg-[#3DD68C]/20' : 'bg-error/20'
              }`}
            >
              <span className={`material-symbols-outlined text-[64px] ${
                accuracy >= 70 ? 'text-[#3DD68C]' : 'text-error'
              }`}>
                {accuracy >= 70 ? 'check_circle' : 'cancel'}
              </span>
            </motion.div>

            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">
              {accuracy >= 70 ? 'Great Job!' : 'Keep Practicing!'}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              You got {practiceResults.correct} out of {practiceResults.total} questions correct.
            </p>

            {accuracy >= 70 ? (
              <div className="bg-[#3DD68C]/10 border border-[#3DD68C]/20 rounded-xl p-6 mb-8">
                <p className="font-body-md text-[#3DD68C]">
                  ✓ This concept has been marked as completed in your revision plan!
                </p>
              </div>
            ) : (
              <div className="bg-error/10 border border-error/20 rounded-xl p-6 mb-8">
                <p className="font-body-md text-error">
                  You need at least 70% accuracy to complete this revision. Try again after reviewing the material.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleFinishPractice}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Back to Revision Plan
              </button>
              {accuracy < 70 && (
                <Link
                  to={`/tutor?concept=${currentConcept.concept_id}`}
                  className="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:bg-surface-bright transition-colors border border-outline-variant/10"
                >
                  Get AI Help
                </Link>
              )}
            </div>
          </motion.div>
        ) : currentQuestion ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-surface-container rounded-2xl p-8 shadow-lg border border-outline-variant/10"
          >
            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
                {currentQuestion.question_text}
              </h2>

              {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showFeedback && setSelectedAnswer(option)}
                      disabled={showFeedback}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedAnswer === option
                          ? showFeedback
                            ? option === currentQuestion.correct_answer
                              ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                              : 'border-error bg-error/10'
                            : 'border-primary bg-primary/10'
                          : showFeedback && option === currentQuestion.correct_answer
                          ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                          : 'border-outline-variant/20 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === option
                            ? showFeedback
                              ? option === currentQuestion.correct_answer
                                ? 'border-[#3DD68C] bg-[#3DD68C]'
                                : 'border-error bg-error'
                              : 'border-primary bg-primary'
                            : 'border-outline-variant'
                        }`}>
                          {selectedAnswer === option && (
                            <span className="material-symbols-outlined text-white text-[16px]">
                              {showFeedback 
                                ? option === currentQuestion.correct_answer ? 'check' : 'close'
                                : 'radio_button_checked'
                              }
                            </span>
                          )}
                        </div>
                        <span className="font-body-md text-on-surface">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.question_type === 'true_false' && currentQuestion.options && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showFeedback && setSelectedAnswer(option)}
                      disabled={showFeedback}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedAnswer === option
                          ? showFeedback
                            ? option === currentQuestion.correct_answer
                              ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                              : 'border-error bg-error/10'
                            : 'border-primary bg-primary/10'
                          : showFeedback && option === currentQuestion.correct_answer
                          ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                          : 'border-outline-variant/20 hover:border-primary/50'
                      }`}
                    >
                      <span className="font-headline-md">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {showFeedback && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mt-6 p-6 rounded-xl border-2 ${
                    selectedAnswer === currentQuestion.correct_answer
                      ? 'border-[#3DD68C]/20 bg-[#3DD68C]/10'
                      : 'border-error/20 bg-error/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-[24px] ${
                      selectedAnswer === currentQuestion.correct_answer ? 'text-[#3DD68C]' : 'text-error'
                    }`}>
                      {selectedAnswer === currentQuestion.correct_answer ? 'check_circle' : 'info'}
                    </span>
                    <div>
                      <h3 className={`font-label-md uppercase tracking-wider mb-2 ${
                        selectedAnswer === currentQuestion.correct_answer ? 'text-[#3DD68C]' : 'text-error'
                      }`}>
                        {selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Explanation'}
                      </h3>
                      <p className="font-body-md text-on-surface">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              {!showFeedback ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Submit Answer
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {currentQuestionIndex < practiceQuestions.length - 1 ? 'Next Question' : 'See Results'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="bg-surface-container rounded-2xl p-12 text-center">
            <p className="font-body-lg text-on-surface-variant">Loading practice questions...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen" style={{background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)'}}>
      <Link to="/dashboard" className="back-link group">
        <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">arrow_back</span>
        Back to dashboard
      </Link>
      
      <header className="page-heading mb-8">
        <div className="flex flex-col">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px] animate-pulse">auto_awesome</span>
            Revision Plan
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline-xl text-4xl leading-tight sm:text-5xl text-on-background m-0 flex items-center gap-4"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[42px] text-primary drop-shadow-[0_0_20px_rgba(232,64,64,0.5)]">event_repeat</span>
              <div className="absolute inset-0 bg-primary blur-xl opacity-30 rounded-full"></div>
            </div>
            Targeted Learning
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-body-lg text-body-lg text-on-surface-variant mt-3 max-w-2xl"
          >
            AI-driven revision queue based on your confusion signals and test performance.
          </motion.p>
        </div>
      </header>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative rounded-3xl p-8 shadow-2xl border border-outline-variant/20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17,18,21,0.95) 0%, rgba(10,10,10,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.8), 0 0 40px rgba(232,64,64,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3DD68C]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[28px]">queue</span>
              </div>
              <div>
                <h2 className="font-headline-lg text-2xl text-on-surface font-semibold">Your Queue</h2>
                <p className="font-body-sm text-on-surface-variant">Prioritized by AI for maximum impact</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {revisionPlan.length === 0 && !loading && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateSmartPlan}
                  disabled={generating}
                  className="bg-gradient-to-r from-primary to-error text-white px-6 py-3 rounded-xl font-label-md uppercase tracking-widest hover:shadow-[0_0_30px_rgba(232,64,64,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      Generate Smart Plan
                    </>
                  )}
                </motion.button>
              )}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary blur-xl opacity-40 rounded-full animate-pulse"></div>
                <span className="relative font-label-lg text-lg text-on-primary bg-gradient-to-br from-primary to-error px-5 py-2.5 rounded-full uppercase tracking-widest font-bold shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                  {revisionPlan.length} Topics
                </span>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            variants={staggerContainer(0.08)} 
            initial="hidden" 
            animate="visible" 
            className="flex flex-col gap-y-5"
          >
            {revisionPlan.map((plan, index) => (
              <motion.div 
                variants={fadeUpChild} 
                key={plan.id} 
                className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl transition-all duration-500 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(20,20,25,0.6) 0%, rgba(10,10,12,0.8) 100%)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 8px 40px rgba(232,64,64,0.15), 0 0 20px rgba(232,64,64,0.1)',
                  border: '1px solid rgba(232,64,64,0.3)'
                }}
              >
                {/* Animated left accent bar */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-error to-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top shadow-[0_0_20px_rgba(232,64,64,0.6)]"></div>
                
                {/* Priority indicator glow */}
                {plan.priority === 'High' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-error rounded-full animate-pulse shadow-[0_0_15px_rgba(232,64,64,0.8)]"></div>
                )}
                
                <div className="flex items-center gap-6 flex-1">
                  {/* Icon with animated background */}
                  <div className="relative">
                    <motion.div 
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-bright to-surface-container flex items-center justify-center group-hover:from-primary/20 group-hover:to-error/20 transition-all duration-500 shrink-0 border border-outline-variant/20 group-hover:border-primary/40"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors duration-500 text-[32px]">
                        menu_book
                      </span>
                    </motion.div>
                    {/* Rank badge */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-primary to-error rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-bg-card">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="font-headline-md text-xl text-on-surface font-semibold group-hover:text-primary transition-colors duration-300">
                      {plan.concepts.name}
                    </span>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Priority badge */}
                      <motion.span 
                        whileHover={{ scale: 1.1 }}
                        className={`font-label-sm text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${
                          plan.priority === 'High' 
                            ? 'bg-gradient-to-r from-error/20 to-error/10 text-error border border-error/30 shadow-[0_0_15px_rgba(232,64,64,0.3)]' 
                            : plan.priority === 'Medium'
                            ? 'bg-gradient-to-r from-[#E8A634]/20 to-[#E8A634]/10 text-[#E8A634] border border-[#E8A634]/30'
                            : 'bg-surface-bright text-on-surface-variant border border-outline-variant/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {plan.priority === 'High' ? 'priority_high' : plan.priority === 'Medium' ? 'trending_up' : 'trending_flat'}
                        </span>
                        {plan.priority} Priority
                      </motion.span>
                      
                      {/* Duration badge */}
                      <span className="font-body-sm text-sm text-on-surface-variant flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/20">
                        <span className="material-symbols-outlined text-[18px] text-primary">schedule</span> 
                        <span className="font-semibold">{plan.minutes}</span> min
                      </span>
                      
                      {/* Progress indicator */}
                      <span className="font-body-sm text-sm text-on-surface-variant flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/20">
                        <span className="material-symbols-outlined text-[18px] text-[#3DD68C]">target</span> 
                        Revision #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 md:mt-0 flex items-center justify-end md:justify-start gap-3 pl-0 md:pl-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startPractice(plan)}
                    className="relative bg-gradient-to-r from-[#3DD68C] to-[#34c759] hover:from-[#45e096] hover:to-[#3DD68C] text-white px-6 py-3.5 rounded-xl font-label-md tracking-widest uppercase transition-all duration-300 flex items-center gap-2 border border-[#3DD68C]/40 shadow-lg hover:shadow-[0_0_30px_rgba(61,214,140,0.4)] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative font-semibold">Practice</span>
                    <span className="material-symbols-outlined text-[20px] relative">quiz</span>
                  </motion.button>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to={`/tutor?concept=${plan.concept_id}`} 
                      className="relative bg-gradient-to-r from-primary to-error hover:from-error hover:to-primary text-on-primary px-6 py-3.5 rounded-xl font-label-md tracking-widest uppercase transition-all duration-300 flex items-center gap-2 border border-primary/40 shadow-lg hover:shadow-[0_0_30px_rgba(232,64,64,0.4)] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <span className="relative font-semibold">AI Tutor</span>
                      <span className="material-symbols-outlined text-[20px] relative">psychology</span>
                    </Link>
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCompleteRevision(plan.id)}
                    className="bg-surface-container-high hover:bg-[#3DD68C]/20 text-on-surface hover:text-[#3DD68C] p-3.5 rounded-xl transition-all duration-300 border border-outline-variant/20 hover:border-[#3DD68C]/50 shadow-md hover:shadow-[0_0_20px_rgba(61,214,140,0.2)]"
                    title="Mark as complete"
                  >
                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
            
            {revisionPlan.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-16 text-center flex flex-col items-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(61,214,140,0.05) 0%, rgba(52,199,89,0.05) 100%)',
                  border: '1px solid rgba(61,214,140,0.2)'
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <span className="material-symbols-outlined text-[80px] text-[#3DD68C] mb-6 drop-shadow-[0_0_30px_rgba(61,214,140,0.5)]">
                    celebration
                  </span>
                </motion.div>
                <h3 className="font-headline-lg text-3xl text-on-surface mb-3 font-bold">
                  You're All Caught Up!
                </h3>
                <p className="font-body-md text-lg text-on-surface-variant max-w-md mb-6">
                  Your revision queue is empty. Keep up the great work in your courses.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateSmartPlan}
                  disabled={generating}
                  className="bg-gradient-to-r from-primary to-error text-white px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:shadow-[0_0_30px_rgba(232,64,64,0.4)] transition-all flex items-center gap-3 disabled:opacity-50 mx-auto mb-4"
                >
                  {generating ? (
                    <>
                      <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                      Analyzing Your Progress...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                      Generate Smart Revision Plan
                    </>
                  )}
                </motion.button>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex gap-3"
                >
                  <Link 
                    to="/dashboard"
                    className="bg-gradient-to-r from-primary to-error text-white px-6 py-3 rounded-xl font-label-md uppercase tracking-widest hover:shadow-[0_0_30px_rgba(232,64,64,0.4)] transition-all duration-300 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">home</span>
                    Back to Dashboard
                  </Link>
                  <Link 
                    to="/courses"
                    className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-label-md uppercase tracking-widest hover:bg-surface-bright transition-all duration-300 border border-outline-variant/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">school</span>
                    Explore Courses
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
