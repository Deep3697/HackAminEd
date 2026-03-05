import { motion } from 'framer-motion';
import { Factory, Cpu, Zap, Activity } from 'lucide-react';

const activeBatches = [
  { id: 'RC-105', product: 'Alto Chassis Component', machine: 'CNC-01', progress: 75, status: 'Running' },
  { id: 'RC-104', product: 'Swift Door Panel', machine: 'Press-A', progress: 40, status: 'Running' },
  { id: 'RC-103', product: 'Baleno Dash Mount', machine: 'Laser-02', progress: 10, status: 'Setup' },
  { id: 'RC-102', product: 'Brake Assembly', machine: 'Asm-Line-1', progress: 95, status: 'Finishing' },
  { id: 'RC-101', product: 'Rubber Seals', machine: 'Mold-B', progress: 100, status: 'Completed' },
];

const CircularProgress = ({ value, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-800" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className={`${value === 100 ? 'text-emerald-500' : 'text-orange-500'} transition-all duration-1000 ease-out`} />
      </svg>
      <span className="absolute text-xs font-bold text-white">{value}%</span>
    </div>
  );
};

const ProductionDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold text-white">Floor Operations</motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 mt-1">Real-time machine telemetry and routecard tracking.</motion.p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <Activity className="text-emerald-500" size={18} />
            <div>
              <p className="text-xs text-slate-400">OEE Score</p>
              <p className="text-sm font-bold text-white">84.2%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        {activeBatches.map((batch, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
            key={batch.id} 
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-500/30 transition-colors"
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none ${batch.progress === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md mb-3 inline-block border border-orange-500/20">{batch.id}</span>
                <h3 className="text-lg font-bold text-white leading-tight">{batch.product}</h3>
              </div>
              <CircularProgress value={batch.progress} />
            </div>

            <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Factory size={14} /> Machine</span>
                <span className="text-sm font-medium text-white">{batch.machine}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Zap size={14} /> Status</span>
                <span className={`text-sm font-medium ${batch.progress === 100 ? 'text-emerald-400' : 'text-orange-400'}`}>{batch.status}</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm py-2 rounded-xl transition-colors">Log Output</button>
              <button className="w-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"><Cpu size={16} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductionDashboard;