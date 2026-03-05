import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, ClipboardCheck, FileText, Plus } from 'lucide-react';
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

const LogisticsDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const transportOrders = [
    { id: 'TO-2026-412', transporter: 'Delhivery Logistics', destination: 'Mumbai Warehouse', vehicle: '32ft Container', date: 'Mar 05, 2026', status: 'In Transit' },
    { id: 'TO-2026-411', transporter: 'SafeExpress', destination: 'Pune Distribution', vehicle: '19ft Truck', date: 'Mar 04, 2026', status: 'Delivered' },
    { id: 'TO-2026-410', transporter: 'BlueDart Freight', destination: 'Surat Plant', vehicle: 'LCV', date: 'Mar 05, 2026', status: 'Scheduled' },
    { id: 'TO-2026-409', transporter: 'Local Transporters', destination: 'City Hub', vehicle: 'Pickup', date: 'Mar 03, 2026', status: 'Delivered' },
  ];

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-2">Logistics Management</motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400">Track transport orders, dispatch challans, and freight billing.</motion.p>
          </div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            Book Transport
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Transport Orders" value="18" icon={Truck} color="bg-indigo-500" />
          <StatCard title="In-Transit Shipments" value="12" icon={MapPin} color="bg-blue-500" />
          <StatCard title="Dispatched Challans" value="156" icon={ClipboardCheck} color="bg-emerald-500" />
          <StatCard title="Pending Freight Bills" value="24" icon={FileText} color="bg-rose-500" />
        </div>

        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Recent Transport Orders</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-sm">
                  <th className="px-6 py-4 font-medium">Order No</th>
                  <th className="px-6 py-4 font-medium">Transporter</th>
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">Vehicle Type</th>
                  <th className="px-6 py-4 font-medium">Pickup Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transportOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{order.transporter}</td>
                    <td className="px-6 py-4 text-slate-400">{order.destination}</td>
                    <td className="px-6 py-4 text-slate-400">{order.vehicle}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        order.status === 'In Transit' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {order.status}
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
        title="Book Transport Order"
        maxWidth="max-w-3xl"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Transporter</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                <option value="">Select Transporter Master...</option>
                <option value="delhivery">Delhivery Logistics</option>
                <option value="safeexpress">SafeExpress</option>
                <option value="bluedart">BlueDart Freight</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Vehicle Type</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                <option value="">Select Vehicle...</option>
                <option value="pickup">Pickup / LCV</option>
                <option value="truck19">19ft Truck</option>
                <option value="container32">32ft Container</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Destination</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="Delivery address or hub" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Scheduled Pickup Date</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-600/20">Confirm Order</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default LogisticsDashboard;