import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Splash from './components/Splash';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';



function App() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  const handleSplashComplete = () => {
    setShowSplash(false);
    navigate('/');
  };

  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        className: 'bg-black/50 backdrop-blur-xl text-primary border border-white/10 shadow-2xl rounded-2xl',
      }} />
      
      <Routes>
        <Route path="/*" element={
          <div className="flex h-screen bg-[#020617] overflow-hidden text-primary relative p-4 md:p-6 lg:p-8">
            {/* Vibrant Creative Animated Mesh Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(at_center,rgba(236,72,153,0.25),transparent_20%,rgba(59,130,246,0.15)_40%,transparent_60%,rgba(239,68,68,0.15)_80%,transparent)] animate-[spin_60s_linear_infinite] blur-2xl"></div>
              
              {/* Bright Glowing Orbs */}
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/40 blur-[120px] mix-blend-screen animate-blob"></div>
              <div className="absolute top-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-500/30 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-[-10%] left-[20%] w-[55%] h-[55%] rounded-full bg-purple-500/30 blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
              <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-red-500/30 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
              <div className="absolute top-[40%] left-[40%] w-[35%] h-[35%] rounded-full bg-rose-500/30 blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating App Container */}
            <div className="flex-1 flex overflow-hidden rounded-[2.5rem] bg-black/20 backdrop-blur-3xl border border-white/10 shadow-2xl relative z-10 ring-1 ring-white/5">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8 scroll-smooth">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/orders" element={<Orders />} />
                  </Routes>
                </main>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
