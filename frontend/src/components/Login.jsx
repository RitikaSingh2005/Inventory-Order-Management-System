import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';

const Login = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');

  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', loginEmail);
      formData.append('password', loginPassword);
      
      const response = await api.post('/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      login(response.data);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setLoginError(`Network Error: Cannot connect to ${api.defaults.baseURL}`);
      } else {
        setLoginError('Invalid login credentials');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    try {
      await api.post('/register', {
        email: regEmail,
        password: regPassword,
        role: 'Admin', // Demo purposes
        is_active: true
      });
      setRegSuccess('Account created! You can now log in.');
      setRegEmail('');
      setRegPassword('');
    } catch (err) {
      if (!err.response) {
        setRegError(`Network Error: Cannot connect to ${api.defaults.baseURL}`);
      } else {
        setRegError(err.response?.data?.detail || 'Registration failed');
      }
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center relative overflow-hidden bg-[#020617]">
      {/* Animated Colorful Background for Login Page */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(236,72,153,0.3)_360deg)] opacity-50 blur-3xl" 
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/40 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/40 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/40 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="z-10 flex flex-col md:flex-row gap-8 items-center bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.1)] max-w-5xl w-[95%]"
      >
        {/* Left Side: Pentagonal Login Box */}
        <div className="flex-1 w-full drop-shadow-[0_0_35px_rgba(236,72,153,0.6)]">
          <div 
            className="bg-gradient-to-br from-pink-500 via-pink-400 to-cyan-400 p-1.5 relative overflow-hidden"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
          >
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-60 rotate-45 pointer-events-none animate-[pulse_3s_infinite]"></div>
            
            <div 
              className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-10 h-full w-full flex flex-col items-center justify-center relative z-10 text-[#0f172a]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
            >
              <h2 className="text-4xl font-black mb-8 text-[#0f172a] tracking-tight">Sign In</h2>
              
              <form onSubmit={handleLoginSubmit} className="w-full max-w-xs space-y-5 z-10">
                <div>
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-white/40 border-2 border-white/60 rounded-xl px-6 py-3 text-[#0f172a] placeholder-[#0f172a]/60 font-bold focus:outline-none focus:border-[#1e3a8a] transition-colors shadow-inner"
                    required 
                  />
                </div>
                <div>
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white/40 border-2 border-white/60 rounded-xl px-6 py-3 text-[#0f172a] placeholder-[#0f172a]/60 font-bold focus:outline-none focus:border-[#1e3a8a] transition-colors shadow-inner"
                    required 
                  />
                </div>
                {loginError && <div className="text-red-700 bg-red-100/50 p-2 rounded-lg text-sm text-center font-bold">{loginError}</div>}
                <button type="submit" className="w-full py-4 rounded-xl bg-[#0f172a] text-white font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl hover:bg-black mt-4">
                  Access Dashboard
                </button>
              </form>
              <p className="mt-6 text-sm font-bold text-[#1e3a8a] z-10">Demo: admin@shopverse.com / admin</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:flex h-64 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-4"></div>

        {/* Right Side: Pentagonal Register Box */}
        <div className="flex-1 w-full drop-shadow-[0_0_35px_rgba(236,72,153,0.6)]">
          <div 
            className="bg-gradient-to-br from-pink-500 via-pink-400 to-cyan-400 p-1.5 relative overflow-hidden"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
          >
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-60 rotate-45 pointer-events-none animate-[pulse_4s_infinite]"></div>
            
            <div 
              className="bg-gradient-to-br from-pink-400 via-pink-300 to-cyan-300 p-10 h-full w-full flex flex-col items-center justify-center relative z-10 text-[#0f172a]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
            >
              <h2 className="text-4xl font-black mb-8 text-[#0f172a] tracking-tight">Create Account</h2>
              
              <form onSubmit={handleRegisterSubmit} className="w-full max-w-xs space-y-5 z-10">
                <div>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-white/40 border-2 border-white/60 rounded-xl px-6 py-3 text-[#0f172a] placeholder-[#0f172a]/60 font-bold focus:outline-none focus:border-[#1e3a8a] transition-colors shadow-inner"
                    required 
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-white/40 border-2 border-white/60 rounded-xl px-6 py-3 text-[#0f172a] placeholder-[#0f172a]/60 font-bold focus:outline-none focus:border-[#1e3a8a] transition-colors shadow-inner"
                    required 
                  />
                </div>
                <div>
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-white/40 border-2 border-white/60 rounded-xl px-6 py-3 text-[#0f172a] placeholder-[#0f172a]/60 font-bold focus:outline-none focus:border-[#1e3a8a] transition-colors shadow-inner"
                    required 
                  />
                </div>
                {regSuccess && <div className="text-green-800 bg-green-200/60 p-2 rounded-lg text-sm text-center font-bold">{regSuccess}</div>}
                {regError && <div className="text-red-700 bg-red-100/50 p-2 rounded-lg text-sm text-center font-bold">{regError}</div>}
                
                <button type="submit" className="w-full py-4 rounded-xl bg-[#0f172a] text-white font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl hover:bg-black mt-4">
                  Register Admin
                </button>
              </form>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
