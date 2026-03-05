import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, Landmark, CreditCard, Plus } from 'lucide-react';
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

const FinanceDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentVouchers = [
    { id: 'VCH-2026-892', type: 'Receipt', party: 'Acme Corp', date: 'Mar 05, 2026', amount: '₹1,45,000', mode: 'NEFT' },
    { id: 'VCH-2026-891', type: 'Payment', party: 'Steel Authority Inc.', date: 'Mar 04, 2026', amount: '₹5,50,000', mode: 'Cheque' },
    { id: 'VCH-2026-890', type: 'Journal', party: 'GST Adjustment', date: 'Mar 03, 2026', amount: '₹42,500', mode: 'System' },
    { id: 'VCH-2026-889', type: 'Contra', party: 'Cash to Bank (HDFC)', date: 'Mar 01, 2026', amount: '₹10,000', mode: 'Cash' },
  ];

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-2">Finance Management</motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400">Manage vouchers, bank reconciliations, and financial statements.</motion.p>
          </div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus size={18} />
            New Voucher Entry
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Cash/Bank Balance" value="₹34.5L" icon={Landmark} color="bg-emerald-500" />
          <StatCard title="Pending Receivables" value="₹12.8L" icon={DollarSign} color="bg-blue-500" />
          <StatCard title="Total Payables" value="₹8.2L" icon={CreditCard} color="bg-rose-500" />
          <StatCard title="Current GST Liability" value="₹1.4L" icon={FileText} color="bg-amber-500" />
        </div>

        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Recent Voucher Entries</h2>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">View All Ledgers</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-sm">
                  <th className="px-6 py-4 font-medium">Voucher No</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Party / Particulars</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Mode</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentVouchers.map((vch, index) => (
                  <motion.tr
                    key={vch.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white">{vch.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        vch.type === 'Receipt' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        vch.type === 'Payment' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        vch.type === 'Journal' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {vch.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{vch.party}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{vch.date}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{vch.mode}</td>
                    <td className={`px-6 py-4 font-medium ${
                      vch.type === 'Receipt' ? 'text-emerald-400' : 
                      vch.type === 'Payment' ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      {vch.type === 'Receipt' ? '+' : vch.type === 'Payment' ? '-' : ''}{vch.amount}
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
        title="New Voucher Entry"
        maxWidth="max-w-4xl"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Voucher Type</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                <option value="receipt">Receipt</option>
                <option value="payment">Payment</option>
                <option value="journal">Journal</option>
                <option value="contra">Contra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹)</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="0.00" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Debit Account</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                <option value="">Select Ledger...</option>
                <option value="hdfc_bank">HDFC Bank C/A</option>
                <option value="cash">Cash in Hand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Credit Account</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                <option value="">Select Ledger...</option>
                <option value="acme_corp">Acme Corp (Debtor)</option>
                <option value="sales_ac">Sales A/C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Narration</label>
            <textarea className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" rows="2" placeholder="Being payment received via..."></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-600/20">Post Voucher</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default FinanceDashboard;