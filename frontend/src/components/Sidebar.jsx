import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBox, FiUsers, FiShoppingCart, FiAperture, FiLogOut, FiMail, FiImage, FiShoppingBag, FiStar, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('adminProfileImage') || null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('adminProfileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const links = [
    { name: 'Dashboard', path: '/', icon: <FiHome size={20} /> },
    { name: 'Products', path: '/products', icon: <FiBox size={20} /> },
    { name: 'Customers', path: '/customers', icon: <FiUsers size={20} /> },
    { name: 'Orders', path: '/orders', icon: <FiShoppingCart size={20} /> },
  ];

  return (
    <motion.div 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      className="w-[260px] h-full bg-black/10 border-r border-white/5 hidden md:flex flex-col z-20"
    >
      <div className="h-24 flex items-center px-8 border-b border-white/5">
        <h1 className="text-2xl font-black tracking-wider flex items-center gap-4">
          <motion.div 
            animate={{ rotateY: 360, y: [0, -5, 0] }}
            transition={{ rotateY: { duration: 5, repeat: Infinity, ease: "linear" }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(236,72,153,0.6)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            <FiShoppingBag size={24} className="absolute z-10 drop-shadow-md" />
            <FiStar size={12} className="absolute top-1.5 right-1.5 text-yellow-300 z-10 animate-bounce drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]" />
          </motion.div>
          <motion.div 
            className="tracking-tight font-black text-3xl flex"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              animate={{ color: ['#38bdf8', '#e879f9', '#2dd4bf', '#38bdf8'] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]"
            >
              Shop
            </motion.span>
            <motion.span 
              animate={{ color: ['#e879f9', '#2dd4bf', '#38bdf8', '#e879f9'] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
            >
              Verse
            </motion.span>
          </motion.div>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-transparent text-blue-400 border-l-2 border-blue-400'
                  : 'text-secondary hover:text-primary hover:bg-white/5'
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto relative">
        
        <AnimatePresence>
          {showMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-24 left-4 w-[220px] z-50 drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]"
            >
              {/* Pentagonal Outer Box with shiny border effect */}
              <div 
                className="bg-gradient-to-br from-pink-400 via-pink-400 to-cyan-400 p-1 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}
              >
                {/* Shiny Corner Effect Overlay */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-50 rotate-45 pointer-events-none animate-[pulse_3s_infinite]"></div>
                
                {/* Inner Content Area - Full Pink and Light Blue Mixture */}
                <div 
                   className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-5 h-full w-full flex flex-col gap-3 relative z-10 items-center text-center"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}
                >
                  <button onClick={() => setShowMenu(false)} className="absolute top-3 right-3 text-red-600 hover:text-white hover:bg-red-500/80 p-1.5 rounded-full transition-colors cursor-pointer shadow-sm bg-white/20 backdrop-blur-sm">
                    <FiX size={16} />
                  </button>
                  
                  {/* WhatsApp Style Profile Avatar & Upload */}
                  <div className="relative group mt-1">
                    <label className="cursor-pointer flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[4.5rem] h-[4.5rem] text-white mt-4">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 11.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM10.875 14.161c-1.257.067-2.585.346-3.832.969a1.5 1.5 0 00-.776 1.092c-.085.642.131 1.282.593 1.745A9.704 9.704 0 0012 20.25a9.704 9.704 0 005.14-1.483c.462-.463.678-1.103.593-1.745a1.5 1.5 0 00-.776-1.092c-1.247-.623-2.575-.902-3.832-.969-.356-.019-.714.072-1.002.256l-1.123.716a1.5 1.5 0 01-1.614 0l-1.123-.716a1.5 1.5 0 00-1.002-.256z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[#0f172a] text-xs font-bold mt-3 bg-white/30 px-4 py-1.5 rounded-full hover:bg-white/50 transition-colors shadow-sm">
                        Change Photo
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col border-b border-[#0f172a]/20 pb-4 w-full mt-2">
                    <p className="font-extrabold text-xl text-[#0f172a] leading-tight">
                      {user ? user.full_name || 'Admin User' : 'Admin User'}
                    </p>
                    <p className="text-xs font-bold text-[#1e3a8a] flex items-center justify-center gap-1 mt-1 break-all">
                      <FiMail size={12}/> {user ? user.email : 'admin@shopverse.com'}
                    </p>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          onClick={() => setShowMenu(!showMenu)}
          className="glass-panel p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/20 group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-shadow overflow-hidden border-2 border-white/20">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white mt-2">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 11.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM10.875 14.161c-1.257.067-2.585.346-3.832.969a1.5 1.5 0 00-.776 1.092c-.085.642.131 1.282.593 1.745A9.704 9.704 0 0012 20.25a9.704 9.704 0 005.14-1.483c.462-.463.678-1.103.593-1.745a1.5 1.5 0 00-.776-1.092c-1.247-.623-2.575-.902-3.832-.969-.356-.019-.714.072-1.002.256l-1.123.716a1.5 1.5 0 01-1.614 0l-1.123-.716a1.5 1.5 0 00-1.002-.256z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-surface"></div>
          </div>
          <div>
            <p className="font-medium text-sm text-white">{user ? user.full_name || 'Admin User' : 'Admin User'}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
