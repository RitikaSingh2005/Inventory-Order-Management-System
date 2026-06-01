import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSearch, FiX, FiEye, FiTruck, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers, updateOrderStatus } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Create Order Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  
  // View Order Modal state
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
      setCustomersList(custRes.data);
      setProductsList(prodRes.data);
      setSelectedCustomerId('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Failed to load required data for creating order');
    }
  };

  const closeCreateModal = () => setIsModalOpen(false);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const items = [...orderItems];
    items.splice(index, 1);
    setOrderItems(items);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...orderItems];
    items[index][field] = value;
    setOrderItems(items);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = productsList.find(p => p.id === parseInt(item.product_id));
      if (product) {
        return sum + (product.price * (parseInt(item.quantity) || 0));
      }
      return sum;
    }, 0).toFixed(2);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return toast.error('Select a customer');
    
    const validItems = orderItems.filter(item => item.product_id && item.quantity > 0).map(item => ({
      product_id: parseInt(item.product_id),
      quantity: parseInt(item.quantity)
    }));

    if (validItems.length === 0) return toast.error('Add at least one valid product');

    try {
      await createOrder({
        customer_id: parseInt(selectedCustomerId),
        items: validItems
      });
      toast.success('Order created successfully');
      closeCreateModal();
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order. Check stock availability.');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      try {
        await deleteOrder(id);
        toast.success('Order cancelled and stock restored');
        fetchOrders();
      } catch (error) {
        toast.error('Failed to delete order');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(search) || 
    o.customer?.full_name?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-80 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/40 transition-all shadow-inner placeholder-white/50"
          />
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <FiPlus /> Create Order
        </button>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white font-bold text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-extrabold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Total Items</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
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
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-secondary">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-medium text-blue-400">#ORD-{order.id.toString().padStart(4, '0')}</td>
                    <td className="p-4 font-medium">{order.customer?.full_name || 'Deleted Customer'}</td>
                    <td className="p-4 text-white/60">{(order.items || []).reduce((sum, item) => sum + item.quantity, 0)} units</td>
                    <td className="p-4 font-bold text-white">${(order.total_amount || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`bg-black/30 border border-white/10 text-xs rounded-xl px-2 py-1 focus:outline-none ${
                          order.status === 'Delivered' ? 'text-green-400' : 
                          order.status === 'Cancelled' ? 'text-red-400' : 'text-blue-400'
                        }`}
                      >
                        <option value="Created" className="text-white">Created</option>
                        <option value="Confirmed" className="text-white">Confirmed</option>
                        <option value="Packed" className="text-white">Packed</option>
                        <option value="Shipped" className="text-white">Shipped</option>
                        <option value="Out For Delivery" className="text-white">Out For Delivery</option>
                        <option value="Delivered" className="text-white">Delivered</option>
                        <option value="Cancelled" className="text-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="p-2 text-white/60 hover:text-green-600 transition-colors rounded-lg hover:bg-white/5" title="Mark Shipped">
                          <FiTruck size={18} />
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="p-2 text-white/60 hover:text-blue-600 transition-colors rounded-lg hover:bg-white/5" title="Mark Delivered">
                          <FiCheckCircle size={18} />
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeCreateModal}>
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
                   className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-8 h-full w-full flex flex-col gap-6 relative z-10 text-[#0f172a] max-h-[90vh] overflow-y-auto"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
                >
                  <button type="button" onClick={closeCreateModal} className="absolute top-4 right-4 text-[#0f172a] hover:text-[#0f172a]/80 transition-colors bg-white/40 p-2 rounded-full backdrop-blur-sm">
                    <FiX size={20} />
                  </button>
                  
                  <div className="flex items-center gap-5 border-b border-[#0f172a]/20 pb-5">
                    <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden border-[3px] border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] text-[#0f172a]">
                      <FiPlus size={32} className="mt-1" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black leading-none mb-1 text-[#0f172a]">Create New Order</h2>
                      <p className="text-sm font-bold text-[#0f172a]/80 uppercase tracking-widest">Add a new request</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmitOrder} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#0f172a]/80 mb-2">Select Customer</label>
                      <select 
                        required 
                        value={selectedCustomerId} 
                        onChange={(e) => setSelectedCustomerId(e.target.value)} 
                        className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-3 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm"
                      >
                        <option value="" disabled>-- Select a customer --</option>
                        {customersList.map(c => <option key={c.id} value={c.id} className="bg-white text-black font-medium">{c.full_name} ({c.email})</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-bold text-[#0f172a]/80">Order Items</label>
                        <button type="button" onClick={handleAddItem} className="text-sm text-[#0f172a] hover:bg-[#0f172a]/10 font-black flex items-center gap-1 transition-colors bg-white/40 px-4 py-1.5 rounded-lg border border-white/60">
                          <FiPlus /> Add Item
                        </button>
                      </div>
                      
                      <div className="space-y-3 bg-white/20 p-4 rounded-xl border border-white/40">
                        {orderItems.map((item, index) => (
                          <div key={index} className="flex gap-4 items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-[#0f172a]/70 mb-1">Product</label>
                              <select 
                                required 
                                value={item.product_id} 
                                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)} 
                                className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm"
                              >
                                <option value="" disabled>Select product...</option>
                                {productsList.map(p => (
                                  <option key={p.id} value={p.id} disabled={p.quantity === 0} className="bg-white text-black font-medium">
                                    {p.name} - ${p.price} ({p.quantity} in stock)
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-24">
                              <label className="block text-xs font-bold text-[#0f172a]/70 mb-1">Qty</label>
                              <input 
                                required 
                                type="number" 
                                min="1" 
                                value={item.quantity} 
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                className="w-full bg-white/40 backdrop-blur-md border-2 border-white/60 rounded-xl px-4 py-2.5 text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#0f172a] transition-colors shadow-sm"
                              />
                            </div>
                            {orderItems.length > 1 && (
                              <button type="button" onClick={() => handleRemoveItem(index)} className="p-3 text-red-600 hover:bg-red-500/20 rounded-xl transition-colors mb-0.5 bg-white/40 border-2 border-transparent hover:border-red-500/20">
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#0f172a]/20 flex justify-between items-end">
                      <div>
                        <span className="text-[#0f172a]/80 font-bold text-sm uppercase tracking-wider">Est. Total</span>
                        <div className="text-4xl font-black text-[#0f172a] leading-none mt-1">${calculateTotal()}</div>
                      </div>
                      <div className="flex gap-4">
                        <button type="button" onClick={closeCreateModal} className="px-6 py-3 rounded-xl border-2 border-[#0f172a]/30 text-[#0f172a] font-black hover:bg-[#0f172a]/10 transition-colors">
                          Cancel
                        </button>
                        <button type="submit" className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-black shadow-lg hover:shadow-[0_0_20px_rgba(15,23,42,0.4)] transition-all flex items-center gap-2">
                          <FiCheckCircle size={18} />
                          Process Order
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewOrder(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg glass-card p-8 rounded-[2rem] shadow-2xl relative border border-white/40 text-white"
            >
              <button onClick={() => setViewOrder(null)} className="absolute top-6 right-6 text-pink-500 hover:text-white hover:bg-red-500/80 p-1.5 rounded-full transition-colors bg-white/20 backdrop-blur-sm shadow-sm">
                <FiX size={20} />
              </button>
              
              <div className="flex items-center gap-5 border-b border-white/10 pb-5 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-500 flex items-center justify-center shadow-lg text-white">
                  <FiEye size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black leading-none mb-1 text-white">Order Summary</h2>
                  <p className="text-sm font-bold text-white/80 uppercase tracking-widest">#ORD-{viewOrder.id.toString().padStart(4, '0')}</p>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                <div>
                  <h4 className="text-xs uppercase text-white/80 font-black mb-2 tracking-wider">Customer Info</h4>
                  <div className="bg-white/5 rounded-xl p-4 shadow-sm border border-white/10">
                    <p className="font-extrabold text-lg text-white">{viewOrder.customer.full_name}</p>
                    <p className="font-bold text-white/80 text-sm">{viewOrder.customer.email}</p>
                    <p className="font-bold text-white/80 text-sm">{viewOrder.customer.phone_number}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase text-white/80 font-black mb-2 tracking-wider">Order Items</h4>
                  <div className="space-y-2">
                    {viewOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
                        <div className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black text-white">
                            x{item.quantity}
                          </span>
                          <div>
                            <p className="font-bold text-sm text-white">{item.product.name}</p>
                            <p className="text-xs font-bold text-white/80">{item.product.sku}</p>
                          </div>
                        </div>
                        <p className="font-black text-white">${(item.unit_price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs uppercase font-black text-white/80">Total Amount</p>
                    <p className="text-xs font-bold text-white/60 mt-1">{new Date(viewOrder.created_at).toLocaleString()}</p>
                  </div>
                  <h3 className="text-3xl font-black text-white">
                    ${viewOrder.total_amount.toFixed(2)}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
