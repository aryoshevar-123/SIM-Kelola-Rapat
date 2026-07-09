import React, { useEffect } from 'react';
import { FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi'; // 🔥 Tambah FiInfo

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Konfirmasi", 
  isPending,
  type = "brand" // 🔥 Properti Baru: Default ke warna 'brand', opsi lain: 'danger'
}) {
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 🎨 Konfigurasi Gaya Visual Dinamis Berdasarkan Tipe
  const isDanger = type === 'danger';
  const headerIcon = isDanger ? <FiAlertTriangle className="w-5 h-5 shrink-0" /> : <FiInfo className="w-5 h-5 shrink-0" />;
  const headerIconColor = isDanger ? "text-rose-600" : "text-brand";
  
  const confirmButtonClass = isDanger
    ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white"
    : "bg-brand hover:bg-brand-hover focus:ring-brand text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={isPending ? null : onClose}
      />

      {/* Kotak Dialog Utama */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full z-10 overflow-hidden transform transition-all animate-scaleIn">
        
        {/* Header Dialog */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-2.5 ${headerIconColor}`}>
            {headerIcon}
            <h3 className="font-bold text-slate-800 text-base">{title || "Konfirmasi Aksi"}</h3>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Konten / Isi Pesan */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {message || "Apakah Anda yakin ingin melakukan tindakan ini?"}
          </p>
        </div>

        {/* Footer / Tombol Aksi */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed ${confirmButtonClass}`}
          >
            {isPending ? "Memproses..." : confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}