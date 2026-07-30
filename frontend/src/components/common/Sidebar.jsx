import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
 
import { MdGroups3, MdHome, MdOutlineSettings } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { IoMdNotifications } from "react-icons/io";
import { BsBuildingsFill } from "react-icons/bs";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useToast } from '../../context/ToastContext.jsx'; // 🔥 Mengimpor context Toast

const HomeIcon = () => <MdHome className="w-5 h-5" />;
const MeetingIcon = () => <MdGroups3 className="w-5 h-5" />;
const UserIcon = () => <FaUser className="w-5 h-5" />;
const DivisionIcon = () => <FaBuildingUser className="w-5 h-5" />;
const RoomIcon = () => <BsBuildingsFill className="w-5 h-5" />;
const SettingsIcon = () => <MdOutlineSettings className="w-5 h-5" />;
const NotificationIcon = () => <IoMdNotifications className="w-5 h-5" />;

const mainNavItems = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "meetings", label: "Meeting", icon: MeetingIcon },
  { id: "users", label: "User", icon: UserIcon },
  { id: "divisions", label: "Division", icon: DivisionIcon },
  { id: "rooms", label: "Room", icon: RoomIcon },
  { id: "notifications", label: "Notifications", icon: NotificationIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 duration-150 cursor-pointer text-left ${
        isActive 
          ? "bg-brand text-white shadow-sm" 
          : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
      }`}
    >
      <Icon />
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const queryClient = useQueryClient();
  const { showToast } = useToast(); // 🎯 Menggunakan fungsi penampil toast

  // 📡 1. FETCH DATA: Mengambil data identitas pengguna yang sedang masuk
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get('/api/auth/me');
      return response.data;
    }
  });

  // 📡 2. MUTASI DATA: Aksi Logout Pengguna
  const { mutate: logoutUser, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      console.log("Logout berhasil");
      queryClient.clear(); // Bersihkan seluruh cache query pasca-logout untuk keamanan data
      navigate('/login');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Gagal keluar aplikasi.";
      // 🔥 Mengganti alert dengan toast notification
      showToast(`Logout Gagal: ${errorMessage}`, "error");
    }
  });

  const handleLogout = () => {
    if (!isLoggingOut) logoutUser();
  };

  const handleNavClick = (id) => {
    navigate(`/${id}`);
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-slate-800 border-r border-slate-700/60 shrink-0">
      
      <div className="flex items-center px-6 py-6 border-b border-slate-700/50 h-[75px]">
        <h1 className="text-white font-bold text-lg tracking-tight leading-none">
          SIM Kelola Rapat
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={location.pathname === `/${item.id}`}
            onClick={handleNavClick}
          />
        ))}
      </nav>

      {/* 👤 Tempat Profil Pengguna Aktif Dinamis */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="relative flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-700/30 group hover:bg-slate-900/70 transition-all duration-200">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-slate-600 shrink-0">
            <img 
              src={currentUser?.profile_picture || "/placeholder.png"} 
              alt="Avatar Karyawan" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Tampilkan inisial nama dinamis jika gambar profil kosong atau gagal dimuat
                const nameParam = encodeURIComponent(currentUser?.name || 'User');
                e.target.src = `https://ui-avatars.com/api/?name=${nameParam}&background=4F46E5&color=fff`;
              }}
            />
          </div>

          <div className="flex flex-col min-w-0 pr-6">
            {/* Menampilkan Nama Karyawan Dinamis */}
            <p className="text-white font-semibold text-sm truncate">
              {currentUser?.name || "Memuat..."}
            </p>
            {/* Menampilkan ID Karyawan & Peran secara Dinamis */}
            <p className="text-slate-500 text-xs truncate uppercase">
              {currentUser ? `${currentUser.display_id} • ${currentUser.role}` : "..."}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Keluar Aplikasi"
            className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <RiLogoutBoxLine className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}