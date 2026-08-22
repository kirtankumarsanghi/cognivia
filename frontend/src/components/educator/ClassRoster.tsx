import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../utils/animation';

const mockStudents = [
  { id: '1', name: 'Alex Johnson', mastery: 85, status: 'Active', pulse: 'Low', lastActive: '2h ago', strugglingTopic: 'None', trend: 'up' },
  { id: '2', name: 'Sarah Smith', mastery: 62, status: 'Active', pulse: 'High', lastActive: '1d ago', strugglingTopic: 'Binary Search Trees', trend: 'down' },
  { id: '3', name: 'Michael Chen', mastery: 91, status: 'Active', pulse: 'Low', lastActive: '1h ago', strugglingTopic: 'None', trend: 'up' },
  { id: '4', name: 'Emily Davis', mastery: 74, status: 'Active', pulse: 'Medium', lastActive: '4h ago', strugglingTopic: 'Big O Notation', trend: 'flat' },
  { id: '5', name: 'James Wilson', mastery: 45, status: 'Inactive', pulse: 'High', lastActive: '5d ago', strugglingTopic: 'Dynamic Programming', trend: 'down' },
  { id: '6', name: 'Olivia Martinez', mastery: 88, status: 'Active', pulse: 'Low', lastActive: '10m ago', strugglingTopic: 'Hash Tables', trend: 'up' },
  { id: '7', name: 'Daniel Lee', mastery: 68, status: 'Active', pulse: 'Medium', lastActive: '1d ago', strugglingTopic: 'Graph Traversal', trend: 'down' },
];

export default function ClassRoster() {
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Mastery %', 'Confusion Pulse', 'Status', 'Last Active', 'Struggling Topic'];
    const rows = mockStudents.map(s => 
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
            {mockStudents.map((student) => (
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
                    <div className="w-full max-w-[120px] h-2 rounded-full bg-surface-variant overflow-hidden">
                      <div 
                        className={`h-full ${student.mastery > 80 ? 'bg-[#3DD68C]' : student.mastery > 60 ? 'bg-[#E8A634]' : 'bg-error'}`} 
                        style={{ width: `${student.mastery}%` }}
                      ></div>
                    </div>
                    <span className="font-body-sm font-medium">{student.mastery}%</span>
                    <span className={`material-symbols-outlined text-[16px] ${student.trend === 'up' ? 'text-[#3DD68C]' : student.trend === 'down' ? 'text-error' : 'text-outline'}`}>
                      {student.trend === 'up' ? 'trending_up' : student.trend === 'down' ? 'trending_down' : 'trending_flat'}
                    </span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    student.pulse === 'High' ? 'bg-error/10 text-error border border-error/20' :
                    student.pulse === 'Medium' ? 'bg-[#E8A634]/10 text-[#E8A634] border border-[#E8A634]/20' :
                    'bg-[#3DD68C]/10 text-[#3DD68C] border border-[#3DD68C]/20'
                  }`}>
                    {student.pulse}
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
                  <button onClick={() => alert(`View profile for ${student.name} is coming soon!`)} className="text-primary hover:underline font-label-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
