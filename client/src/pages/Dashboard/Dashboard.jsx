import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Package, Users, Activity, ArrowUpRight, ArrowDownRight, Clock, Box } from 'lucide-react';

const kpiData = [
  { id: 1, label: 'Total Revenue', value: '₹42.5L', trend: '+12.5%', isUp: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 2, label: 'Active Orders', value: '156', trend: '+8.2%', isUp: true, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 3, label: 'Production Yield', value: '94.2%', trend: '-1.5%', isUp: false, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 4, label: 'New Clients', value: '24', trend: '+18.4%', isUp: true, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' }
];

const activityFeed = [
  { id: 1, user: 'Rajesh (Prod)', action: 'Completed Batch B-402', time: '10 mins ago', type: 'success' },
  { id: 2, user: 'Priya (Sales)', action: 'Closed PO-041 for ₹5.5L', time: '1 hour ago', type: 'info' },
  { id: 3, user: 'Amit (Quality)', action: 'Rejected 15 units of Rubber Seals', time: '2 hours ago', type: 'danger' },
  { id: 4, user: 'Suresh (Store)', action: 'Received GRN-442', time: '4 hours ago', type: 'warning' },
];

const chartData = {
  '7D': [40, 65, 45, 80, 55, 90, 70],
  '1M': [30, 40, 35, 50, 45, 60, 55, 70, 65, 85, 80, 95],
  '1Y': [20, 35, 30, 45, 60, 55, 70, 85, 80, 95, 90, 100]
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7D');
  const activeChart = chartData[timeRange];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white tracking-tight">System Overview</motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400 mt-1">Welcome back. Here is what is happening across the factory today.</motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
          {['7D', '1M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.id} variants={itemVariants} whileHover={{ y: -5 }} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
              <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${kpi.bg.split('/')[0]}`} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${kpi.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {kpi.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {kpi.trend}
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-400 font-medium mb-1">{kpi.label}</h3>
                <p className="text-3xl font-black text-white tracking-tight">{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-white">Revenue vs Operations Cost</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-slate-400">Revenue</span></div>
              <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-slate-700"></span><span className="text-slate-400">Cost</span></div>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 relative pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              {[4, 3, 2, 1, 0].map(line => (
                <div key={line} className="w-full h-px bg-slate-800/50 relative">
                  <span className="absolute -left-6 -top-2.5 text-xs text-slate-600">{line * 25}k</span>
                </div>
              ))}
            </div>
            <AnimatePresence mode="popLayout">
              {activeChart.map((val, idx) => (
                <div key={`${timeRange}-${idx}`} className="flex-1 flex flex-col justify-end gap-1 group relative z-10 h-full pb-8">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: `${val * 0.7}%`, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.3, delay: idx * 0.05 }}
                    className="w-full bg-blue-500 rounded-t-sm relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">₹{val}k</div>
                  </motion.div>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: `${val * 0.4}%`, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.3, delay: idx * 0.05 + 0.1 }}
                    className="w-full bg-slate-700 rounded-t-sm"
                  />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-medium">
                    {timeRange === '7D' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][idx] : timeRange === '1M' ? `W${idx+1}` : ['J','F','M','A','M','J','J','A','S','O','N','D'][idx]}
                  </span>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col h-[400px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-lg font-bold text-white">Live Activity</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 space-y-4 pr-2">
            {activityFeed.map((activity, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (idx * 0.1) }}
                key={activity.id} 
                className="flex gap-4 group"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-900 z-10 ${
                    activity.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
                    activity.type === 'danger' ? 'bg-rose-500/20 text-rose-500' :
                    activity.type === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {activity.type === 'success' ? <Box size={16} /> : activity.type === 'warning' ? <Package size={16} /> : <Activity size={16} />}
                  </div>
                  {idx !== activityFeed.length - 1 && <div className="w-0.5 h-full bg-slate-800 mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{activity.user}</span>
                    <span className="text-xs text-slate-600 flex items-center gap-1"><Clock size={10} /> {activity.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;