import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, Bell, Lock, Save } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'company', label: 'Company Details', icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Access', icon: Lock },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-2">System Settings</motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400">Manage your profile, preferences, and system configurations.</motion.p>
        </div>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
        >
          <Save size={18} />
          Save Changes
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <motion.div variants={itemVariants} className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden ${
                  isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingTab"
                    className="absolute inset-0 border border-blue-500/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="font-medium relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 min-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px]">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff&size=128" alt="Profile" className="w-full h-full rounded-full border-4 border-slate-900" />
                  </div>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">Change Avatar</button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <input type="text" defaultValue="Super Admin" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <input type="email" defaultValue="admin@techmicra.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                    <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Designation</label>
                    <input type="text" defaultValue="System Controller" disabled className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Company Profile</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                    <input type="text" defaultValue="TechMicra Technologies Pvt. Ltd." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">GSTIN Number</label>
                    <input type="text" defaultValue="24AAACC1206D1Z1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Registration Type</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all">
                      <option>Private Limited</option>
                      <option>LLP</option>
                      <option>Proprietorship</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Registered Address</label>
                    <textarea rows="3" defaultValue="Plot No. 45, GIDC Estate, Ahmedabad, Gujarat, India" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"></textarea>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Automated Alerts & Notifications</h2>
                <div className="space-y-4">
                  {[
                    { title: "Payment Reminders", desc: "Auto-send WhatsApp & Email alerts to clients for upcoming payments." },
                    { title: "Inventory Alerts", desc: "Notify when raw materials fall below the minimum threshold." },
                    { title: "Daily Reports", desc: "Receive automated P&L and production summaries via email at 8 PM." },
                    { title: "Quality Rejections", desc: "Immediate push notification for any PDI or IQC test failure." }
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950">
                      <div>
                        <h4 className="text-white font-medium">{setting.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{setting.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Security & Password</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700 mt-4">
                    Update Password
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;