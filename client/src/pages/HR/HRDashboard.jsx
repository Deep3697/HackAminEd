import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Wallet, CalendarCheck, Briefcase, Plus } from 'lucide-react';
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

const HRDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const employees = [
    { id: 'EMP-1042', name: 'Rajesh Kumar', designation: 'Production Manager', dept: 'Production', salary: '₹85,000', status: 'Active' },
    { id: 'EMP-1043', name: 'Priya Sharma', designation: 'Quality Inspector', dept: 'Quality', salary: '₹45,000', status: 'Active' },
    { id: 'EMP-1044', name: 'Amit Patel', designation: 'Sales Executive', dept: 'Sales', salary: '₹35,000', status: 'On Leave' },
    { id: 'EMP-1045', name: 'Suresh Singh', designation: 'Machine Operator', dept: 'Production', salary: '₹28,000', status: 'Active' },
  ];

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-2">HR Management</motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400">Manage employee directories, salary structures, and payroll.</motion.p>
          </div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-teal-600/20"
          >
            <Plus size={18} />
            Add Employee
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Employees" value="142" icon={Users} color="bg-teal-500" />
          <StatCard title="Present Today" value="138" icon={CalendarCheck} color="bg-emerald-500" />
          <StatCard title="Monthly Payroll" value="₹12.5L" icon={Wallet} color="bg-blue-500" />
          <StatCard title="Active Advances" value="₹45K" icon={Briefcase} color="bg-amber-500" />
        </div>

        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Employee Directory</h2>
            <button className="text-sm text-teal-400 hover:text-teal-300 transition-colors">View All Staff</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-sm">
                  <th className="px-6 py-4 font-medium">Emp Code</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Designation</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Basic Salary</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {employees.map((emp, index) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white">{emp.id}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{emp.name}</td>
                    <td className="px-6 py-4 text-slate-400">{emp.designation}</td>
                    <td className="px-6 py-4 text-slate-400">{emp.dept}</td>
                    <td className="px-6 py-4 text-slate-300">{emp.salary}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {emp.status}
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
        title="Employee Master Registration"
        maxWidth="max-w-4xl"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
              <input type="tel" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder="+91" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Designation</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder="e.g. Technician" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
                <option value="">Select Dept...</option>
                <option value="production">Production</option>
                <option value="quality">Quality</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Joining Date</label>
              <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Basic Salary (₹)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bank Details (A/C Number)</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" placeholder="Account Number" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors shadow-lg shadow-teal-600/20">Register Employee</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default HRDashboard;