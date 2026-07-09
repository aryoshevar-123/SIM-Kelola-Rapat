import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');

  const { 
    mutate: loginUser,
    isPending: isLoggingIn
  } = useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await axios.post('/api/auth/login', { email, password });
      return response.data;
    },
    onSuccess: async (data) => {
      console.log("Login sukses, menyelaraskan session...", data);
      setErrorMessage(''); 
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/home', { replace: true });
    },
    onError: (error) => {
      const messageFromServer = error.response?.data?.message || error.response?.data?.error || 'Terjadi kesalahan saat login.';
      setErrorMessage(messageFromServer); 
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Harap isi seluruh kolom email dan kata sandi!");
      return;
    }

    loginUser({ email, password });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 font-sans px-4 select-none">
      
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Selamat Datang Kembali
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Masuk ke SIM Kelola Rapat untuk mengelola aktivitas sistem
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium animate-fadeIn">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <FiMail className="w-4 h-4" />
              </span>
              <input 
                type="text"
                disabled={isLoggingIn}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-slate-50/50 border rounded-lg text-sm focus:outline-none focus:bg-white transition-all duration-150 disabled:opacity-60 ${
                  errorMessage && !email ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-brand"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Kata Sandi</label>
              <span className="text-[11px] text-brand font-medium hover:underline cursor-pointer">
                Lupa Sandi?
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                disabled={isLoggingIn}
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-10 py-2 bg-slate-50/50 border rounded-lg text-sm focus:outline-none focus:bg-white transition-all duration-150 disabled:opacity-60 ${
                  errorMessage && !password ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-brand"
                }`}
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

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors shadow-xs cursor-pointer mt-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? "Memverifikasi..." : "Masuk Aplikasi"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Belum memiliki akun karyawan?{" "}
          <span 
            onClick={() => navigate('/register')}
            className="text-brand font-bold hover:underline cursor-pointer"
          >
            Daftar Sekarang
          </span>
        </div>

      </div>

    </div>
  );
}