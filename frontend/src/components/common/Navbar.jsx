import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FiSearch, FiChevronRight, FiX, FiHome, 
  FiCalendar, FiLayers, FiMapPin 
} from 'react-icons/fi';

// 🗺️ Dictionary Pemetaan Nama Segmen URL ke Bahasa Manusia
const PATH_LABELS = {
  home: 'Home',
  meetings: 'Agenda Rapat',
  users: 'Manajemen User',
  divisions: 'Divisi Kerja',
  rooms: 'Ruangan Rapat',
  notifications: 'Pemberitahuan',
  settings: 'Pengaturan',
  create: 'Tambah Baru',
  edit: 'Edit Data',
  details: 'Rincian Detail'
};

// 🔒 Daftar Rute Induk yang Valid untuk Di-klik
const NAVIGABLE_ROOTS = ['home', 'meetings', 'users', 'divisions', 'rooms', 'notifications', 'settings'];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  // 📝 State Search & Dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // 🧭 1. DYNAMIC BREADCRUMB PARSER
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbLabel = (segment) => {
    if (!isNaN(segment)) {
      return `#${segment}`;
    }
    return PATH_LABELS[segment] || segment.replace(/-/g, ' ');
  };

  // 📡 2. FETCH DATA UNTUK AUTOCOMPLETE GLOBAL
  // Fetch Rapat
  const { data: meetings = [] } = useQuery({
    queryKey: ['searchMeetings'],
    queryFn: async () => {
      const res = await axios.get('/api/meetings');
      return res.data.meetings || res.data || [];
    }
  });

  // Fetch Divisi
  const { data: divisions = [] } = useQuery({
    queryKey: ['searchDivisions'],
    queryFn: async () => {
      const res = await axios.get('/api/divisions');
      return res.data.divisions || res.data || [];
    }
  });

  // Fetch Ruangan
  const { data: rooms = [] } = useQuery({
    queryKey: ['searchRooms'],
    queryFn: async () => {
      const res = await axios.get('/api/rooms');
      return res.data.rooms || res.data || [];
    }
  });

  // 🔍 3. LOGIKA FILTER DATA SECARA REAL-TIME
  const query = searchQuery.trim().toLowerCase();

  const filteredMeetings = query 
    ? meetings.filter(m => m.title?.toLowerCase().includes(query)) 
    : [];

  const filteredDivisions = query 
    ? divisions.filter(d => d.name?.toLowerCase().includes(query)) 
    : [];

  const filteredRooms = query 
    ? rooms.filter(r => r.name?.toLowerCase().includes(query)) 
    : [];

  const hasResults = filteredMeetings.length > 0 || filteredDivisions.length > 0 || filteredRooms.length > 0;

  // 🛡️ 4. OUTSIDE CLICK LISTENER (Tutup Dropdown Jika Klik Di Luar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎯 HANDLER KLIK ITEM DROPDOWN (Direct Redirection)
  const handleSelectResult = (targetUrl) => {
    setIsOpen(false);
    setSearchQuery('');
    navigate(targetUrl);
  };

  return (
    <header className="h-[75px] w-full bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 select-none">
      
      {/* 🧭 Remah Roti (Breadcrumbs) Dinamis */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs md:text-sm">
        <Link 
          to="/home" 
          className="flex items-center gap-1.5 text-slate-400 font-medium hover:text-brand transition-colors"
        >
          <FiHome className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const pathTo = '/' + pathSegments.slice(0, index + 1).join('/');
          const label = getBreadcrumbLabel(segment);

          if (segment === 'home' && index === 0) return null;

          const isClickable = !isLast && NAVIGABLE_ROOTS.includes(segment);

          return (
            <React.Fragment key={pathTo + index}>
              <FiChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              
              {isClickable ? (
                <Link
                  to={pathTo}
                  className="text-slate-500 font-medium hover:text-brand transition-colors capitalize truncate max-w-[120px] sm:max-w-none"
                >
                  {label}
                </Link>
              ) : (
                <span 
                  className={`capitalize truncate max-w-[150px] sm:max-w-none ${
                    isLast ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium cursor-default'
                  }`}
                >
                  {label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* 🎛️ SISI KANAN: LIVE SEARCH DROPDOWN + INFO WAKTU */}
      <div className="flex items-center gap-6">
        
        {/* 🔍 LIVE SEARCH INPUT CONTAINER */}
        <div ref={searchContainerRef} className="relative hidden md:block w-72 lg:w-80">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Cari rapat, divisi, atau ruangan..." 
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsOpen(false);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ⚡ DROPDOWN HASIL PENCARIAN BERSEKSI */}
          {isOpen && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto p-2 space-y-3">
              
              {!hasResults ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  Tidak ada hasil yang cocok dengan "<span className="text-slate-600 font-semibold">{searchQuery}</span>"
                </div>
              ) : (
                <>
                  {/* 🟢 SEKSI 1: RAPAT */}
                  {filteredMeetings.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <FiCalendar className="w-3 h-3 text-brand" />
                        <span>Rapat ({filteredMeetings.length})</span>
                      </div>
                      {filteredMeetings.slice(0, 5).map(meeting => (
                        <div
                          key={meeting.id}
                          onClick={() => handleSelectResult(`/meetings/details/${meeting.id}`)}
                          className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-brand truncate">
                              {meeting.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {meeting.date ? new Date(meeting.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''} 
                              {meeting.room_name ? ` • ${meeting.room_name}` : ''}
                            </p>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                            MEE{String(meeting.id).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🔵 SEKSI 2: DIVISI */}
                  {filteredDivisions.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <FiLayers className="w-3 h-3 text-amber-500" />
                        <span>Divisi ({filteredDivisions.length})</span>
                      </div>
                      {filteredDivisions.slice(0, 5).map(division => (
                        <div
                          key={division.id}
                          onClick={() => handleSelectResult(`/divisions/details/${division.id}`)}
                          className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-brand truncate">
                            {division.name}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {division.total_members ? `${division.total_members} Anggota` : 'Lihat Detail'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredRooms.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <FiMapPin className="w-3 h-3 text-emerald-500" />
                        <span>Ruangan ({filteredRooms.length})</span>
                      </div>
                      {filteredRooms.slice(0, 5).map(room => (
                        <div
                          key={room.id}
                          onClick={() => handleSelectResult(`/rooms/details/${room.id}`)}
                          className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-brand truncate">
                              {room.name}
                            </p>
                            <p className="text-[10px] text-slate-400">Kapasitas: {room.capacity} orang</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            room.status === 'Sibuk' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {room.status || 'Tersedia'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </>
              )}

            </div>
          )}
        </div>

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