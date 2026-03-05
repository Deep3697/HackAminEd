import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Circle, FileText, Plus, Clock, Truck, ShieldCheck } from 'lucide-react';
import Modal from '../../components/common/Modal';

const pos = [
  { 
    id: 'PO-2026-041', 
    vendor: 'Steel Authority Inc.', 
    status: 'GRN Received', 
    amount: 550000, 
    date: 'Mar 05',
    steps: [
      { label: 'Indent Raised', date: 'Mar 01', status: 'completed', desc: 'Approved by Production Dept' },
      { label: 'PO Authorized', date: 'Mar 02', status: 'completed', desc: 'Signed by Finance' },
      { label: 'Vendor Dispatched', date: 'Mar 03', status: 'completed', desc: 'Vehicle No: GJ-01-XX-001' },
      { label: 'GRN & Quality', date: 'Mar 05', status: 'completed', desc: 'Passed IQC Inspection' }
    ]
  },
  { 
    id: 'PO-2026-040', 
    vendor: 'Global Rubber Works', 
    status: 'In Transit', 
    amount: 125000, 
    date: 'Mar 03',
    steps: [
      { label: 'Indent Raised', date: 'Feb 28', status: 'completed', desc: 'Requirement for B-402' },
      { label: 'PO Authorized', date: 'Mar 01', status: 'completed', desc: 'Digital Signature applied' },
      { label: 'Vendor Dispatched', date: 'Mar 03', status: 'active', desc: 'Expected Arrival: Mar 06' },
      { label: 'GRN & Quality', date: '---', status: 'pending', desc: 'Awaiting Gate Entry' }
    ]
  },
  { 
    id: 'PO-2026-039', 
    vendor: 'Techtronics Ltd.', 
    status: 'Pending Approval', 
    amount: 890000, 
    date: 'Mar 01',
    steps: [
      { label: 'Indent Raised', date: 'Feb 25', status: 'completed', desc: 'Bulk electronic components' },
      { label: 'PO Authorized', date: '---', status: 'active', desc: 'Awaiting Finance Review' },
      { label: 'Vendor Dispatched', date: '---', status: 'pending', desc: 'Pending Order Confirmation' },
      { label: 'GRN & Quality', date: '---', status: 'pending', desc: 'Awaiting Shipment' }
    ]
  }
];

const PurchaseDashboard = () => {
  const [activePo, setActivePo] = useState(pos[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPos = pos.filter(po => 
    po.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || 
    po.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 font-sans">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold text-white">Purchase Tracking</motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-400">Monitor order lifecycles from indent to delivery.</motion.p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-violet-600/20 flex items-center gap-2"
        >
          <Plus size={18} /> Raise Indent
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full md:w-80 lg:w-96 flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-violet-500 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredPos.map(po => (
              <button 
                key={po.id} onClick={() => setActivePo(po)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${activePo.id === po.id ? 'bg-violet-600/10 border-violet-500/40 shadow-lg' : 'bg-transparent border-transparent hover:bg-slate-800/40'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-mono text-xs font-bold ${activePo.id === po.id ? 'text-violet-400' : 'text-slate-500'}`}>{po.id}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{po.date}</span>
                </div>
                <h4 className="text-white font-bold truncate mb-2">{po.vendor}</h4>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                    po.status.includes('Received') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    po.status.includes('Transit') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>{po.status}</span>
                  <span className="text-sm font-black text-slate-300">₹{(po.amount / 100000).toFixed(1)}L</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          key={activePo.id}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10 border-b border-slate-800 pb-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black text-white">{activePo.vendor}</h2>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded font-mono">{activePo.id}</span>
              </div>
              <p className="text-slate-400 flex items-center gap-2">
                <FileText size={16} className="text-violet-500" />
                Total Order Value: <span className="text-white font-bold">₹{activePo.amount.toLocaleString('en-IN')}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-all border border-slate-700 shadow-sm"><FileText size={20} /></button>
              <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20">Email Vendor</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-4">
            <h3 className="text-sm uppercase tracking-[0.2em] font-black text-slate-500 mb-10">Order Progression</h3>
            <div className="space-y-0 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {activePo.steps.map((step, idx) => (
                <div key={idx} className="relative pl-12 pb-10 last:pb-0">
                  <div className={`absolute left-0 top-1.5 w-9 h-9 rounded-full border-4 border-slate-900 flex items-center justify-center z-10 ${
                    step.status === 'completed' ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' :
                    step.status === 'active' ? 'bg-slate-800 text-violet-400 border-violet-500/50' : 'bg-slate-900 text-slate-700'
                  }`}>
                    {step.status === 'completed' ? <ShieldCheck size={18} /> : step.status === 'active' ? <Clock size={18} className="animate-pulse" /> : <Circle size={18} />}
                  </div>
                  <div className={`p-5 rounded-2xl border transition-all ${
                    step.status === 'active' ? 'bg-violet-500/5 border-violet-500/30 shadow-xl' : 'bg-slate-950/40 border-slate-800/60'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold ${step.status === 'pending' ? 'text-slate-600' : 'text-white'}`}>{step.label}</h4>
                      <time className="text-xs font-mono text-slate-500 font-bold">{step.date}</time>
                    </div>
                    <p className={`text-sm ${step.status === 'pending' ? 'text-slate-700' : 'text-slate-400'}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise New Material Indent">
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Item Category</label>
            <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 transition-all">
              <option>Raw Material (Steel/Iron)</option>
              <option>Consumables (Paints/Oils)</option>
              <option>Electronics/Sensors</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Quantity</label>
              <input type="number" placeholder="0" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Unit</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 transition-all">
                <option>Kilograms (kg)</option>
                <option>Numbers (pcs)</option>
                <option>Litres (L)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
            <button type="button" className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-600/20">Submit Indent</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseDashboard;