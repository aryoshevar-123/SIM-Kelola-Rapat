import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
  const navigate = useNavigate();

  // 1. State Form Input
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 2. State Toggle Tampilan Sandi
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi Kesesuaian Kata Sandi
    if (formData.password !== formData.confirmPassword) {
      alert("Konfirmasi kata sandi tidak cocok dengan kata sandi baru!");
      return;
    }

    console.log("Mencoba Mendaftar Akun dengan data:", formData);
    alert("Pendaftaran berhasil! Silakan masuk menggunakan akun Anda.");
    
    // 🔥 Alihkan pengguna ke halaman login setelah berhasil mendaftar
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 font-sans px-4 select-none">
      
      {/* Container Kotak Registrasi Minimalis */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 space-y-5">
        
        {/* Header Identitas */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Daftar Akun Karyawan
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Buat akun baru untuk bergabung ke dalam SIM Kelola Rapat
          </p>
        </div>

        {/* Form Registrasi Utama */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* 👤 Field Input Nama Lengkap */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <FiUser className="w-4 h-4" />
              </span>
              <input 
                type="text"
                name="name"
                required
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:bg-white transition-all duration-150"
              />
            </div>
          </div>

          {/* ✉️ Field Input Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Alamat Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <FiMail className="w-4 h-4" />
              </span>
              <input 
                type="email"
                name="email"
                required
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:bg-white transition-all duration-150"
              />
            </div>
          </div>

          {/* 🔒 Field Input Kata Sandi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-9 pr-10 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:bg-white transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 🔒 Field Input Konfirmasi Kata Sandi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </span>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder="Ulangi kata sandi"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-9 pr-10 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:bg-white transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 🚀 Tombol Submit */}
          <button 
            type="submit"
            className="w-full py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors shadow-xs cursor-pointer mt-3"
          >
            Daftar Akun
          </button>
        </form>

        {/* Footer Navigasi Balik ke Login */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Sudah terdaftar sebagai karyawan?{" "}
          <span 
            onClick={() => navigate('/login')}
            className="text-brand font-bold hover:underline cursor-pointer"
          >
            Masuk Sekarang
          </span>
        </div>

      </div>

    </div>
  );
}