import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from '../../utils/animation';
import ConceptGraph from '../concepts/ConceptGraph';
import { useApi } from '../../hooks/useApi';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../ui/Loading';

export default function KnowledgeGraphView() {
  const api = useApi();
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState<any[] | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [riskScores, setRiskScores] = useState<Record<string, number>>({});

  useEffect(() => {
    api.get('/concepts/graph').then(async (data: any[]) => {
      setGraphData(data);
      
      // For concepts with low mastery (e.g. haven't reached yet or struggling), fetch ML risk prediction
      const newRiskScores: Record<string, number> = {};
      for (const concept of data) {
        if (concept.mastery < 50) {
          try {
            const res = await api.get(`/concepts/${concept.id}/risk`);
            if (res && res.success) {
              newRiskScores[concept.id] = res.risk_percentage;
            }
          } catch (e) {
            console.error('Failed to fetch risk for', concept.id, e);
          }
        }
      }
      setRiskScores(newRiskScores);
    });
  }, [api]);

  const selectedConcept = graphData?.find(c => c.id === selectedConceptId);
  const currentRisk = selectedConcept ? riskScores[selectedConcept.id] : null;

  if (!graphData) return <Loading />;

  return (
    <motion.div
      variants={fadeUp()}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-100px)] flex flex-col relative overflow-hidden"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-3xl font-bold tracking-tight mb-2 text-on-surface">Knowledge Graph</h1>
          <p className="font-body-md text-on-surface-variant opacity-80">Interactive map of all concepts and dependencies.</p>
        </div>
      </div>
      
      <div className="flex-1 relative flex">
        {/* Main Graph Area */}
        <div className={`flex-1 transition-all duration-500 ease-in-out ${selectedConcept ? 'mr-[380px]' : ''}`}>
          <ConceptGraph 
            concepts={graphData} 
            selectedConceptId={selectedConceptId || undefined}
            onConceptClick={setSelectedConceptId}
          />
        </div>

        {/* Slide-out Side Panel */}
        <AnimatePresence>
          {selectedConcept && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[360px] bg-surface-container-high border-l border-outline-variant/20 shadow-2xl rounded-l-3xl overflow-y-auto z-20 flex flex-col"
            >
              <div className="p-6 pb-0 flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  selectedConcept.difficulty === 'beginner' ? 'bg-[#3DD68C]/10 text-[#3DD68C]' :
                  selectedConcept.difficulty === 'intermediate' ? 'bg-[#E8A634]/10 text-[#E8A634]' :
                  'bg-[#E84040]/10 text-[#E84040]'
                }`}>
                  {selectedConcept.difficulty}
                </div>
                <button 
                  onClick={() => setSelectedConceptId(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant text-on-surface hover:bg-outline-variant/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-6">
                <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-2">{selectedConcept.name}</h2>
                <p className="font-body-md text-on-surface-variant mb-6 leading-relaxed">
                  {selectedConcept.description || 'A fundamental concept in your learning path.'}
                </p>

                {/* ML Risk Badge */}
                {currentRisk !== null && currentRisk !== undefined && (
                  <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
                    <span className="material-symbols-outlined text-error">psychology_alt</span>
                    <div>
                      <h4 className="font-label-md font-bold text-error uppercase tracking-wider mb-1">ML Risk Prediction</h4>
                      <p className="font-body-sm text-on-surface-variant">
                        Our model predicts you are <span className="font-bold text-error">{currentRisk}% likely to be confused</span> by this topic based on your prerequisite mastery.
                      </p>
                    </div>
                  </div>
                )}

                {/* Mastery Level */}
                <div className="mb-8 p-5 bg-surface rounded-2xl border border-outline-variant/10">
                  <div className="flex justify-between items-end mb-3">
                    <span className="font-label-md font-bold text-on-surface-variant uppercase tracking-wider">Mastery Level</span>
                    <span className="font-headline-sm font-bold text-primary">{Math.round(selectedConcept.mastery)}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedConcept.mastery}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        selectedConcept.mastery > 70 ? 'bg-[#3DD68C]' : 
                        selectedConcept.mastery > 40 ? 'bg-[#E8A634]' : 'bg-[#E84040]'
                      }`}
                    />
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedConcept.prerequisites && selectedConcept.prerequisites.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-3">Prerequisites</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedConcept.prerequisites.map((req: any) => {
                        const reqConcept = graphData.find(c => c.id === req.id);
                        return (
                          <button 
                            key={req.id}
                            onClick={() => setSelectedConceptId(req.id)}
                            className="px-3 py-1.5 bg-surface text-on-surface text-sm rounded-lg border border-outline-variant/10 hover:border-primary/50 transition-colors"
                          >
                            {reqConcept ? reqConcept.name : 'Unknown Concept'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto p-6 bg-surface border-t border-outline-variant/10">
                <button 
                  onClick={() => navigate('/dashboard/revision')}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-[0_4px_14px_0_rgba(232,166,52,0.39)] hover:shadow-[0_6px_20px_rgba(232,166,52,0.23)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">psychology</span>
                  Practice Now
                </button>
                <button className="w-full py-3 mt-3 bg-surface-bright text-on-surface rounded-xl font-bold hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">menu_book</span>
                  Review Material
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
