import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast.jsx'; // 🔥 Import komponen UI pendukung

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'brand' });

  // Fungsi pemicu dari halaman manapun
  const showToast = useCallback((message, type = 'brand') => {
    setToast({ isOpen: true, message, type });
  }, []);

  // Fungsi menutup data state
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 🥞 MENGUNCI RENDER KOMPONEN TOAST DI LEVEL GLOBAL */}
      <Toast 
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        duration={3000} // Konfigurasi durasi tayang terpusat di sini
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return context;
}