import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSearch, FiEdit2, FiX, FiBox, FiActivity, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct, getForecast } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [forecastData, setForecastData] = useState(null);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', price: '', quantity: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await createProduct(payload);
        toast.success('Product created successfully');
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleViewForecast = async () => {
    try {
      const { data } = await getForecast();
      setForecastData(data);
      setIsForecastModalOpen(true);
    } catch (error) {
      toast.error('Failed to fetch forecast');
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (qty) => {
    let colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    let width = '20%';
    let label = 'Low Stock';
    let labelColor = 'text-red-400';
    
    if (qty > 40) {
      colorClass = 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]';
      width = '100%';
      label = 'Full Stock';
      labelColor = 'text-green-400';
    } else if (qty > 15) {
      colorClass = 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]';
      width = '60%';
      label = 'Average';
      labelColor = 'text-yellow-400';
    } else if (qty === 0) {
      colorClass = 'bg-gray-600';
      width = '0%';
      label = 'Out of Stock';
      labelColor = 'text-gray-400';
    }

    return (
      <div className="flex flex-col gap-1.5 w-28">
        <span className={`text-[10px] uppercase font-bold tracking-wider ${labelColor}`}>{label} ({qty})</span>
        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div className={`h-full ${colorClass} rounded-full transition-all duration-700`} style={{ width }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-80 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 transition-all shadow-inner placeholder-white/50"
          />
        </div>
        <div className="flex gap-4">
          <button onClick={handleViewForecast} className="px-6 py-2 rounded-lg border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2">
            <FiActivity /> AI Forecast
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white font-bold text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-extrabold">SKU</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Quantity</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-secondary">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-white/50">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold">{product.sku}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-[#3b82f6] flex items-center justify-center text-white shadow-md">
                          <FiBox size={20} />
                        </div>
                        <span className="font-bold">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4">${(product.price || 0).toFixed(2)}</td>
                    <td className="p-4">{product.quantity}</td>
                    <td className="p-4">{getStatusBadge(product.quantity)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(product)} className="p-2 text-white/50 hover:text-white/80 transition-colors rounded-lg hover:bg-white/20" title="Edit">
                          <FiEdit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-white/50 hover:text-pink-500 transition-colors rounded-lg hover:bg-white/20" title="Delete">
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
                      <FiBox size={24} className="mt-0.5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black leading-none mb-1 text-[#0f172a]">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      <p className="text-xs font-bold text-[#0f172a]/80 uppercase tracking-widest">Inventory Management</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0f172a]/80 mb-1">Product Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm placeholder-[#0f172a]/40" placeholder="Enter product name" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0f172a]/80 mb-1">SKU</label>
                      <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold font-mono focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm placeholder-[#0f172a]/40 disabled:opacity-50" placeholder="PROD-001" disabled={!!editingProduct} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#0f172a]/80 mb-1">Price ($)</label>
                        <input required type="number" step="0.01" min="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm placeholder-[#0f172a]/40" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#0f172a]/80 mb-1">Quantity</label>
                        <input required type="number" min="0" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm placeholder-[#0f172a]/40" placeholder="0" />
                      </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                      <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border-2 border-[#0f172a]/30 text-[#0f172a] font-black hover:bg-[#0f172a]/10 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="flex-1 bg-[#0f172a] text-white py-3 rounded-xl font-black shadow-lg hover:shadow-[0_0_20px_rgba(15,23,42,0.4)] transition-all flex items-center justify-center gap-2">
                        <FiCheckCircle size={18} />
                        {editingProduct ? 'Update' : 'Create'}
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
        {isForecastModalOpen && forecastData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsForecastModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl drop-shadow-[0_0_35px_rgba(236,72,153,0.8)] relative"
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
                  <button onClick={() => setIsForecastModalOpen(false)} className="absolute top-4 right-4 text-[#0f172a] hover:text-[#0f172a]/80 transition-colors bg-white/40 p-2 rounded-full backdrop-blur-sm">
                    <FiX size={20} />
                  </button>
                  
                  <div className="flex items-center gap-5 border-b border-[#0f172a]/20 pb-5">
                    <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] text-[#0f172a]">
                      <FiActivity size={32} className="mt-1" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black leading-none mb-1 text-[#0f172a]">Demand Forecast</h2>
                      <p className="text-sm font-bold text-[#0f172a]/80 uppercase tracking-widest">AI Predictions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {forecastData.length === 0 ? (
                      <p className="text-[#0f172a]/60 text-center py-8 font-bold">Not enough data to generate forecast.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {forecastData.map(f => (
                          <div key={f.product_id} className="bg-white/40 backdrop-blur-md p-5 rounded-xl border border-white/60 hover:border-[#0f172a]/30 transition-colors shadow-sm">
                            <h4 className="font-black text-[#0f172a] mb-4 text-xl">{f.product_name}</h4>
                            <div className="space-y-3 text-sm font-bold">
                              <div className="flex justify-between items-center">
                                <span className="text-[#0f172a]/70 uppercase tracking-wider text-xs">Current Stock:</span>
                                <span className="font-mono text-[#0f172a] bg-white/50 px-2 py-0.5 rounded-md">{f.current_stock}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[#0f172a]/70 uppercase tracking-wider text-xs">Avg Daily Sales:</span>
                                <span className="font-mono text-[#0f172a]">{f.avg_daily_sales}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[#0f172a]/70 uppercase tracking-wider text-xs">Days Until Depletion:</span>
                                <span className={`font-mono font-black ${f.days_until_depletion < 7 ? 'text-red-600 bg-red-100/50' : 'text-green-700 bg-green-100/50'} px-2 py-0.5 rounded-md`}>
                                  {f.days_until_depletion === 9999 ? 'No Sales' : f.days_until_depletion}
                                </span>
                              </div>
                              <div className="mt-4 pt-4 border-t border-[#0f172a]/10 flex justify-between items-center">
                                <span className="text-[#0f172a]/80 font-black uppercase tracking-wider">Suggested Reorder:</span>
                                <span className="text-[#0f172a] font-black text-3xl leading-none">{f.suggested_reorder_qty}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default Products;
