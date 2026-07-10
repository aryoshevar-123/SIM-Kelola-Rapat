import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function RoomEditPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [locationDetails, setLocationDetails] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const response = await axios.get(`/api/rooms/${id}`);
      return response.data.room || response.data;
    }
  });

  useEffect(() => {
    if (room) {
      setName(room.name || '');
      setCapacity(room.capacity || '');
      setLocationDetails(room.location_details || '');
    }
  }, [room]);

  const { mutate: updateRoom, isPending } = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.put(`/api/rooms/${id}`, updatedData);
      return response.data;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      showToast("Data ruangan berhasil diperbarui!", "success");
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', id] });
      navigate('/rooms');
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || "Gagal memperbarui data ruangan.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Nama ruangan wajib diisi!";
    }
    
    if (!capacity || parseInt(capacity) <= 0) {
      newErrors.capacity = "Kapasitas harus berupa angka valid (min. 1)!";
    }

    if (!locationDetails.trim()) {
      newErrors.locationDetails = "Detail lokasi wajib diisi!";
    } else if (locationDetails.length > 255) {
      newErrors.locationDetails = "Detail lokasi kepanjangan! Maksimal 255 karakter.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat informasi ruangan...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium max-w-3xl mx-auto">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Terjadi kesalahan saat mengambil data ruangan.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => navigate('/rooms')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Informasi Ruangan</h2>
          <p className="text-xs text-slate-400 font-medium">Perbarui kapasitas atau detail lokasi inventaris ruangan</p>
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
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                errors.name ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Kapasitas (Orang) *</label>
            <input 
              type="number" 
              value={capacity} 
              onChange={(e) => {
                setCapacity(e.target.value);
                if (errors.capacity) setErrors({ ...errors, capacity: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                errors.capacity ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.capacity && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.capacity}</p>}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-slate-600">Detail Lokasi & Keterangan Tambahan *</label>
            <div className="relative">
              <textarea 
                rows="3"
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
              <span className={`absolute bottom-2.5 right-3 text-[10px] font-bold tracking-wider ${
                locationDetails.length > 255 ? 'text-rose-600' : 'text-slate-400'
              }`}>
                {locationDetails.length} / 255
              </span>
            </div>
            {errors.locationDetails && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.locationDetails}</p>}
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
            {isPending ? "Memproses..." : "Simpan Perubahan"}
          </button>
        </div>

      </form>
      
      <ConfirmationModal
        type="brand"
        isOpen={isModalOpen}
        isPending={isPending}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          updateRoom({
            name,
            capacity: parseInt(capacity), 
            location_details: locationDetails.trim()
          });
        }}
        title="Konfirmasi Perubahan Ruangan"
        message={`Apakah Anda yakin ingin memperbarui data ruangan "${room?.name}"?`}
        confirmLabel="Simpan"
      />

    </div>
  );
}