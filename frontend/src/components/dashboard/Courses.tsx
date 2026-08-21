import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useEffect, useState } from 'react';

export default function Courses() {
  const api = useApi();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(setCourses).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <header className="page-heading">
        <span className="eyebrow">Learning library</span>
        <h1>My Courses</h1>
        <p>Pick up a lesson, review a concept, or tell Cogniva where you need more clarity.</p>
      </header>
      {loading ? <div className="p-8 animate-pulse text-on-surface-variant">Loading your courses…</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <article key={course.id} className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col gap-5 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 grid place-items-center rounded-xl bg-primary/10 text-primary"><span className="material-symbols-outlined">menu_book</span></div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">{course.code}</span>
              </div>
              <div><h2 className="font-headline-md text-headline-md text-on-surface">{course.name}</h2><p className="mt-2 text-on-surface-variant">{course.description}</p></div>
              <Link to={`/course/${course.id}`} className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary px-4 py-3 font-label-md uppercase tracking-widest hover:brightness-110">Open course <span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
            </article>
          ))}
          {!courses.length && <div className="md:col-span-2 xl:col-span-3 p-10 text-center rounded-2xl bg-surface-container text-on-surface-variant">No courses are available yet.</div>}
        </div>
      )}
    </div>
  );
}
