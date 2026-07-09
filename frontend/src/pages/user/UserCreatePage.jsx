import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [divisionId, setDivisionId] = useState('');
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

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: async (newUserData) => {
      const response = await axios.post('/api/users', newUserData);
      return response.data;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      showToast("Pengguna baru berhasil ditambahkan!", "success");
      navigate('/users');
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || error.response?.data?.error || "Gagal menyimpan data pengguna.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi!";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email perusahaan wajib diisi!";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Format alamat email tidak valid (contoh: user@company.com)!";
    }
    
    if (!password) {
      newErrors.password = "Kata sandi default wajib diisi!";
    } else if (password.length < 6) {
      newErrors.password = "Kata sandi minimal harus terdiri dari 6 karakter!";
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/users')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Pengguna Baru</h2>
          <p className="text-xs text-slate-400 font-medium">Daftarkan akun karyawan baru ke dalam sistem</p>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Email Perusahaan *</label>
            <input 
              type="text" 
              placeholder="karyawan@company.com"
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                errors.email ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.email && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Kata Sandi Default *</label>
            <input 
              type="password" 
              placeholder="Minimal 6 karakter"
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                errors.password ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.password && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Hak Akses Sistem *</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              <option value="User">User</option>
              <option value="Operator">Operator</option>
              <option value="Admin">Admin</option>
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
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer disabled:bg-slate-300"
          >
            <FiSave className="w-4 h-4" />
            {isPending ? "Menyimpan..." : "Simpan Pengguna"}
          </button>
        </div>

      </form>
      
      <ConfirmationModal
        type="brand"
        isOpen={isModalOpen}
        isPending={isPending}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onConfirm={() => {
          createUser({
            name,
            email,
            password,
            role,
            division_id: parseInt(divisionId)
          });
        }}
        title="Konfirmasi Tambah Pengguna"
        message={`Apakah data yang Anda masukkan sudah benar?`}
        confirmLabel="Tambah"
      />

    </div>
  );
}