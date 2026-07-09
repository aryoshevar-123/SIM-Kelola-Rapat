import React, { useState } from 'react';
import { FiCheckCircle, FiBell, FiTrash2 } from 'react-icons/fi';

export default function NotificationPage() {
  // Mock Data lengkap hasil JOIN database sesuai instruksimu
  const mockNotifications = [
    {
      id: 1,
      sender_name: "Aryo Sheva Ramadhani",
      sender_role: "Admin",
      type: "meeting",
      message: "Rapat 'Review Mingguan UI/UX Intern' telah dijadwalkan ulang ke tanggal 8 Juli 2026 pukul 13:00 WIB.",
      is_read: false, // 🟢 Belum dibaca (Warna Putih Terang + Border Brand)
      created_at: "10 Menit yang lalu"
    },
    {
      id: 2,
      sender_name: "Sistem Otomatis",
      sender_role: "System",
      type: "division",
      message: "Divisi baru 'Marketing & Branding' telah berhasil ditambahkan oleh Admin Utama.",
      is_read: false, // 🟢 Belum dibaca
      created_at: "1 Jam yang lalu"
    },
    {
      id: 3,
      sender_name: "Rania Amanda",
      sender_role: "Manager HRD",
      type: "user",
      message: "Pembaruan data massal akun karyawan magang gelombang 4 telah selesai diproses.",
      is_read: true, // 🔴 Sudah dibaca (Warna Redup/Gelap)
      created_at: "Kemarin, 14:20 WIB"
    },
    {
      id: 4,
      sender_name: "Aryo Sheva Ramadhani",
      sender_role: "Admin",
      type: "meeting",
      message: "Rapat 'Sinkronisasi Tim Developer' pada tanggal 2 Juli telah resmi dibatalkan.",
      is_read: true, // 🔴 Sudah dibaca
      created_at: "3 Hari yang lalu"
    }
  ];

  // Fungsi penentu label tipe notifikasi agar visualnya kaya
  const getTypeStyles = (type) => {
    switch (type) {
      case 'meeting':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'user':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'division':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Utility Header Page */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand/10 text-brand rounded-xl">
            <FiBell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pusat Pemberitahuan</h3>
            <p className="text-xs text-slate-400">Pantau seluruh riwayat aktivitas pembaruan sistem rapat</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/5 rounded-xl transition-colors border border-transparent cursor-pointer">
            <FiCheckCircle className="w-3.5 h-3.5" />
            Tandai Semua Dibaca
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer">
            <FiTrash2 className="w-3.5 h-3.5" />
            Bersihkan
          </button>
        </div>
      </div>

      {/* 🟢 KUMPULAN BUBBLE TEXT NOTIFIKASI */}
      <div className="space-y-4">
        {mockNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 shadow-2xs relative group ${
              notif.is_read
                ? "bg-slate-50 border-slate-200/60 opacity-80" // 🔴 Sudah dibaca: Agak redup/gelap
                : "bg-white border-brand/20 ring-1 ring-brand/5 shadow-xs" // 🟢 Belum dibaca: Putih terang mencolok
            }`}
          >
            {/* Indikator Titik Biru Menyala Khusus untuk yang belum dibaca */}
            {!notif.is_read && (
              <span className="absolute top-6 left-2.5 w-2 h-2 rounded-full bg-brand animate-pulse" />
            )}

            {/* Konten Kiri: Tipe Notifikasi */}
            <div className="shrink-0 pt-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${getTypeStyles(notif.type)}`}>
                {notif.type}
              </span>
            </div>

            {/* Konten Tengah: Info Pengirim & Pesan Solusi 2 */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between gap-4">
                {/* Info Join Pengirim */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800 truncate">
                    {notif.sender_name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded-sm font-medium">
                    {notif.sender_role}
                  </span>
                </div>
                {/* Waktu Notifikasi */}
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {notif.created_at}
                </span>
              </div>

              {/* Kalimat Teks Pesan Utama Dari Backend */}
              <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                {notif.message}
              </p>
            </div>

            {/* Konten Kanan: Aksi Mikro Cepat (Muncul tipis saat hover card) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 cursor-pointer">
                <FiCheckCircle className="w-4 h-4" title="Tandai dibaca" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}