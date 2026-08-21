import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, XAxis } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { time: '10:15', value: 12 },
  { time: '10:30', value: 18 },
  { time: '10:45', value: 84, active: true },
  { time: '11:00', value: 42 },
  { time: '11:15', value: 15 },
];

export default function LiveSignalCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg glass-card rounded-3xl p-8 relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-tertiary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="relative flex flex-col gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex justify-between items-start"
        >
          <div>
            <h3 className="font-headline-md text-white">Live Signal</h3>
            <p className="font-label-sm text-on-surface-variant mt-1">CS101 - Algorithm Complexity</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-error-container/20 border border-error/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span className="font-label-sm text-error">High Confusion</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="h-48 w-full mt-4"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#111415', border: '1px solid rgba(143, 144, 151, 0.2)', borderRadius: '8px' }}
                itemStyle={{ color: '#ffdfa0' }}
              />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#c5c6cd', fontSize: 12, fontFamily: 'Inter' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.active ? 'url(#colorTertiary)' : 'rgba(29, 32, 33, 0.8)'} 
                    className={entry.active ? 'pulse-glow' : ''}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="colorTertiary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbc00" stopOpacity={1} />
                  <stop offset="100%" stopColor="#fbbc00" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </motion.div>
  );
}
