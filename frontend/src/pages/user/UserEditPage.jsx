import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function UserEditPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [divisionId, setDivisionId] = useState('');
  const [isActive, setIsActive] = useState(true); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisionsDropdown'],
    queryFn: async () => {
      const response = await axios.get('/api/divisions');
      return Array.isArray(response.data) ? response.data : (response.data.divisions || []);
    }
  });

  const { data: userData, isLoading: isLoadingUser, isError: isErrorUser } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${id}`);
      return response.data.user || response.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setRole(userData.role || 'user');
      setDivisionId(userData.division_id || '');
      setIsActive(userData.is_active ?? true);
    }
  }, [userData]);

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.put(`/api/users/${id}`, updatedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      navigate('/users');
      showToast("Data pengguna berhasil diperbarui!", "success");
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || error.response?.data?.error || "Gagal memperbarui data pengguna.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi!";
    }
    if (!divisionId) {
      newErrors.division = "Silakan pilih penempatan divisi kerja karyawan!";
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

  if (isLoadingUser) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Mengambil data profil pengguna...</p>
      </div>
    );
  }

  if (isErrorUser) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium max-w-3xl mx-auto">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Gagal mengambil data: Pengguna tidak ditemukan di dalam sistem.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => navigate('/users')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Ubah Informasi Pengguna</h2>
          <p className="text-xs text-slate-400 font-medium">Ubah data akses dan penempatan divisi karyawan</p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium animate-fadeIn">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Nama Lengkap *</label>
            <input 
              type="text" 
              placeholder="Nama lengkap karyawan"
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

          <div className="flex flex-col gap-1.5 opacity-70">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              Email Perusahaan
            </label>
            <input 
              type="text" 
              disabled
              value={email} 
              className="w-full px-3 py-2 border border-slate-200 bg-slate-100/80 rounded-lg text-sm text-slate-500 font-medium cursor-not-allowed outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 opacity-70">
            <label className="text-xs font-semibold text-slate-500">Kata Sandi</label>
            <input 
              type="text" 
              disabled 
              placeholder="••••••••••"
              className="w-full px-3 py-2 border border-slate-200 bg-slate-100/80 rounded-lg text-sm text-slate-400 cursor-not-allowed outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Hak Akses Sistem *</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              <option value="user">User</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Status Akun *</label>
            <select 
              value={isActive ? "true" : "false"} 
              onChange={(e) => setIsActive(e.target.value === "true")}
              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              <option value="true">Aktif</option>
              <option value="false">Non-Aktif</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Penempatan Divisi *</label>
            <select 
              value={divisionId} 
              onChange={(e) => {
                setDivisionId(e.target.value);
                if (errors.division) setErrors({ ...errors, division: '' });
              }}
              className={`w-full px-3 py-2 border bg-white rounded-lg text-sm focus:outline-none transition-colors ${
                errors.division ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-brand"
              }`}
            >
              <option value="">-- Pilih Divisi Kerja --</option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>{div.name}</option>
              ))}
            </select>
            {errors.division && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.division}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/users')}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer disabled:bg-slate-300"
          >
            <FiSave className="w-4 h-4" />
            {isUpdating ? "Memperbarui..." : "Simpan Perubahan"}
          </button>
        </div>

      </form>

      <ConfirmationModal
        type="brand"
        isOpen={isModalOpen}
        isPending={isUpdating}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onConfirm={() => {
          updateUser({
            name,
            role,
            division_id: parseInt(divisionId),
            is_active: isActive
          });
        }}
        title="Konfirmasi Update Pengguna"
        message={`Apakah Anda yakin ingin memperbarui akun pengguna ini?`}
        confirmLabel="Perbarui"
      />
    </div>
  );
}