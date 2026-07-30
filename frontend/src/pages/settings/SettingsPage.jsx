import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FiUser, FiLock, FiEye, FiEyeOff, FiSave, FiCamera, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // 📝 State Input Profil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState('');

  // 🔒 State Input Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 👁️ State Toggle Visibility Password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ⚠️ State Error Handling
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileServerError, setProfileServerError] = useState('');
  const [passwordServerError, setPasswordServerError] = useState('');

  // 📡 1. FETCH DATA: Profil Pengguna Aktif
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const response = await axios.get('/api/profile');
      return response.data.user;
    }
  });

  // 🔄 Sinkronkan data profil dari database ke State Form
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPreviewAvatar(userProfile.profile_picture || '');
    }
  }, [userProfile]);

  // 🖼️ Handler Pilihan File Foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran foto maksimal 2MB!", "error");
        return;
      }
      setSelectedFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // 📡 2. MUTASI DATA: PUT /api/profile (Update Profile & Avatar)
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.put('/api/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: (data) => {
      showToast(data.message || "Profil berhasil diperbarui!", "success");
      setProfileServerError('');
      setSelectedFile(null);
      // Invalidasi query agar foto dan nama di Sidebar ikut ter-update otomatis
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Gagal memperbarui profil.";
      setProfileServerError(msg);
      showToast(msg, "error");
    }
  });

  // 📡 3. MUTASI DATA: PUT /api/profile/password (Update Password)
  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: async (passwordData) => {
      const response = await axios.put('/api/profile/password', passwordData);
      return response.data;
    },
    onSuccess: (data) => {
      showToast(data.message || "Kata sandi berhasil diperbarui!", "success");
      setPasswordServerError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Gagal memperbarui kata sandi.";
      setPasswordServerError(msg);
      showToast(msg, "error");
    }
  });

  // 🛠️ Validasi Form Profil
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileServerError('');
    
    const errors = {};
    if (!name.trim()) errors.name = "Nama lengkap wajib diisi!";
    if (!email.trim()) errors.email = "Alamat email wajib diisi!";
    setProfileErrors(errors);

    if (Object.keys(errors).length === 0) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      }
      updateProfile(formData);
    }
  };

  // 🛠️ Validasi Form Password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordServerError('');

    const errors = {};
    if (!currentPassword) errors.currentPassword = "Kata sandi saat ini wajib diisi!";
    if (!newPassword) {
      errors.newPassword = "Kata sandi baru wajib diisi!";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Kata sandi minimal 8 karakter!";
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi tidak cocok!";
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      updatePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
    }
  };

  if (isLoadingProfile) {
    return <div className="py-20 text-center animate-pulse text-slate-400 font-medium text-sm">Memuat profil pengguna...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12 select-none">
      
      {/* 🟢 PANEL 1: EDIT PROFIL, ROLE, & DIVISI */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
          <FiUser className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-slate-800">Informasi Pribadi</h3>
        </div>

        {profileServerError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-semibold">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileServerError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Uploader Foto Profil + Badge Jabatan */}
            <div className="flex flex-col items-center text-center gap-3 shrink-0 w-full md:w-auto md:border-r md:border-slate-100 md:pr-8">
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative group shadow-sm cursor-pointer"
              >
                <img 
                  src={previewAvatar || "/placeholder.png"} 
                  alt="Preview Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const nameParam = encodeURIComponent(userProfile?.name || 'User');
                    e.target.src = `https://ui-avatars.com/api/?name=${nameParam}&background=4F46E5&color=fff&size=128`;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiCamera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[10px] text-white font-semibold">Ubah Foto</span>
                </div>
              </div>
              
              {/* Badge Role & Divisi */}
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-brand text-[11px] font-bold rounded-md border border-brand/10 uppercase">
                  {userProfile?.role || 'User'}
                </span>
                <p className="text-xs font-semibold text-slate-700">
                  {userProfile?.division_name || 'Tanpa Divisi'}
                </p>
              </div>
            </div>

            {/* Form Isian Data Diri */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
                <input 
                  disabled={isUpdatingProfile}
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    if (profileErrors.name) setProfileErrors(prev => ({ ...prev, name: null }));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all disabled:bg-slate-50"
                />
                {profileErrors.name && <p className="text-[10px] text-rose-500 font-bold">{profileErrors.name}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Alamat Email</label>
                <input 
                  disabled={isUpdatingProfile}
                  type="email" 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (profileErrors.email) setProfileErrors(prev => ({ ...prev, email: null }));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all disabled:bg-slate-50"
                />
                {profileErrors.email && <p className="text-[10px] text-rose-500 font-bold">{profileErrors.email}</p>}
              </div>

              {/* Field Readonly: Divisi */}
              <div className="flex flex-col gap-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-dashed border-slate-200">
                <label className="text-xs font-semibold text-slate-400">Divisi Kerja (Terkunci)</label>
                <input 
                  type="text" 
                  disabled
                  value={userProfile?.division_name || 'Tanpa Divisi'} 
                  className="w-full px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                  title="Divisi hanya dapat diubah oleh Administrator Utama"
                />
              </div>

              {/* Field Readonly: Role */}
              <div className="flex flex-col gap-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-dashed border-slate-200">
                <label className="text-xs font-semibold text-slate-400">Hak Akses Sistem (Terkunci)</label>
                <input 
                  type="text" 
                  disabled
                  value={userProfile?.role || 'User'} 
                  className="w-full px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed uppercase"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
            <button 
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition-colors cursor-pointer disabled:bg-slate-300"
            >
              <FiSave className="w-4 h-4" /> {isUpdatingProfile ? "Memperbarui..." : "Simpan Profil"}
            </button>
          </div>
        </form>
      </section>

      {/* 🔵 PANEL 2: KEAMANAN / UPDATE PASSWORD */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
          <FiLock className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-slate-800">Keamanan Akun</h3>
        </div>

        {passwordServerError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-semibold">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordServerError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Password Saat Ini */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Kata Sandi Saat Ini</label>
              <div className="relative">
                <input 
                  disabled={isUpdatingPassword}
                  type={showCurrent ? "text" : "password"} 
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: null }));
                  }}
                  className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="text-[10px] text-rose-500 font-bold">{passwordErrors.currentPassword}</p>}
            </div>

            {/* Password Baru */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Kata Sandi Baru</label>
              <div className="relative">
                <input 
                  disabled={isUpdatingPassword}
                  type={showNew ? "text" : "password"} 
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: null }));
                  }}
                  className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-[10px] text-rose-500 font-bold">{passwordErrors.newPassword}</p>}
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Konfirmasi Sandi Baru</label>
              <div className="relative">
                <input 
                  disabled={isUpdatingPassword}
                  type={showConfirm ? "text" : "password"} 
                  placeholder="Ulangi sandi baru"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: null }));
                  }}
                  className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold">{passwordErrors.confirmPassword}</p>}
            </div>

          </div>

          <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
            <button 
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition-colors cursor-pointer disabled:bg-slate-300"
            >
              <FiEye className="w-4 h-4" /> {isUpdatingPassword ? "Memperbarui..." : "Perbarui Sandi"}
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}