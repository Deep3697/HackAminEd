import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Phone, Mail } from 'lucide-react';
import Modal from '../../components/common/Modal';

const initialInquiries = {
  'New': [
    { id: 'INQ-089', client: 'Acme Corp', value: '₹1.4L', contact: 'Ravi' },
    { id: 'INQ-090', client: 'Stark Ind', value: '₹2.5L', contact: 'Amit' }
  ],
  'Quoted': [
    { id: 'INQ-087', client: 'Wayne Ent', value: '₹3.2L', contact: 'Priya' }
  ],
  'Confirmed SO': [
    { id: 'SO-041', client: 'LexCorp', value: '₹8.9L', contact: 'Suresh' },
    { id: 'SO-040', client: 'Global Works', value: '₹1.1L', contact: 'Raj' }
  ]
};

const SalesDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold text-white">Sales Pipeline</motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 mt-1">Drag and drop inquiries through the sales cycle.</motion.p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus size={18} /> New Inquiry
        </motion.button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {Object.entries(initialInquiries).map(([columnName, items], colIndex) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIndex * 0.1 }}
            key={columnName} 
            className="min-w-[320px] max-w-[320px] bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                {columnName} 
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
              </h3>
              <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-grab hover:border-blue-500/50 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{item.id}</span>
                      <span className="text-sm font-bold text-white">{item.value}</span>
                    </div>
                    <h4 className="text-slate-200 font-medium mb-3">{item.client}</h4>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
                      <span className="text-xs text-slate-500">{item.contact}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-blue-400"><Phone size={14} /></button>
                        <button className="text-slate-400 hover:text-blue-400"><Mail size={14} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Sales Inquiry">
        <form className="space-y-4">
          <input type="text" placeholder="Client Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <input type="text" placeholder="Expected Value (₹)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Inquiry</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesDashboard;