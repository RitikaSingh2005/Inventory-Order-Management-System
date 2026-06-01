import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiBox, FiLink, FiStar, FiShoppingBag, FiActivity, FiTag, FiGift, FiCircle, FiPackage } from 'react-icons/fi';

const Splash = ({ onComplete }) => {
  const text = "Welcome to ShopVerse";
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.substring(0, i));
        i++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 120);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const colors = [
    "bg-pink-500", "bg-cyan-400", "bg-pink-600", 
    "bg-blue-400", "bg-fuchsia-500", "bg-cyan-500", 
    "bg-purple-500", "bg-rose-400", "bg-indigo-400"
  ];

  const orbs = useMemo(() => {
    // Generate static random values so they don't change on re-renders
    return colors.map((color) => ({
      color,
      size: Math.random() * 400 + 200,
      x: [Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400],
      y: [Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400],
      duration: Math.random() * 10 + 15
    }));
  }, []);

  const floatingObjects = useMemo(() => {
    const icons = [FiShoppingCart, FiBox, FiLink, FiStar, FiShoppingBag, FiActivity, FiTag, FiGift, FiCircle, FiPackage];
    const objectColors = ['text-pink-400', 'text-cyan-400', 'text-blue-400', 'text-purple-400', 'text-yellow-400', 'text-rose-400', 'text-indigo-400'];
    
    return Array.from({ length: 25 }).map((_, i) => ({
      Icon: icons[i % icons.length],
      color: objectColors[i % objectColors.length],
      size: Math.random() * 50 + 30, // 30 to 80
      left: `${Math.random() * 90}vw`,
      top: `${Math.random() * 90}vh`,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      rotate: Math.random() * 360
    }));
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#020617] overflow-hidden flex flex-col items-center justify-center">
      {/* 9 Colorful Glowing Orbs */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full mix-blend-screen blur-[100px] opacity-50 ${orb.color}`}
          style={{ width: orb.size, height: orb.size }}
          animate={{
            x: orb.x,
            y: orb.y,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      ))}

      {/* 3D Floating Objects */}
      {floatingObjects.map((obj, i) => {
        const { Icon } = obj;
        return (
          <motion.div
            key={`obj-${i}`}
            className={`absolute ${obj.color} flex items-center justify-center drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)]`}
            style={{ left: obj.left, top: obj.top, width: obj.size * 1.5, height: obj.size * 1.5 }}
            initial={{ y: 0, rotate: obj.rotate, scale: 0 }}
            animate={{ 
              y: [0, -150, 0], 
              rotate: [obj.rotate, obj.rotate + 180, obj.rotate + 360],
              scale: 1
            }}
            transition={{
              y: { duration: obj.duration, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: obj.duration * 1.5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, delay: obj.delay }
            }}
          >
            <div className="absolute inset-0 rounded-full border-[3px] border-current opacity-60 shadow-[0_0_25px_currentColor]"></div>
            <Icon size={obj.size} className="filter drop-shadow-[0_0_20px_currentColor] relative z-10" />
          </motion.div>
        );
      })}

      {/* Glass Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 glass-panel p-10 md:p-16 rounded-[3rem] border border-white/10 flex flex-col items-center shadow-[0_0_80px_rgba(255,255,255,0.05)] backdrop-blur-3xl text-center max-w-5xl w-[90%]"
      >
        <div className="h-40 flex items-center justify-center px-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-cyan-400 to-pink-500 drop-shadow-[0_0_40px_rgba(236,72,153,0.9)] tracking-tighter leading-tight filter saturate-150 contrast-125">
            {displayedText}
            <motion.span 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="inline-block w-2 md:w-3 h-[0.9em] bg-cyan-300 ml-3 align-middle shadow-[0_0_20px_#67e8f9]"
            />
          </h1>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isTypingComplete ? 1 : 0, y: isTypingComplete ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12"
        >
          <button 
            onClick={onComplete}
            className="group relative px-10 py-4 rounded-full bg-white/5 border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 text-white font-bold text-xl tracking-wide flex items-center gap-3">
              Enter ShopVerse 
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Splash;
