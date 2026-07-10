import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function RoomCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [locationDetails, setLocationDetails] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: async (newRoomData) => {
      const response = await axios.post('/api/rooms', newRoomData);
      return response.data;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      showToast("Ruangan rapat baru berhasil ditambahkan!", "success");
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate('/rooms');
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || error.response?.data?.error || "Gagal menyimpan data ruangan.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Nama ruangan wajib diisi!";
    }
    
    if (!capacity) {
      newErrors.capacity = "Kapasitas ruangan wajib diisi!";
    } else if (parseInt(capacity) <= 0) {
      newErrors.capacity = "Kapasitas harus berupa angka lebih dari 0!";
    }

    if (locationDetails.length > 255) {
      newErrors.locationDetails = "Detail lokasi kepanjangan! Maksimal 255 karakter.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});     

    if (!validateForm()) return;

    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => navigate('/rooms')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Ruangan Baru</h2>
          <p className="text-xs text-slate-400 font-medium">Daftarkan inventaris ruang rapat baru ke dalam sistem</p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium animate-fadeIn">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Nama Ruangan *</label>
            <input 
              type="text" 
              placeholder="Contoh: Ruang Sakura, Aula Utama"
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                errors.name ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1">
                <FiAlertCircle /> {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Kapasitas (Orang) *</label>
            <input 
              type="number" 
              placeholder="Contoh: 12"
              min="1"
              value={capacity} 
              onChange={(e) => {
                setCapacity(e.target.value);
                if (errors.capacity) setErrors({ ...errors, capacity: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                errors.capacity ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.capacity && (
              <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1">
                <FiAlertCircle /> {errors.capacity}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-slate-600">Detail Lokasi & Keterangan Tambahan (Opsional)</label>
            <div className="relative">
              <textarea 
                rows="3"
                placeholder="Contoh: Gedung A, Lantai 2, Sebelah Lift Operasional"
                value={locationDetails} 
                onChange={(e) => {
                  setLocationDetails(e.target.value);
                  if (errors.locationDetails && e.target.value.length <= 255) {
                    setErrors({ ...errors, locationDetails: '' });
                  }
                }}
                className={`w-full px-3 pt-2 pb-7 border rounded-lg text-sm focus:outline-none transition-colors resize-none ${
                  errors.locationDetails ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
                }`}
              />
              
              <span className={`absolute bottom-2.5 right-3 text-[10px] font-bold tracking-wider transition-all duration-200 ${
                locationDetails.length > 255 
                  ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200 animate-pulse' 
                  : 'text-slate-400'
              }`}>
                {locationDetails.length} / 255
              </span>
            </div>
            
            {errors.locationDetails && (
              <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1 animate-fadeIn">
                <FiAlertCircle className="shrink-0" /> {errors.locationDetails}
              </p>
            )}
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/rooms')}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer disabled:bg-slate-300"
          >
            <FiSave className="w-4 h-4" />
            {isPending ? "Menyimpan..." : "Simpan Ruangan"}
          </button>
        </div>

      </form>

      <ConfirmationModal
        type="brand"
        isOpen={isModalOpen}
        isPending={isPending}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          createRoom({
            name,
            capacity: parseInt(capacity), 
            location_details: locationDetails.trim() || null 
          });
        }}
        title="Konfirmasi Tambah Ruangan"
        message={`Apakah Anda yakin informasi untuk "${name}" sudah sesuai?`}
        confirmLabel="Tambah"
      />

    </div>
  );
}