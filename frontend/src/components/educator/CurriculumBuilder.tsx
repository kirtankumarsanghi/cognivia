import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';
import { useApi } from '../../hooks/useApi';

interface Concept {
  id: string;
  name: string;
}

interface Module {
  id: string;
  title: string;
  concepts: Concept[];
}

export default function CurriculumBuilder() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();
  
  // UI States
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [addingConceptModuleId, setAddingConceptModuleId] = useState<string | null>(null);
  const [newConceptName, setNewConceptName] = useState('');

  // Drag and Drop States
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [draggedOverModuleIndex, setDraggedOverModuleIndex] = useState<number | null>(null);

  // Refs for auto-focusing inputs
  const moduleInputRef = useRef<HTMLInputElement>(null);
  const conceptInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const data = await api.get('/courses');
        if (Array.isArray(data)) {
          const mappedModules: Module[] = data.map((course: any) => ({
            id: course.id,
            title: course.name,
            concepts: course.lessons ? course.lessons.map((lesson: any) => ({
              id: lesson.id,
              name: lesson.title || lesson.name
            })) : []
          }));
          setModules(mappedModules);
        }
      } catch (err) {
        console.error('Failed to load curriculum', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurriculum();
  }, [api]);

  useEffect(() => {
    if (isAddingModule) moduleInputRef.current?.focus();
  }, [isAddingModule]);

  useEffect(() => {
    if (addingConceptModuleId) conceptInputRef.current?.focus();
  }, [addingConceptModuleId]);

  useEffect(() => {
    if (editingModuleId) editInputRef.current?.focus();
  }, [editingModuleId]);

  // Actions
  const handleSaveNewModule = async () => {
    if (newModuleTitle.trim()) {
      try {
        const data = await api.post('/courses', { name: newModuleTitle.trim() });
        setModules([...modules, { id: data.id, title: data.name, concepts: [] }]);
      } catch (err) {
        console.error('Failed to save module', err);
      }
    }
    setIsAddingModule(false);
    setNewModuleTitle('');
  };

  const handleDeleteModule = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      try {
        await api.delete(`/courses/${id}`);
        setModules(modules.filter(m => m.id !== id));
      } catch (err) {
        console.error('Failed to delete module', err);
      }
    }
  };

  const handleStartEditModule = (module: Module) => {
    setEditingModuleId(module.id);
    setEditingTitle(module.title);
  };

  const handleSaveEditModule = async () => {
    if (editingModuleId && editingTitle.trim()) {
      try {
        const data = await api.put(`/courses/${editingModuleId}`, { name: editingTitle.trim() });
        setModules(modules.map(m => 
          m.id === editingModuleId ? { ...m, title: data.name } : m
        ));
      } catch (err) {
        console.error('Failed to update module', err);
      }
    }
    setEditingModuleId(null);
  };

  const handleSaveNewConcept = async (moduleId: string) => {
    if (newConceptName.trim()) {
      try {
        const data = await api.post('/lessons', { course_id: moduleId, name: newConceptName.trim() });
        setModules(modules.map(m => 
          m.id === moduleId 
            ? { ...m, concepts: [...m.concepts, { id: data.id, name: data.title || data.name }] } 
            : m
        ));
      } catch (err) {
        console.error('Failed to save concept', err);
      }
    }
    setAddingConceptModuleId(null);
    setNewConceptName('');
  };

  const handleDeleteConcept = async (moduleId: string, conceptId: string) => {
    try {
      await api.delete(`/lessons/${conceptId}`);
      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, concepts: m.concepts.filter(c => c.id !== conceptId) } : m
      ));
    } catch (err) {
      console.error('Failed to delete concept', err);
    }
  };

  // Drag Handlers
  const handleDragStart = (index: number) => {
    setDraggedModuleIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDraggedOverModuleIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedModuleIndex !== null && draggedOverModuleIndex !== null && draggedModuleIndex !== draggedOverModuleIndex) {
      const newModules = [...modules];
      const draggedModule = newModules[draggedModuleIndex];
      newModules.splice(draggedModuleIndex, 1);
      newModules.splice(draggedOverModuleIndex, 0, draggedModule);
      setModules(newModules);
    }
    setDraggedModuleIndex(null);
    setDraggedOverModuleIndex(null);
  };

  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp()} className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Curriculum Builder</h1>
          <p className="text-outline">Organize course modules and define concept dependencies.</p>
        </div>
        <button 
          onClick={() => setIsAddingModule(true)} 
          className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-sm uppercase tracking-wider shadow-[0_0_15px_rgba(232,64,64,0.3)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(232,64,64,0.5)] whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Add Module
        </button>
      </motion.div>

      <AnimatePresence>
        {isAddingModule && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-surface-container rounded-2xl border border-primary/40 shadow-lg p-6">
              <h3 className="font-headline-sm mb-4">Create New Module</h3>
              <div className="flex gap-3">
                <input
                  ref={moduleInputRef}
                  type="text"
                  placeholder="e.g. Introduction to Machine Learning"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNewModule()}
                  className="flex-1 bg-surface border border-outline-variant/30 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={handleSaveNewModule}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setIsAddingModule(false); setNewModuleTitle(''); }}
                  className="px-4 py-2 border border-outline-variant/30 text-outline rounded-xl hover:bg-surface-variant/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {modules.map((module, index) => (
          <motion.div 
            variants={fadeUpChild} 
            key={module.id} 
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`bg-surface-container rounded-2xl border ${
              draggedOverModuleIndex === index ? 'border-primary shadow-[0_0_15px_rgba(232,64,64,0.2)]' : 'border-outline-variant/10 hover:border-primary/30'
            } shadow-lg p-6 transition-all relative overflow-hidden group`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-150"></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="mt-1 flex items-center justify-center cursor-grab active:cursor-grabbing text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[24px]">drag_indicator</span>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-5">
                  {editingModuleId === module.id ? (
                    <div className="flex gap-2 flex-1 mr-4">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditModule()}
                        onBlur={handleSaveEditModule}
                        className="flex-1 bg-surface border border-primary/50 rounded-lg px-3 py-1 font-headline-md text-on-surface focus:outline-none"
                      />
                    </div>
                  ) : (
                    <h2 
                      className="font-headline-md text-on-surface flex items-center gap-3 group/title"
                    >
                      Module {index + 1}: <span className="font-normal text-on-surface/90">{module.title}</span>
                    </h2>
                  )}

                  <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleStartEditModule(module)} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit Module"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteModule(module.id)} 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete Module"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <AnimatePresence mode="popLayout">
                    {module.concepts.map(concept => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={concept.id} 
                        className="px-4 py-2 rounded-lg bg-surface/80 border border-outline-variant/10 text-on-surface font-body-sm font-medium flex items-center gap-2 group/concept hover:border-primary/40 hover:bg-surface-variant/30 hover:shadow-[0_0_10px_rgba(232,64,64,0.15)] transition-all cursor-default"
                      >
                        <span className="material-symbols-outlined text-[14px] text-primary group-hover/concept:animate-pulse">psychology</span>
                        {concept.name}
                        <button 
                          onClick={() => handleDeleteConcept(module.id, concept.id)}
                          className="text-outline hover:text-error ml-1 transition-colors flex items-center justify-center opacity-0 group-hover/concept:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {addingConceptModuleId === module.id ? (
                    <div className="flex items-center gap-2 bg-surface rounded-lg p-1 border border-primary/40">
                      <input
                        ref={conceptInputRef}
                        type="text"
                        placeholder="Concept name..."
                        value={newConceptName}
                        onChange={(e) => setNewConceptName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNewConcept(module.id);
                          if (e.key === 'Escape') setAddingConceptModuleId(null);
                        }}
                        onBlur={() => newConceptName.trim() ? handleSaveNewConcept(module.id) : setAddingConceptModuleId(null)}
                        className="bg-transparent border-none text-sm px-2 py-1 focus:outline-none w-32"
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setAddingConceptModuleId(module.id);
                        setNewConceptName('');
                      }} 
                      className="px-4 py-2 rounded-lg border border-dashed border-outline-variant/30 text-outline font-label-sm uppercase tracking-wider hover:text-primary hover:border-primary/50 transition-colors flex items-center gap-2 bg-surface-variant/20 hover:bg-primary/5"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span> Concept
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading ? (
          <div className="p-12 text-center text-outline">Loading curriculum data...</div>
        ) : modules.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-outline-variant/20 rounded-2xl text-outline bg-surface-container/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            No modules available. Click "Add Module" to start building your curriculum.
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
