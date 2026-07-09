import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🔥 Gunakan hooks router
import { FiSearch } from 'react-icons/fi';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🗺️ Pemetaan path URL ke teks nama halaman yang bersih untuk breadcrumbs
  const getPageContext = () => {
    switch (location.pathname) {
      case '/home': 
        return { label: 'Home', raw: 'home' };
      case '/meetings': 
        return { label: 'Meeting', raw: 'meetings' };
      case '/users': 
        return { label: 'User', raw: 'users' };
      case '/users/create': 
        return { label: 'User / Create', raw: 'users/create' };
      case '/users/edit/:id': 
        return { label: 'User / Edit', raw: 'users/edit/:id' };
      case '/divisions': 
        return { label: 'Division', raw: 'divisions' };
      case '/rooms': 
        return { label: 'Room', raw: 'rooms' };
      case '/notifications': 
        return { label: 'Notifications', raw: 'notifications' };
      case '/settings': 
        return { label: 'Settings', raw: 'settings' };
      default: 
        return { label: 'Dashboard', raw: 'home' };
    }
  };

  const context = getPageContext();

  return (
    <header className="h-[75px] w-full bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 select-none">
      
      {/* 🧭 Remah Roti (Breadcrumbs) Dinamis */}
      <div className="flex items-center gap-2 text-sm">
        <span 
          onClick={() => navigate('/home')}
          className="text-slate-400 font-medium hover:text-slate-600 cursor-pointer transition-colors"
        >
          Dashboard
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold capitalize">
          {context.label}
        </span>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Search Input Bar */}
        <div className="relative hidden md:block w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari rapat atau ruangan..." 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-brand focus:bg-white transition-all"
          />
        </div>

        {/* Info Penunjuk Waktu Real-time */}
        <div className="text-right hidden sm:block border-l border-slate-200 pl-6">
          <p className="text-xs font-semibold text-slate-800">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            Sistem Kelola Rapat Internal
          </p>
        </div>

      </div>

    </header>
  );
}