import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBox, FiUsers, FiShoppingCart, FiAlertTriangle, FiTrendingUp, FiActivity, FiDollarSign, FiPlus, FiX, FiCheckCircle, FiClock, FiTruck, FiPackage } from 'react-icons/fi';
import { getDashboard, getOrders, updateOrderStatus } from '../services/api';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Sparkline = ({ color }) => (
  <svg className="w-24 h-8" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 25C10 25 15 10 25 15C35 20 40 5 50 10C60 15 65 25 75 20C85 15 90 5 100 10" 
          stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"/>
  </svg>
);

const StatCard = ({ title, value, icon, gradient, color }) => (
  <motion.div variants={item} className="glass-card p-6 rounded-3xl relative overflow-hidden group shadow-lg">
    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-150`}></div>
    
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} bg-opacity-20 flex items-center justify-center shadow-glow backdrop-blur-md border border-white/10`}>
        {icon}
      </div>
      <Sparkline color={color} />
    </div>
    
    <div>
      <h3 className="text-4xl font-black tracking-tight mb-1 text-white">
        {value}
      </h3>
      <p className="text-white/80 text-sm font-bold uppercase tracking-wider">{title}</p>
    </div>
  </motion.div>
);

const CustomLineChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-secondary">No data available</div>;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = (max - min) || 1;
  
  return (
    <div className="relative w-full h-full min-h-[250px] mt-8 pb-6">
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {data.map((d, i) => {
          if (i === 0) return null;
          const prev = data[i-1];
          const x1 = ((i-1) / (data.length - 1)) * 100;
          const y1 = 100 - ((prev.value - min) / range) * 80 - 10;
          const x2 = (i / (data.length - 1)) * 100;
          const y2 = 100 - ((d.value - min) / range) * 80 - 10;
          
          const color = d.value >= prev.value ? '#fbbf24' : '#ef4444'; // yellow vs red
          
          return (
            <g key={i}>
              <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={color} strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_5px_10px_rgba(251,191,36,0.3)]" />
              <circle cx={`${x2}%`} cy={`${y2}%`} r="6" fill="#0f172a" stroke={color} strokeWidth="3" />
              <text x={`${x2}%`} y={`${y2 - 12}%`} fill="white" fontSize="12" textAnchor="middle" className="font-bold drop-shadow-md">
                ${Math.round(d.value)}
              </text>
            </g>
          );
        })}
        {/* Initial Point */}
        <circle cx="0%" cy={`${100 - ((data[0].value - min) / range) * 80 - 10}%`} r="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="3" />
        <text x="0%" y={`${100 - ((data[0].value - min) / range) * 80 - 12}%`} fill="white" fontSize="12" textAnchor="start" className="font-bold drop-shadow-md">
          ${Math.round(data[0].value)}
        </text>
      </svg>
      {/* X Axis Labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2">
        {data.map((d, i) => (
          <div key={i} className="text-[10px] text-secondary font-bold uppercase tracking-wider">{d.name}</div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);
  const [showRevenueDetails, setShowRevenueDetails] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedLowStockProduct, setSelectedLowStockProduct] = useState(null);

  useEffect(() => {
    fetchStats();
    getOrders().then(res => setRecentOrders(res.data.slice(0, 5))).catch(() => {});
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setRecentOrders(recentOrders.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-panel h-48 rounded-3xl animate-pulse bg-white/5"></div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {/* Hero Welcome Section - Spans 3 cols */}
      <motion.div variants={item} className="md:col-span-3 lg:col-span-3 relative overflow-hidden glass-card rounded-[2rem] p-8 lg:p-10 border-l-4 border-l-purple-500 flex flex-col justify-center min-h-[220px]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">Welcome back to <span className="font-black text-white">
              <span className="text-pink-600 drop-shadow-sm">S</span>hop
              <span className="text-cyan-600 drop-shadow-sm">V</span>erse
            </span></h1>
            <p className="text-white/80/80 font-bold text-lg">Here's what's happening with your inventory today.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowRecentOrders(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
            >
              Recent Orders
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Orders Modal */}
      <AnimatePresence>
        {showRecentOrders && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowRecentOrders(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] relative"
            >
              <div 
                className="bg-gradient-to-br from-pink-500 via-pink-400 to-cyan-400 p-1.5 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
              >
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-60 rotate-45 pointer-events-none animate-[pulse_3s_infinite]"></div>
                
                <div 
                   className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-8 h-full w-full flex flex-col gap-6 relative z-10 text-[#0f172a]"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
                >
                  <button onClick={() => setShowRecentOrders(false)} className="absolute top-4 right-4 text-[#0f172a] hover:text-[#0f172a]/80 transition-colors bg-white/40 p-2 rounded-full backdrop-blur-sm">
                    <FiX size={20} />
                  </button>

                  <div className="flex items-center gap-5 border-b border-[#0f172a]/20 pb-5">
                    <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] text-[#0f172a]">
                      <FiShoppingCart size={32} className="mt-1" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black leading-none mb-1 text-[#0f172a]">Recent Orders</h2>
                      <p className="text-sm font-bold text-[#0f172a]/80 uppercase tracking-widest">Manage latest requests</p>
                    </div>
                  </div>

                  <div className="space-y-3 pb-6 max-h-[50vh] overflow-y-auto pr-2">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8 font-bold text-[#0f172a]/80">No recent orders found.</div>
                    ) : (
                      recentOrders.map(order => (
                        <div key={order.id} className="flex justify-between items-center bg-white/30 p-4 rounded-xl shadow-sm border border-white/30 hover:bg-white/50 transition-colors text-[#0f172a]">
                          <div>
                            <span className="font-extrabold text-lg block">Order #{order.id}</span>
                            <span className="text-sm font-bold opacity-70">Total: ${order.total_amount?.toLocaleString()}</span>
                          </div>
                          
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="bg-white/50 border-2 border-white/60 text-[#0f172a] font-bold text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-pink-500 transition-colors shadow-sm cursor-pointer"
                          >
                            <option value="Created">Created</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revenue Highlight - Spans 1 col */}
      <motion.div 
        variants={item} 
        onClick={() => setShowRevenueDetails(true)}
        className="glass-card rounded-[2rem] p-6 flex flex-col justify-center items-center text-center group cursor-pointer relative"
      >
        <div className="absolute top-2 right-4 text-xs font-bold text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">Click for details</div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform text-white">
           <FiDollarSign size={32} />
        </div>
        <h3 className="text-3xl font-black tracking-tight text-white">${stats.total_revenue?.toLocaleString()}</h3>
        <p className="text-white/80 font-bold text-sm uppercase tracking-wider mt-2">Est. Revenue</p>
      </motion.div>

      {/* Revenue Details Modal */}
      <AnimatePresence>
        {showRevenueDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowRevenueDetails(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] relative"
            >
              {/* Pentagonal Outer Box with shiny border effect */}
              <div 
                className="bg-gradient-to-br from-pink-500 via-pink-400 to-cyan-400 p-1.5 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
              >
                {/* Shiny Corner Effect Overlay */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-60 rotate-45 pointer-events-none animate-[pulse_3s_infinite]"></div>
                
                {/* Inner Content Area */}
                <div 
                   className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-8 h-full w-full flex flex-col gap-6 relative z-10 text-[#0f172a]"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
                >
                  <button onClick={() => setShowRevenueDetails(false)} className="absolute top-4 right-4 text-[#0f172a] hover:text-[#0f172a]/80 transition-colors bg-white/40 p-2 rounded-full backdrop-blur-sm">
                    <FiX size={20} />
                  </button>

                  <div className="flex items-center gap-5 border-b border-[#0f172a]/20 pb-5">
                    <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] text-[#0f172a]">
                      <FiDollarSign size={36} className="mt-1" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black leading-none mb-1 text-[#0f172a]">Revenue</h2>
                      <p className="text-sm font-bold text-[#0f172a]/80 uppercase tracking-widest">Full Details</p>
                    </div>
                  </div>

                  <div className="space-y-3 pb-2 text-[#0f172a]">
                    <div className="flex justify-between items-center bg-white/30 p-4 rounded-xl shadow-sm border border-white/30 hover:bg-white/50 transition-colors">
                      <span className="font-extrabold text-lg">Total Revenue</span>
                      <span className="font-black text-2xl text-[#0f172a]">${stats.total_revenue?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl border border-white/20 hover:bg-white/30 transition-colors">
                      <span className="font-bold">Total Processed Orders</span>
                      <span className="font-black text-lg">{stats.total_orders}</span>
                    </div>

                    <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl border border-white/20 hover:bg-white/30 transition-colors">
                      <span className="font-bold">Average Order Value</span>
                      <span className="font-black text-lg">${stats.total_orders ? (stats.total_revenue / stats.total_orders).toFixed(2) : 0}</span>
                    </div>

                    <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl border border-white/20 hover:bg-white/30 transition-colors">
                      <span className="font-bold">Last 30 Days Growth</span>
                      <span className="font-black text-lg text-white bg-[#0f172a] px-3 py-1 rounded-full">+14.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Low Stock Product Details Modal */}
      <AnimatePresence>
        {selectedLowStockProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLowStockProduct(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] relative"
            >
              {/* Pentagonal Outer Box with shiny border effect */}
              <div 
                className="bg-gradient-to-br from-pink-500 via-pink-400 to-cyan-400 p-1.5 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
              >
                {/* Shiny Corner Effect Overlay */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-60 rotate-45 pointer-events-none animate-[pulse_3s_infinite]"></div>
                
                {/* Inner Content Area */}
                <div 
                   className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-8 h-full w-full flex flex-col gap-6 relative z-10 text-[#0f172a]"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
                >
                  <button onClick={() => setSelectedLowStockProduct(null)} className="absolute top-4 right-4 text-[#0f172a] hover:text-[#0f172a]/80 transition-colors bg-white/40 p-2 rounded-full backdrop-blur-sm">
                    <FiX size={20} />
                  </button>

                  <div className="flex items-center gap-5 border-b border-[#0f172a]/20 pb-5">
                    <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] text-[#0f172a]">
                      <FiAlertTriangle size={32} className="mt-1 text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black leading-none mb-1 text-[#0f172a]">Low Stock</h2>
                      <p className="text-sm font-bold text-[#0f172a]/80 uppercase tracking-widest">Product Details</p>
                    </div>
                  </div>

                  <div className="space-y-3 pb-2 text-[#0f172a]">
                    <div className="flex flex-col bg-white/30 p-4 rounded-xl shadow-sm border border-white/30">
                      <span className="font-bold opacity-70 text-sm">Product Name</span>
                      <span className="font-black text-xl text-[#0f172a] leading-tight mt-1">{selectedLowStockProduct.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl border border-white/20">
                      <span className="font-bold">SKU</span>
                      <span className="font-black text-lg font-mono">{selectedLowStockProduct.sku}</span>
                    </div>

                    <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl border border-white/20">
                      <span className="font-bold">Price</span>
                      <span className="font-black text-lg">${selectedLowStockProduct.price?.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center bg-[#0f172a]/10 p-4 rounded-xl border border-[#0f172a]/20">
                      <span className="font-bold text-[#0f172a]">Current Stock</span>
                      <span className="font-black text-2xl text-pink-600">{selectedLowStockProduct.quantity} Left</span>
                    </div>

                    <button className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-xl mt-2 hover:bg-[#1e293b] transition-colors shadow-lg">
                      Order Restock
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      <div className="md:col-span-3 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Products" value={stats.total_products} icon={<FiBox size={24} className="text-blue-400" />} gradient="from-blue-600 to-blue-900" color="#60a5fa" />
        <StatCard title="Total Customers" value={stats.total_customers} icon={<FiUsers size={24} className="text-indigo-400" />} gradient="from-indigo-600 to-indigo-900" color="#818cf8" />
        <StatCard title="Total Orders" value={stats.total_orders} icon={<FiShoppingCart size={24} className="text-purple-400" />} gradient="from-purple-600 to-purple-900" color="#c084fc" />
      </div>

      <div className="md:col-span-3 lg:col-span-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Chart Area (Spans 3 cols) */}
        <motion.div variants={item} className="lg:col-span-3 glass-card rounded-[2rem] p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white">Revenue Overview</h3>
            <select className="bg-[#1e293b]/80 border border-white/20 text-white font-bold text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 cursor-pointer hover:bg-[#1e293b] transition-all shadow-lg appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7rem_auto] bg-no-repeat bg-[position:right_0.8rem_center]">
              <option className="bg-[#0f172a] text-white font-bold py-2">Last 7 Days</option>
              <option className="bg-[#0f172a] text-white font-bold py-2">This Month</option>
              <option className="bg-[#0f172a] text-white font-bold py-2">This Year</option>
            </select>
          </div>
          
          <div className="flex-1 w-full flex items-end justify-center mt-auto">
            <CustomLineChart data={stats.revenue_chart_data || []} />
          </div>
        </motion.div>

        {/* Low Stock Alerts (Spans 2 cols) */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-[2rem] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                <FiAlertTriangle className="text-pink-600 text-sm" />
              </div>
              Low Stock Alerts
            </h3>
            <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold border border-white/10 text-white">
              {stats.low_stock_products.length} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stats.low_stock_products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/50">
                <FiBox size={48} className="mb-4" />
                <p>All stock levels look good!</p>
              </div>
            ) : (
              stats.low_stock_products.map((product) => (
                <div key={product.id} onClick={() => setSelectedLowStockProduct(product)} className="p-4 rounded-[1.25rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/50 transition-all flex justify-between items-center group cursor-pointer shadow-sm hover:shadow-lg">
                  <div>
                    <p className="font-bold text-white group-hover:text-pink-600 transition-colors">{product.name}</p>
                    <p className="text-xs text-white/80 font-bold font-mono mt-1">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-whitexl font-black text-pink-600 leading-none">{product.quantity}</p>
                    <p className="text-[10px] font-bold text-white/80 uppercase mt-1">Left</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
        {/* AI Recommendations (Spans 2 cols) */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-[2rem] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <FiActivity className="text-cyan-600 text-sm" />
              </div>
              AI Insights
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stats.recommendations && stats.recommendations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/50">
                <FiTrendingUp size={48} className="mb-4" />
                <p>More data needed for insights.</p>
              </div>
            ) : (
              stats.recommendations && stats.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-[1.25rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-3 shadow-sm">
                  <div className="mt-1">
                    <FiTrendingUp className="text-cyan-600" />
                  </div>
                  <p className="text-sm text-white font-bold leading-relaxed">{rec}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
