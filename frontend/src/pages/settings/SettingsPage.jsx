import React, { useState } from 'react';
import { FiUser, FiLock, FiEye, FiMoon, FiSave } from 'react-icons/fi';

export default function SettingsPage() {
  // 1. State Form Profil (Sekarang menyertakan Role dan Division hasil database)
  const [profile, setProfile] = useState({
    name: "Aryo Sheva Ramadhani",
    email: "aryosheva@company.com",
    role: "Admin",                  // 🔥 Data Tambahan
    division_name: "IT Developer",  // 🔥 Data Tambahan
    avatar: ""
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [textSize, setTextSize] = useState("medium");

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = (section) => {
    alert(`Pengaturan ${section} berhasil disimpan secara lokal!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12 select-none">
      
      {/* 🟢 PANEL 1: EDIT PROFIL, ROLE, & DIVISI */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
          <FiUser className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-slate-800">Informasi Pribadi</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Uploader Foto Profil + Badge Jabatan */}
          <div className="flex flex-col items-center text-center gap-3 shrink-0 w-full md:w-auto md:border-r md:border-slate-100 md:pr-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative group shadow-sm">
              <img 
                src="https://ui-avatars.com/api/?name=Aryo+Sheva&background=4F46E5&color=fff&size=128" 
                alt="Preview Avatar" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-[10px] text-white font-semibold">Ubah Foto</span>
              </div>
            </div>
            
            {/* 🔥 Tampilan Ringkas Role & Divisi di Bawah Foto */}
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-brand text-[11px] font-bold rounded-md border border-brand/10">
                {profile.role}
              </span>
              <p className="text-xs font-semibold text-slate-700">{profile.division_name}</p>
            </div>
          </div>

          {/* Form Isian Data Diri */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
              <input 
                type="text" 
                name="name" 
                value={profile.name} 
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Alamat Email</label>
              <input 
                type="email" 
                name="email" 
                value={profile.email} 
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all"
              />
            </div>

            {/* 🔥 Field Pengunci Divisi (Read Only / Disabled untuk Keamanan UX) */}
            <div className="flex flex-col gap-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-dashed border-slate-200">
              <label className="text-xs font-semibold text-slate-400">Divisi Kerja (Terkunci)</label>
              <input 
                type="text" 
                disabled
                value={profile.division_name} 
                className="w-full px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                title="Divisi hanya dapat diubah oleh pemilik hak akses Administrator Utama"
              />
            </div>

            {/* 🔥 Field Pengunci Hak Akses / Role (Read Only) */}
            <div className="flex flex-col gap-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-dashed border-slate-200">
              <label className="text-xs font-semibold text-slate-400">Hak Akses Sistem (Terkunci)</label>
              <input 
                type="text" 
                disabled
                value={profile.role} 
                className="w-full px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
          <button 
            onClick={() => handleSaveSettings("Profil")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition-colors cursor-pointer"
          >
            <FiSave className="w-4 h-4" /> Simpan Profil
          </button>
        </div>
      </section>

      {/* 🔵 PANEL 2: KEAMANAN / UPDATE PASSWORD */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
          <FiLock className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-slate-800">Keamanan Akun</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Kata Sandi Saat Ini</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Kata Sandi Baru</label>
            <input 
              type="password" 
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Konfirmasi Sandi Baru</label>
            <input 
              type="password" 
              placeholder="Ulangi sandi baru"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
          <button 
            onClick={() => handleSaveSettings("Password")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-hover transition-colors cursor-pointer"
          >
            <FiEye className="w-4 h-4" /> Perbarui Sandi
          </button>
        </div>
      </section>

      {/* 🟡 PANEL 3: PREFERENSI TAMPILAN */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
          <FiMoon className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-slate-800">Kustomisasi Antarmuka</h3>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Mode Gelap (Dark Mode)</h4>
              <p className="text-xs text-slate-400">Mengubah tema palet sistem menjadi lebih nyaman di mata</p>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${isDarkMode ? 'bg-brand' : 'bg-slate-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-200 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Skala Ukuran Teks</h4>
              <p className="text-xs text-slate-400">Menyesuaikan kerenggangan fontasi agar keterbacaan data maksimal</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`px-3 py-1 text-xs capitalize font-medium rounded-lg transition-all cursor-pointer ${
                    textSize === size 
                      ? "bg-white text-brand shadow-xs font-semibold" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {size === 'small' ? 'Kecil' : size === 'medium' ? 'Normal' : 'Besar'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 border-t border-slate-100 pt-4">
          <button 
            onClick={() => handleSaveSettings("Tampilan")}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            Terapkan Preferensi
          </button>
        </div>
      </section>

    </div>
  );
}