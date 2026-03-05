import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckSquare, Search, Plus } from 'lucide-react';
import Modal from '../../components/common/Modal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${color}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-${color.split('-')[1]}-500`}>
        <Icon size={24} />
      </div>
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const QualityDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const qualityLogs = [
    { id: 'QC-2026-901', type: 'IQC', reference: 'GRN-442', item: 'Steel Coils', date: 'Mar 05, 2026', status: 'Passed' },
    { id: 'QC-2026-902', type: 'PQC', reference: 'RC-104', item: 'Swift Door Panel', date: 'Mar 05, 2026', status: 'Rework' },
    { id: 'QC-2026-903', type: 'PDI', reference: 'SO-882', item: 'Brake Assembly Batch', date: 'Mar 04, 2026', status: 'Passed' },
    { id: 'QC-2026-904', type: 'IQC', reference: 'GRN-445', item: 'Rubber Seals', date: 'Mar 03, 2026', status: 'Rejected' },
  ];

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-2">Quality Management</motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400">Log IQC, PQC, PDI inspections and manage rejection decisions.</motion.p>
          </div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-cyan-600/20"
          >
            <Plus size={18} />
            New Inspection
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Inspections Today" value="42" icon={Search} color="bg-blue-500" />
          <StatCard title="Passed Items" value="38" icon={ShieldCheck} color="bg-cyan-500" />
          <StatCard title="Sent for Rework" value="3" icon={CheckSquare} color="bg-amber-500" />
          <StatCard title="Rejected/Scrap" value="1" icon={AlertTriangle} color="bg-rose-500" />
        </div>

        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Recent Quality Logs</h2>
            <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-sm">
                  <th className="px-6 py-4 font-medium">Log ID</th>
                  <th className="px-6 py-4 font-medium">Stage Type</th>
                  <th className="px-6 py-4 font-medium">Doc Ref</th>
                  <th className="px-6 py-4 font-medium">Item / Product</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {qualityLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white">{log.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.type === 'IQC' ? 'bg-indigo-500/20 text-indigo-400' :
                        log.type === 'PQC' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-teal-500/20 text-teal-400'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-sm">{log.reference}</td>
                    <td className="px-6 py-4 text-slate-300">{log.item}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{log.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        log.status === 'Passed' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        log.status === 'Rework' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Quality Inspection"
        maxWidth="max-w-3xl"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Inspection Stage</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all">
                <option value="">Select Stage...</option>
                <option value="iqc">IQC (Incoming Quality Control)</option>
                <option value="pqc">PQC (Process Quality Control)</option>
                <option value="pdi">PDI (Pre-Dispatch)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Document Reference</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="e.g. GRN-104 or RC-202" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Item / Product Name</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Item being inspected" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Inspection Decision (QRD)</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all">
                <option value="">Select Decision...</option>
                <option value="pass">Passed (OK)</option>
                <option value="rework">Rework / Downgrade</option>
                <option value="reject">Rejected / Scrap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Inspector Observations / Remarks</label>
            <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" rows="3" placeholder="Enter dimension variations, visual defects, or pass criteria met..."></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors shadow-lg shadow-cyan-600/20">Submit Log</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default QualityDashboard;