import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSearch, FiX, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, deleteCustomer, getCustomerIntelligence } from '../services/api';
import { FiUser, FiCheckCircle } from 'react-icons/fi';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: ''
  });

  const [insightData, setInsightData] = useState(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    setFormData({ full_name: '', email: '', phone_number: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(formData);
      toast.success('Customer added successfully');
      closeModal();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? All their orders will be kept but disassociated if cascade is off (Note: our backend deletes cascade for items but keeps orders if customer deleted based on relation, wait, foreign key constraint might block it unless handled). Proceed?')) {
      try {
        await deleteCustomer(id);
        toast.success('Customer deleted');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer. They might have existing orders.');
      }
    }
  };

  const fetchInsights = async (customer) => {
    try {
      const { data } = await getCustomerIntelligence(customer.id);
      setInsightData({ ...data, ...customer });
      setIsInsightModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch customer details');
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-80 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 transition-all shadow-inner placeholder-white/50"
          />
        </div>
        <button onClick={openModal} className="btn-primary">
          <FiPlus /> Add Customer
        </button>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white font-bold text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-extrabold">Full Name</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-secondary">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-white/50">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {(customer.full_name || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      {customer.full_name || 'Unknown User'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="flex items-center gap-2 text-white/60"><FiMail size={14}/> {customer.email}</span>
                        <span className="flex items-center gap-2 text-white/60"><FiPhone size={14}/> {customer.phone_number}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => fetchInsights(customer)} className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Details">
                          <FiUser size={18} />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="p-2 text-white/60 hover:text-pink-500 transition-colors rounded-lg hover:bg-white/5" title="Delete">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] relative"
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
                  <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-[#0f172a] hover:text-[#0f172a]/80 transition-colors bg-white/40 p-2 rounded-full backdrop-blur-sm">
                    <FiX size={20} />
                  </button>
                  
                  <div className="flex items-center gap-4 border-b border-[#0f172a]/20 pb-4">
                    <div className="w-12 h-12 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[2px] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] text-[#0f172a]">
                      <FiUser size={24} className="mt-0.5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black leading-none mb-1 text-[#0f172a]">Add New Customer</h2>
                      <p className="text-xs font-bold text-[#0f172a]/80 uppercase tracking-widest">Client Registration</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0f172a]/80 mb-1">Full Name</label>
                      <input required type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm placeholder-[#0f172a]/40" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f172a]/80 mb-1">Email Address</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm placeholder-[#0f172a]/40" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f172a]/80 mb-1">Phone Number</label>
                      <input required type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm placeholder-[#0f172a]/40" placeholder="+1 (555) 000-0000" />
                    </div>
                    
                    <div className="pt-4 flex gap-4">
                      <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border-2 border-[#0f172a]/30 text-[#0f172a] font-black hover:bg-[#0f172a]/10 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="flex-1 bg-[#0f172a] text-white py-3 rounded-xl font-black shadow-lg hover:shadow-[0_0_20px_rgba(15,23,42,0.4)] transition-all flex items-center justify-center gap-2">
                        <FiCheckCircle size={18} />
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInsightModalOpen && insightData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsInsightModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] relative"
            >
              <div 
                className="bg-gradient-to-br from-pink-500 via-pink-400 to-cyan-400 p-1.5 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
              >
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-60 rotate-45 pointer-events-none animate-[pulse_3s_infinite]"></div>
                
                <div 
                   className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-8 h-full w-full flex flex-col gap-6 relative z-10 text-[#0f172a] max-h-[90vh] overflow-y-auto"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
                >
                  <button onClick={() => setIsInsightModalOpen(false)} className="absolute top-4 right-4 text-[#0f172a] hover:text-[#0f172a]/80 transition-colors bg-white/40 p-2 rounded-full backdrop-blur-sm">
                    <FiX size={20} />
                  </button>
                  
                  <div className="flex items-center gap-5 border-b border-[#0f172a]/20 pb-5">
                    <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] text-[#0f172a]">
                      <FiUser size={32} className="mt-1" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black leading-none mb-1 text-[#0f172a]">Customer Details</h2>
                      <p className="text-sm font-bold text-[#0f172a]/80 uppercase tracking-widest">{insightData.full_name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60">
                        <span className="text-[#0f172a]/70 font-bold text-xs uppercase tracking-wider block mb-1">Email</span>
                        <span className="font-black text-[#0f172a] break-all text-sm">{insightData.email || 'N/A'}</span>
                      </div>
                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60">
                        <span className="text-[#0f172a]/70 font-bold text-xs uppercase tracking-wider block mb-1">Phone</span>
                        <span className="font-black text-[#0f172a] text-sm">{insightData.phone_number || 'N/A'}</span>
                      </div>
                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60">
                        <span className="text-[#0f172a]/70 font-bold text-xs uppercase tracking-wider block mb-1">Joined</span>
                        <span className="font-black text-[#0f172a] text-sm">{insightData.created_at ? new Date(insightData.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60">
                        <span className="text-[#0f172a]/70 font-bold text-xs uppercase tracking-wider block mb-1">Orders</span>
                        <span className="font-black text-[#0f172a] text-sm">{insightData.order_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/20 p-5 rounded-xl border border-white/40 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[#0f172a]/80 font-bold uppercase tracking-wider text-sm block">Lifetime Value</span>
                        <span className="text-3xl font-black text-[#0f172a]">${insightData.lifetime_value?.toFixed(2) || '0.00'}</span>
                      </div>
                      
                      <div>
                        <span className="text-[#0f172a]/80 font-bold uppercase tracking-wider text-xs block mb-2 flex justify-between">
                          <span>Account Health</span>
                          <span>{((1 - (insightData.churn_risk || 0)) * 100).toFixed(0)}%</span>
                        </span>
                        <div className="w-full bg-white/40 rounded-full h-4 border border-white/60 p-0.5">
                          <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 h-full rounded-full" style={{ width: `${(1 - (insightData.churn_risk || 0)) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
