import React, { useEffect } from 'react';
import { createPortal } from 'react-dom'; // 🔥 Import createPortal
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export default function Toast({ isOpen, message, type = 'brand', onClose, duration = 3000 }) {
  
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/50',
      icon: <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
      closeHover: 'hover:bg-emerald-100 text-emerald-500'
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100/50',
      icon: <FiAlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
      closeHover: 'hover:bg-rose-100 text-rose-500'
    },
    brand: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-indigo-100/50',
      icon: <FiInfo className="w-4 h-4 text-brand shrink-0 mt-0.5" />,
      closeHover: 'hover:bg-indigo-100 text-brand'
    }
  };

  const currentStyle = styles[type] || styles.brand;

  // 🔥 Bungkus return HTML menggunakan createPortal agar dilempar langsung ke document.body
  return createPortal(
    /* 🌐 CONTAINER 1: Menjamin posisi horizontal mutlak di luar gangguan layout flexbox */
    <div className="fixed top-5 left-0 right-0 z-[9999] flex justify-center p-4 pointer-events-none animate-slideDown">
      
      {/* 📦 CONTAINER 2: Fisik Box Toast */}
      <div className={`w-full max-w-xs bg-white border border-l-4 rounded-xl shadow-xl flex items-start gap-3 p-4 pointer-events-auto ${
        type === 'success' ? 'border-l-emerald-500' : type === 'error' ? 'border-l-rose-500' : 'border-l-brand'
      } ${currentStyle.bg}`}>
        
        {currentStyle.icon}
        
        <div className="flex-1">
          <p className="text-xs font-semibold leading-relaxed">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors cursor-pointer -mt-1 -mr-1 ${currentStyle.closeHover}`}
        >
          <FiX className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>,
    document.body // 🔥 Target injeksi Portal
  );
}