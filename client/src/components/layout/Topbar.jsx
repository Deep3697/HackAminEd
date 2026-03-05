import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Topbar = () => {
  return (
    <header className="h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 max-w-xl relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Search modules, records, or tracking IDs..."
          className="w-full bg-slate-900 border border-slate-800 rounded-full pl-12 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 ml-8"
      >
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-slate-950"></span>
        </button>
        
        <Link to="/settings" className="text-slate-400 hover:text-white transition-colors block">
          <SettingsIcon size={22} />
        </Link>

        <div className="h-8 w-px bg-slate-800"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Super Admin</p>
            <p className="text-xs text-slate-500">System Controller</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px]">
            <img 
              src="https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff" 
              alt="Profile" 
              className="w-full h-full rounded-full border-2 border-slate-950"
            />
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Topbar;