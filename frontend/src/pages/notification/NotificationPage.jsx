import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FiCheckCircle, FiBell, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function NotificationPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // 📡 1. FETCH DATA: Mengambil seluruh daftar notifikasi pengguna
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications');
      return response.data; // { status, unread_count, results, notifications }
    }
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unread_count || 0;

  // 📡 3. MUTASI DATA: Tandai Semua Notifikasi Dibaca
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMutation({
    mutationFn: async () => {
      const response = await axios.put('/api/notifications/mark-all');
      return response.data;
    },
    onSuccess: (data) => {
      showToast(data.message || "Seluruh notifikasi telah ditandai sebagai dibaca.", "success");
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Gagal menandai seluruh notifikasi.";
      showToast(msg, "error");
    }
  });

  // 📡 4. MUTASI DATA: Bersihkan Notifikasi yang Sudah Dibaca
  const { mutate: clearReadNotifications, isPending: isClearing } = useMutation({
    mutationFn: async () => {
      const response = await axios.delete('/api/notifications/clear-read');
      return response.data;
    },
    onSuccess: (data) => {
      showToast(data.message || "Notifikasi yang sudah dibaca berhasil dibersihkan.", "success");
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Gagal membersihkan notifikasi.";
      showToast(msg, "error");
    }
  });

  // 🎨 HELPER STYLING TIPE NOTIFIKASI
  const getTypeStyles = (type) => {
    switch (type) {
      case 'meeting':
      case 'invitation':
      case 'reschedule':
      case 'start':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'user':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'division':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'canceled':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  // 🕒 HELPER FORMAT WAKTU TANGGAL LOKAL (WIB)
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-12 select-none">
      
      {/* Utility Header Page */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand/10 text-brand rounded-xl relative">
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pusat Pemberitahuan</h3>
            <p className="text-xs text-slate-400">Pantau seluruh riwayat aktivitas pembaruan sistem rapat</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll || unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/5 rounded-xl transition-colors border border-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            Tandai Semua Dibaca
          </button>
          <button 
            onClick={() => clearReadNotifications()}
            disabled={isClearing || notifications.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            Bersihkan
          </button>
        </div>
      </div>

      {/* 🟢 KUMPULAN BUBBLE TEXT NOTIFIKASI */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-medium animate-pulse">
            Memuat kotak masuk notifikasi...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            Tidak ada pemberitahuan masuk saat ini.
          </div>
        ) : (
          notifications.map((notif) => (
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
                  {notif.type || 'Sistem'}
                </span>
              </div>

              {/* Konten Tengah: Info Pengirim & Pesan */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  {/* Info Join Pengirim */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-800 truncate">
                      {notif.sender_name || "Sistem Otomatis"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded-sm font-medium uppercase">
                      {notif.sender_role || "System"}
                    </span>
                  </div>
                  {/* Waktu Notifikasi */}
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {formatTime(notif.created_at)}
                  </span>
                </div>

                {/* Kalimat Teks Pesan Utama Dari Backend */}
                <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                  {notif.message}
                </p>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}