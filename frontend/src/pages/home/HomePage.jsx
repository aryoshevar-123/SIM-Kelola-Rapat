import React from 'react';
import { MdCalendarToday, MdCheckCircle } from "react-icons/md";
import { BsDoorOpen } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";

export default function HomePage() {
  // Mock Data untuk simulasi tampilan Figma kamu
  const stats = [
    { id: 1, label: "Rapat Hari Ini", value: "8 Rapat", icon: MdCalendarToday, color: "text-brand bg-brand/10" },
    { id: 2, label: "Okupansi Ruangan", value: "4 / 6 Terpakai", icon: BsDoorOpen, color: "text-amber-600 bg-amber-50" },
    { id: 3, label: "Rata-rata Kehadiran", value: "94.2%", icon: FaUsers, color: "text-emerald-600 bg-emerald-50" },
  ];

  const todaysMeetings = [
    { id: "MEE01", title: "Sinkronisasi Tim Developer", room: "Ruang Sakura (Lt. 2)", time: "09:00 - 10:30 WIB", status: "Selesai" },
    { id: "MEE02", title: "Review Mingguan UI/UX Intern", room: "Ruang Kreatif (Lt. 1)", time: "13:00 - 14:30 WIB", status: "Mendatang" },
    { id: "MEE03", title: "Rapat Pleno Direksi Bulanan", room: "Aula Utama (Lt. 3)", time: "15:45 - 17:00 WIB", status: "Mendatang" },
  ];

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
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
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
            <span className="text-xs font-semibold text-brand hover:underline cursor-pointer">Lihat Semua</span>
          </div>

          <div className="space-y-3 flex-1">
            {todaysMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-brand/30 transition-all duration-150">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{meeting.id}</span>
                  <h4 className="text-sm font-semibold text-slate-800">{meeting.title}</h4>
                  <p className="text-xs text-slate-500">{meeting.room} • <span className="text-brand font-medium">{meeting.time}</span></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  meeting.status === "Selesai" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-brand"
                }`}>
                  {meeting.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Status Ketersediaan Ruangan Cepat */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 mb-4">Okupansi Ruangan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-700">Aula Utama</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Sibuk
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-700">Ruang Sakura</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Tersedia
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}