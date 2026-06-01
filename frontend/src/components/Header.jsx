import { useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiLogOut, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/products': return 'Product Inventory';
      case '/customers': return 'Customer Directory';
      case '/orders': return 'Order Management';
      default: return 'ShopVerse System';
    }
  };

  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications/').then(res => setNotifications(res.data)).catch(() => {});
    }
  }, [user]);

  const markRead = (id) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    });
  };

  return (
    <header className="h-24 bg-transparent border-b border-white/5 flex items-center justify-between px-8 lg:px-10 z-20 sticky top-0">
      <div>
        <h2 className="text-2xl font-bold text-primary">{getTitle()}</h2>
        <div className="text-xs text-secondary mt-1 flex items-center gap-2">
          <span className="text-blue-400">ShopVerse</span> <span className="w-1 h-1 rounded-full bg-secondary"></span> <span>{getTitle()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-pink-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-black/40 border-2 border-purple-500/50 rounded-full pl-10 pr-4 py-2 text-sm text-pink-400 font-medium focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 w-64 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] focus:shadow-[0_0_25px_rgba(236,72,153,0.6)] placeholder-pink-400/70"
          />
        </div>
        
        
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: [0, -15, 15, -15, 15, 0] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => setShowNotif(!showNotif)} 
            className="relative p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 hover:border-pink-400 transition-all text-pink-400 hover:text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)]"
          >
            <FiBell size={22} className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,1)] border-2 border-[#0f172a]"></span>
            )}
          </motion.button>
          
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl p-4 z-50 border border-white/20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">Notifications</h3>
                <button onClick={() => setShowNotif(false)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-full transition-colors cursor-pointer">
                  <FiX size={18} />
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {notifications.length === 0 ? <p className="text-gray-400 text-sm">No new notifications</p> : null}
                {notifications.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)} className={`p-3 rounded-xl text-sm cursor-pointer transition-colors ${n.is_read ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-pink-500/20 text-pink-100 border border-pink-500/30 hover:bg-pink-500/30'}`}>
                    <p>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


      </div>
    </header>
  );
};

export default Header;
