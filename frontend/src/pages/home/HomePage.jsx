import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { MdCalendarToday, MdCheckCircle } from "react-icons/md";
import { BsDoorOpen } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";

export default function HomePage() {
  const navigate = useNavigate();

  // 📡 1. FETCH DATA: Mengambil seluruh daftar rapat
  const { data: meetings = [], isLoading: isLoadingMeetings } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const response = await axios.get('/api/meetings');
      return response.data.meetings || response.data || [];
    }
  });

  // 📡 2. FETCH DATA: Mengambil seluruh daftar ruangan beserta status ketersediaannya
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await axios.get('/api/rooms');
      return response.data.rooms || response.data || [];
    }
  });

  // 🗓️ HELPER ZONA WAKTU: Ambil tanggal hari ini dalam format YYYY-MM-DD Lokal (WIB)
  const todayString = new Date().toLocaleDateString('en-CA');

  // 📊 KALKULASI DINAMIS: Filter Rapat Hari Ini
  const todaysMeetings = meetings.filter(m => {
    if (!m.date) return false;
    const meetingDateString = new Date(m.date).toLocaleDateString('en-CA');
    return meetingDateString === todayString;
  });

  // 📊 KALKULASI DINAMIS: Stat Ruangan Terpakai
  const occupiedRoomsCount = rooms.filter(r => r.status === 'Sibuk').length;
  const totalRoomsCount = rooms.length;

  // 📊 KALKULASI DINAMIS: Rapat Selesai Hari Ini
  const completedMeetingsToday = todaysMeetings.filter(m => m.status === 'completed').length;
  const completionRate = todaysMeetings.length > 0 
    ? Math.round((completedMeetingsToday / todaysMeetings.length) * 100) 
    : 0;

  // 📇 DATA KARTU STATISTIK DINAMIS
  const stats = [
    { 
      id: 1, 
      label: "Rapat Hari Ini", 
      value: `${todaysMeetings.length} Rapat`, 
      icon: MdCalendarToday, 
      color: "text-brand bg-brand/10" 
    },
    { 
      id: 2, 
      label: "Okupansi Ruangan", 
      value: `${occupiedRoomsCount} / ${totalRoomsCount} Terpakai`, 
      icon: BsDoorOpen, 
      color: "text-amber-600 bg-amber-50" 
    },
    { 
      id: 3, 
      label: "Penyelesaian Hari Ini", 
      value: `${completionRate}%`, 
      icon: MdCheckCircle, 
      color: "text-emerald-600 bg-emerald-50" 
    },
  ];

  // 🛠️ HELPER FORMAT STATUS BADGE
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Selesai', style: 'bg-emerald-100 text-emerald-700' };
      case 'ongoing':
        return { label: 'Berlangsung', style: 'bg-amber-100 text-amber-700 font-bold animate-pulse' };
      case 'canceled':
      case 'cancelled':
        return { label: 'Dibatalkan', style: 'bg-rose-100 text-rose-700' };
      default:
        return { label: 'Mendatang', style: 'bg-indigo-100 text-brand' };
    }
  };

  const isLoading = isLoadingMeetings || isLoadingRooms;

  return (
    <div className="space-y-8">
      
      {/* 🟢 BARIS 1: Stats Cards (3 Kolom Sejajar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {isLoading ? <span className="text-slate-300 text-lg animate-pulse">Memuat...</span> : stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔵 BARIS 2: Konten Utama (Grid Pecah Dua: 70% vs 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Jadwal Rapat Hari Ini (Lebih Dominan) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Agenda Rapat Hari Ini</h3>
            <span 
              onClick={() => navigate('/meetings')}
              className="text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              Lihat Semua
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-medium">
                Menyinkronkan jadwal hari ini...
              </div>
            ) : todaysMeetings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                Tidak ada agenda rapat yang dijadwalkan untuk hari ini.
              </div>
            ) : (
              todaysMeetings.map((meeting) => {
                const badge = getStatusBadge(meeting.status);
                const timeFormatted = `${meeting.start_time?.substring(0, 5)} - ${meeting.end_time?.substring(0, 5)} WIB`;
                const locationText = meeting.room_name ? meeting.room_name : (meeting.online_link ? 'Online (Virtual)' : 'Lokasi Belum Ditentukan');

                return (
                  <div key={meeting.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-brand/30 transition-all duration-150">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">MEE{String(meeting.id).padStart(2, '0')}</span>
                      <h4 className="text-sm font-semibold text-slate-800">{meeting.title}</h4>
                      <p className="text-xs text-slate-500">{locationText} • <span className="text-brand font-medium">{timeFormatted}</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Status Ketersediaan Ruangan Cepat */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Okupansi Ruangan</h3>
              <span 
                onClick={() => navigate('/rooms')}
                className="text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                Detail
              </span>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse font-medium">
                  Memeriksa ruangan...
                </div>
              ) : rooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  Belum ada data ruangan.
                </div>
              ) : (
                rooms.map((room) => {
                  const isOccupied = room.status === 'Sibuk';
                  return (
                    <div key={room.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-none">
                      <span className="text-sm font-medium text-slate-700">{room.name}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        isOccupied ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}></span> 
                        {room.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}