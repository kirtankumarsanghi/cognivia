import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signalStatus, setSignalStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleSignal = async (conceptId: string, signal: string) => {
    try {
      setSignalStatus(`Sending signal for concept...`);
      await api.post('/confusion/signal', { concept_id: conceptId, signal });
      setSignalStatus(`Signal received: ${signal}.`);
      
      setTimeout(() => setSignalStatus(null), 3000);
      
      if (signal === 'Confused') {
        setTimeout(() => {
          navigate(`/tutor?concept=${conceptId}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setSignalStatus('Failed to send signal.');
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-on-surface-variant">Loading course...</div>;
  if (!course) return <div className="p-8 text-error">Course not found.</div>;

  return (
    <div className="page-shell">
      <button onClick={() => navigate('/courses')} className="back-link">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to courses
      </button>

      <header className="flex flex-col pt-stack-sm relative">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">{course.code}</span>
          <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0 flex items-center gap-3">
            {course.name}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-3xl">{course.description}</p>
        </div>
      </header>

      {signalStatus && (
        <div className="bg-primary-container text-on-primary-container px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 font-body-md shadow-md">
          <span className="material-symbols-outlined">check_circle</span>
          {signalStatus}
        </div>
      )}

      <div className="space-y-8 mt-4">
        {course.lessons?.sort((a: any, b: any) => a.order_number - b.order_number).map((lesson: any) => (
          <div key={lesson.id} className="bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden shadow-md">
            <div className="bg-surface-bright/50 px-8 py-6 border-b border-outline-variant/10">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Lesson {lesson.order_number}: {lesson.title}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">{lesson.description}</p>
            </div>
            
            <div className="divide-y divide-outline-variant/10">
              {lesson.concepts?.map((concept: any) => (
                <div key={concept.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-bright/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-headline-md text-headline-md text-on-surface">{concept.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{concept.description}</p>
                  </div>
                  
                  <div className="flex-shrink-0 bg-surface rounded-xl p-4 border border-outline-variant/10 shadow-sm">
                    <div className="font-label-sm text-label-sm text-outline text-center mb-3 uppercase tracking-widest">How clear are you?</div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleSignal(concept.id, 'Confused')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-error-container/10 hover:bg-error-container/20 text-error border border-error-container/20 rounded-lg transition-colors font-label-md uppercase tracking-widest"
                      >
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        Confused
                      </button>
                      <button 
                        onClick={() => handleSignal(concept.id, 'Partially Clear')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary-container/10 hover:bg-secondary-container/20 text-secondary border border-secondary-container/20 rounded-lg transition-colors font-label-md uppercase tracking-widest"
                      >
                        <span className="material-symbols-outlined text-[18px]">help</span>
                        Partially
                      </button>
                      <button 
                        onClick={() => handleSignal(concept.id, 'Clear')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors font-label-md uppercase tracking-widest"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
