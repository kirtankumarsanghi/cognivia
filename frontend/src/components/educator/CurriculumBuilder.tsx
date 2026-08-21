import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';

const initialModules = [
  { id: '1', title: 'Algorithms Basics', concepts: ['Big O Notation', 'Binary Search'] },
  { id: '2', title: 'Data Structures', concepts: ['Arrays', 'Linked Lists', 'Hash Tables'] },
  { id: '3', title: 'Advanced Algorithms', concepts: ['Dynamic Programming', 'Graph Traversal'] },
];

export default function CurriculumBuilder() {
  const [modules, setModules] = useState(initialModules);

  const handleAddModule = () => {
    const title = prompt("Enter new module title:");
    if (title) {
      setModules([...modules, { id: Date.now().toString(), title, concepts: [] }]);
    }
  };

  const handleDeleteModule = (id: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      setModules(modules.filter(m => m.id !== id));
    }
  };

  const handleAddConcept = (moduleId: string) => {
    const concept = prompt("Enter new concept name:");
    if (concept) {
      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, concepts: [...m.concepts, concept] } : m
      ));
    }
  };

  const handleDeleteConcept = (moduleId: string, conceptName: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, concepts: m.concepts.filter(c => c !== conceptName) } : m
    ));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp} className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Curriculum Builder</h1>
          <p className="text-outline">Organize course modules and define concept dependencies.</p>
        </div>
        <button 
          onClick={handleAddModule} 
          className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-sm uppercase tracking-wider shadow-[0_0_15px_rgba(232,64,64,0.3)] hover:bg-primary/90 transition-all flex items-center gap-2 hover:shadow-[0_0_25px_rgba(232,64,64,0.5)]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Add Module
        </button>
      </motion.div>

      <div className="space-y-6">
        {modules.map((module, index) => (
          <motion.div 
            variants={fadeUpChild} 
            key={module.id} 
            className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-lg p-6 hover:border-primary/30 transition-colors relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="mt-1 flex items-center justify-center cursor-grab active:cursor-grabbing text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[24px]">drag_indicator</span>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-headline-md text-on-surface">Module {index + 1}: <span className="font-normal text-on-surface/90">{module.title}</span></h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert('Inline editing is coming soon!')} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteModule(module.id)} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {module.concepts.map(concept => (
                    <div 
                      key={concept} 
                      className="px-4 py-2 rounded-lg bg-surface/80 border border-outline-variant/10 text-on-surface font-body-sm font-medium flex items-center gap-2 group/concept hover:border-primary/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">psychology</span>
                      {concept}
                      <button 
                        onClick={() => handleDeleteConcept(module.id, concept)}
                        className="text-outline hover:text-error ml-1 transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => handleAddConcept(module.id)} 
                    className="px-4 py-2 rounded-lg border border-dashed border-outline-variant/30 text-outline font-label-sm uppercase tracking-wider hover:text-primary hover:border-primary/50 transition-colors flex items-center gap-2 bg-surface-variant/20 hover:bg-primary/5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Concept
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {modules.length === 0 && (
          <div className="p-8 text-center border border-dashed border-outline-variant/20 rounded-2xl text-outline">
            No modules available. Click "Add Module" to start building your curriculum.
          </div>
        )}
      </div>
    </motion.div>
  );
}
