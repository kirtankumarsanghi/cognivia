import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/animation';
import ConceptGraph from '../concepts/ConceptGraph';
import { useApi } from '../../hooks/useApi';
import { useState, useEffect } from 'react';
import Loading from '../ui/Loading';

export default function KnowledgeGraphView() {
  const api = useApi();
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    api.get('/concepts/graph').then(setGraphData);
  }, []);

  if (!graphData) return <Loading />;

  return (
    <motion.div
      variants={fadeUp()}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-100px)] flex flex-col"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Knowledge Graph</h1>
          <p className="text-outline">Interactive map of all concepts and dependencies.</p>
        </div>
      </div>
      
      <div className="flex-1 card overflow-hidden relative">
        <ConceptGraph concepts={graphData} />
      </div>
    </motion.div>
  );
}
