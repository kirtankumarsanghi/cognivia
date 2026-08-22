import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../utils/animation';
import EducatorStudentProfile from './EducatorStudentProfile';
import { useApi } from '../../hooks/useApi';

interface StudentData {
  id: string;
  name: string;
  mastery: number;
  status: string;
  pulse: string;
  lastActive: string;
  strugglingTopic: string;
  trend: 'up' | 'flat' | 'down';
}

function timeSince(dateString: string | null) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

export default function ClassRoster() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const data = await api.get('/analytics/educator/students');
        if (Array.isArray(data)) {
          const formatted = data.map((d: any) => ({
            id: d.student_id,
            name: d.student_name,
            mastery: d.avg_mastery || 0,
            status: d.last_session ? 'Active' : 'Inactive',
            pulse: d.confusion_count > 5 ? 'High' : d.confusion_count > 2 ? 'Medium' : 'Low',
            lastActive: timeSince(d.last_session?.created_at),
            strugglingTopic: d.confusion_count > 0 ? `${d.confusion_count} Confusions` : 'None',
            trend: ((d.practice_accuracy || 0) >= 80 ? 'up' : (d.practice_accuracy || 0) >= 50 ? 'flat' : 'down') as 'up' | 'flat' | 'down'
          }));
          setStudents(formatted);
        }
      } catch (err) {
        console.error('Failed to load roster', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoster();
  }, [api]);

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Mastery %', 'Confusion Pulse', 'Status', 'Last Active', 'Struggling Topic'];
    const rows = students.map(s => 
      [s.id, s.name, s.mastery, s.pulse, s.status, s.lastActive, s.strugglingTopic].map(val => `"${val}"`).join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cogniva_class_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto"
    >
      <motion.div variants={fadeUp()} className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Class Roster</h1>
          <p className="text-outline">Monitor individual student progress and confusion levels.</p>
        </div>
        <button 
          onClick={handleExportCSV} 
          className="px-4 py-2 bg-surface-container border border-outline-variant/20 text-on-surface rounded-xl font-label-sm uppercase tracking-wider hover:bg-surface-bright transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
        </button>
      </motion.div>

      <motion.div variants={fadeUp()} className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-lg overflow-x-auto custom-scrollbar relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
        <table className="w-full text-left border-collapse min-w-[800px] relative z-10">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface/50">
              <th className="p-5 font-label-sm text-outline uppercase tracking-wider">Student Name</th>
              <th className="p-5 font-label-sm text-outline uppercase tracking-wider">Overall Mastery</th>
              <th className="p-5 font-label-sm text-outline uppercase tracking-wider">Confusion Pulse</th>
              <th className="p-5 font-label-sm text-outline uppercase tracking-wider">Last Active</th>
              <th className="p-5 font-label-sm text-outline uppercase tracking-wider">Struggling Topic</th>
              <th className="p-5 font-label-sm text-outline uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-outline">Loading roster data...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-outline">No students found.</td></tr>
            ) : students.map((student) => (
              <tr key={student.id} className="border-b border-outline-variant/5 hover:bg-surface-variant/10 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-headline-sm text-on-surface mb-0.5">{student.name}</p>
                      <p className="text-xs text-outline">{student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-full max-w-[120px] h-2 rounded-full bg-surface-variant overflow-hidden relative">
                      <div 
                        className={`absolute top-0 left-0 h-full ${student.mastery > 80 ? 'bg-gradient-to-r from-[#3DD68C] to-[#2BA86D]' : student.mastery > 60 ? 'bg-gradient-to-r from-[#E8A634] to-[#C98B22]' : 'bg-gradient-to-r from-error to-red-700'}`} 
                        style={{ width: `${student.mastery}%`, boxShadow: `0 0 10px ${student.mastery > 80 ? '#3DD68C' : student.mastery > 60 ? '#E8A634' : 'red'}` }}
                      ></div>
                    </div>
                    <span className="font-body-sm font-medium">{student.mastery}%</span>
                    <span className={`material-symbols-outlined text-[16px] ${student.trend === 'up' ? 'text-[#3DD68C]' : student.trend === 'down' ? 'text-error' : 'text-outline'}`}>
                      {student.trend === 'up' ? 'trending_up' : student.trend === 'down' ? 'trending_down' : 'trending_flat'}
                    </span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider relative group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all ${
                    student.pulse === 'High' ? 'bg-error/10 text-error border border-error/20' :
                    student.pulse === 'Medium' ? 'bg-[#E8A634]/10 text-[#E8A634] border border-[#E8A634]/20' :
                    'bg-[#3DD68C]/10 text-[#3DD68C] border border-[#3DD68C]/20'
                  }`}>
                    {student.pulse}
                    {student.pulse === 'High' && (
                       <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full animate-ping"></span>
                    )}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${student.status === 'Active' ? 'bg-[#3DD68C]' : 'bg-outline-variant'}`}></span>
                    <span className="font-body-sm text-on-surface-variant">{student.lastActive}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`font-body-sm ${student.strugglingTopic !== 'None' ? 'text-error/90' : 'text-outline'}`}>
                    {student.strugglingTopic}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button onClick={() => setSelectedStudent(student)} className="text-primary hover:underline font-label-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {selectedStudent && (
        <EducatorStudentProfile 
          student={selectedStudent} 
          courseId="cse2101" 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </motion.div>
  );
}
