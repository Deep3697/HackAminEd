import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Settings, AlertCircle, CheckCircle2, Calendar, Plus } from 'lucide-react';
import Modal from '../../components/common/Modal';

const initialTools = [
  {
    id: 'TL-801',
    name: 'CNC Milling Machine (A1)',
    location: 'Floor 1 - Zone B',
    status: 'Healthy',
    nextCalibration: '2026-04-15',
    history: [
      { id: 1, date: '2026-02-10', issue: 'Routine Greasing', cost: '₹5,000', tech: 'Ramesh' }
    ]
  },
  {
    id: 'TL-802',
    name: 'Hydraulic Press (Heavy)',
    location: 'Floor 1 - Zone A',
    status: 'Needs Repair',
    nextCalibration: '2026-03-08',
    history: [
      { id: 2, date: '2025-11-20', issue: 'Pressure Valve Replacement', cost: '₹12,500', tech: 'Suresh' }
    ]
  },
  {
    id: 'TL-803',
    name: 'Laser Cutter (Precision)',
    location: 'Floor 2 - Zone C',
    status: 'Under Maintenance',
    nextCalibration: '2026-06-01',
    history: [
      { id: 3, date: '2026-03-01', issue: 'Lens Cleaning & Alignment', cost: '₹8,000', tech: 'Amit' }
    ]
  }
];

const MaintenanceDashboard = () => {
  const [tools, setTools] = useState(initialTools);
  const [selectedToolId, setSelectedToolId] = useState(initialTools[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState('');
  const [tech, setTech] = useState('');

  const selectedTool = tools.find(t => t.id === selectedToolId);

  const handleLogMaintenance = (e) => {
    e.preventDefault();
    
    const newLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      issue,
      cost: `₹${cost}`,
      tech
    };

    setTools(tools.map(tool => {
      if (tool.id === selectedToolId) {
        return {
          ...tool,
          status: 'Healthy',
          history: [newLog, ...tool.history]
        };
      }
      return tool;
    }));

    setIssue('');
    setCost('');
    setTech('');
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold text-white mb-2">Equipment Maintenance</motion.h1>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-400">Track tool calibrations, machine health, and rectification logs.</motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col h-[70vh]"
          >
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings size={20} className="text-amber-500" />
                Asset & Tool Roster
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {tools.map((tool) => (
                <div 
                  key={tool.id}
                  onClick={() => setSelectedToolId(tool.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedToolId === tool.id 
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${selectedToolId === tool.id ? 'text-amber-400' : 'text-white'}`}>{tool.id}</h3>
                    {tool.status === 'Healthy' && <CheckCircle2 size={18} className="text-emerald-500" />}
                    {tool.status === 'Needs Repair' && <AlertCircle size={18} className="text-rose-500" />}
                    {tool.status === 'Under Maintenance' && <Wrench size={18} className="text-amber-500" />}
                  </div>
                  <p className="text-sm text-slate-300 font-medium mb-1">{tool.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> Calibrate: {tool.nextCalibration}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col h-[70vh] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedToolId}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTool.name}</h2>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                        Code: {selectedTool.id}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                        Loc: {selectedTool.location}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-amber-600/20 z-10"
                  >
                    <Plus size={18} />
                    Log Repair
                  </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar z-10">
                  <h3 className="text-lg font-semibold text-white mb-4">Maintenance & Rectification History</h3>
                  <div className="space-y-4">
                    {selectedTool.history.map((log) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        key={log.id} 
                        className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex items-center justify-between group hover:border-amber-500/30 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                            <Wrench size={20} />
                          </div>
                          <div>
                            <p className="text-white font-medium mb-1">{log.issue}</p>
                            <p className="text-sm text-slate-400">Tech: {log.tech} • Date: {log.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 text-sm mb-1">Cost</p>
                          <p className="text-amber-400 font-bold">{log.cost}</p>
                        </div>
                      </motion.div>
                    ))}
                    {selectedTool.history.length === 0 && (
                      <div className="text-center py-10 text-slate-500">
                        No maintenance history recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Log Repair: ${selectedTool.id}`} maxWidth="max-w-2xl">
        <form onSubmit={handleLogMaintenance} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Issue / Work Done</label>
            <input 
              required type="text" value={issue} onChange={(e) => setIssue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
              placeholder="e.g. Replaced broken conveyor belt" 
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Technician Name</label>
              <input 
                required type="text" value={tech} onChange={(e) => setTech(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
                placeholder="Technician name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Total Cost (₹)</label>
              <input 
                required type="number" value={cost} onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
                placeholder="0" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors shadow-lg shadow-amber-600/20">Save Record</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MaintenanceDashboard;