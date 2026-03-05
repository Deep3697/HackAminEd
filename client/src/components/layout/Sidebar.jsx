import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Factory,
  DollarSign, Users, Truck, CheckCircle,
  HardHat, Wrench, Warehouse, MonitorCheck,
  Scale, LineChart, Menu, X, LogOut
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/sales', name: 'Sales', icon: ShoppingCart },
  { path: '/purchase', name: 'Purchase', icon: Package },
  { path: '/production', name: 'Production', icon: Factory },
  { path: '/finance', name: 'Finance', icon: DollarSign },
  { path: '/hr', name: 'HR Management', icon: Users },
  { path: '/logistics', name: 'Logistics', icon: Truck },
  { path: '/quality', name: 'Quality', icon: CheckCircle },
  { path: '/contractors', name: 'Contractors', icon: HardHat },
  { path: '/maintenance', name: 'Maintenance', icon: Wrench },
  { path: '/warehouse', name: 'Warehouse', icon: Warehouse },
  { path: '/assets', name: 'Assets', icon: MonitorCheck },
  { path: '/statutory', name: 'Statutory', icon: Scale },
  { path: '/simulation', name: 'Simulation', icon: LineChart },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      animate={{ width: isOpen ? 280 : 88 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col relative z-20 shadow-2xl"
    >
      <div className="flex items-center justify-between p-5 h-20 border-b border-slate-800/80">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <span className="text-white font-bold text-lg">TM</span>
              </div>
              <span className="text-white font-bold text-xl whitespace-nowrap tracking-tight">TechMicra</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all mx-auto shadow-sm"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar scroll-fade-mask">
        <ul className="space-y-1.5 pb-8">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 border border-blue-500/20 rounded-xl bg-gradient-to-r from-blue-600/10 to-transparent"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon size={22} className={`shrink-0 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <AnimatePresence mode="wait">
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium whitespace-nowrap overflow-hidden relative z-10"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 border-t border-slate-800/80 bg-slate-950">
        <button className="flex items-center gap-4 px-3.5 py-3 w-full rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors group">
          <LogOut size={22} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;