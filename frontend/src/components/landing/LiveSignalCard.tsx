import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, XAxis } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { time: '10:15', value: 12 },
  { time: '10:30', value: 18 },
  { time: '10:45', value: 84, active: true },
  { time: '11:00', value: 42 },
  { time: '11:15', value: 15 },
];

const MotionBar = (props: any) => {
  const { fill, x, y, width, height, index } = props;
  return (
    <motion.rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={4}
      ry={4}
      initial={{ height: 0, y: y + height }}
      animate={{ height, y }}
      transition={{ duration: 0.8, delay: 1.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    />
  );
};

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
                itemStyle={{ color: '#e8a634' }}
              />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.42)', fontSize: 12, fontFamily: 'JetBrains Mono' }} />
              <Bar dataKey="value" shape={<MotionBar />}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.active ? '#e8a634' : 'rgba(255, 255, 255, 0.1)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </motion.div>
  );
}
