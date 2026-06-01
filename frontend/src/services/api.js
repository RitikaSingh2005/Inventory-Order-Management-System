import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

// Products
export const getProducts = () => api.get('/products/');
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Customers
export const getCustomers = () => api.get('/customers/');
export const createCustomer = (data) => api.post('/customers/', data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Orders
export const getOrders = () => api.get('/orders/');
export const createOrder = (data) => api.post('/orders/', data);
export const getOrder = (id) => api.get(`/orders/${id}`);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Dashboard
export const getDashboard = () => api.get('/analytics/dashboard');
export const getForecast = () => api.get('/analytics/forecast');
export const getCustomerIntelligence = (id) => api.get(`/analytics/customer-intelligence/${id}`);

export default api;
