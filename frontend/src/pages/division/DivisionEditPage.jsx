import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiAlertCircle, FiUserCheck, FiSearch } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function DivisionEditPage() {
  const { id } = useParams(); // 🆔 Ambil ID divisi dari parameter URL
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // 👥 STATE KEANGGOTAAN
  const [initialMembers, setInitialMembers] = useState([]); // Menampung ID anggota bawaan divisi
  const [currentSelected, setCurrentSelected] = useState([]); // Menampung ID hasil manipulasi ceklis terbaru
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  // 📡 1. FETCH DATA: Detail Divisi Terkait
  const { data: division, isLoading: isLoadingDiv } = useQuery({
    queryKey: ['division', id],
    queryFn: async () => {
      const response = await axios.get(`/api/divisions/${id}`);
      return response.data.division || response.data;
    }
  });

  // 📡 2. FETCH DATA: Semua Karyawan untuk List Ceklis
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['usersDropdown'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data.users || response.data;
    }
  });

  // 🔄 Efek Sinkronisasi: Isi form & petakan keanggotaan saat data selesai dimuat
  useEffect(() => {
    if (division) {
      setName(division.name || '');
      setDescription(division.description || '');
    }
  }, [division]);

  useEffect(() => {
    if (users.length > 0 && id) {
      // Cari siapa saja karyawan yang saat ini memiliki division_id sama dengan halaman ini
      const members = users
        .filter(user => user.division_id === parseInt(id))
        .map(user => user.id);
      
      setInitialMembers(members);
      setCurrentSelected(members); // Set default ceklis awal sesuai anggota asli
    }
  }, [users, id]);

  // 📡 MUTASI DATA: Mengirim payload PUT ke backend
  const { mutate: updateDivisionMutation, isPending } = useMutation({
    mutationFn: async (updatedPayload) => {
      const response = await axios.put(`/api/divisions/${id}`, updatedPayload);
      return response.data;
    },
    onSuccess: (data) => {
      setIsModalOpen(false);
      // Ikuti format response controller-mu yang mengembalikan data.message dinamis
      showToast(data.message || "Divisi berhasil diperbarui!", "success");
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/divisions');
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || "Gagal memperbarui data divisi.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  // Handle Aksi Centang Karyawan
  const handleEmployeeCheckboxChange = (userId) => {
    if (currentSelected.includes(userId)) {
      setCurrentSelected(currentSelected.filter(id => id !== userId));
    } else {
      setCurrentSelected([...currentSelected, userId]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Nama divisi wajib diisi!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;
    setIsModalOpen(true);
  };

  // Filter List Pencarian Karyawan
  const filteredEmployees = users.filter(user => 
    user.name?.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
    user.division_name?.toLowerCase().includes(searchEmployeeQuery.toLowerCase())
  );

  if (isLoadingDiv || isLoadingUsers) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Menyelaraskan data divisi dari database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header Form */}
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => navigate('/divisions')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Struktur Divisi</h2>
          <p className="text-xs text-slate-400 font-medium">Ubah informasi nama, deskripsi, atau mutasi keanggotaan staf</p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium animate-fadeIn">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-5">
        
        {/* Seksi Informasi Dasar */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Nama Divisi *</label>
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
            <label className="text-xs font-semibold text-slate-600">Deskripsi Tuntutan Tugas</label>
            <textarea 
              rows="3"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>
        </div>

        {/* 👥 SELEKSI MULTI-USER MUTASI (DENGAN KALKULASI REQ.BODY) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FiUserCheck className="w-4 h-4 text-brand" />
              Kelola Anggota Divisi
            </label>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Centang untuk memasukkan ke divisi ini, kosongkan centang untuk mengeluarkan karyawan.
            </p>
          </div>

          {/* Kotak Cari Karyawan */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari nama karyawan atau divisi saat ini..."
              value={searchEmployeeQuery}
              onChange={(e) => setSearchEmployeeQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand focus:bg-white transition-all"
            />
          </div>

          {/* Scrollable Checkbox List */}
          <div className="border border-slate-200 rounded-xl max-h-52 overflow-y-auto bg-white p-2 divide-y divide-slate-50 shadow-inner">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((user) => {
                const isOriginallyMember = initialMembers.includes(user.id);
                const isCurrentlyChecked = currentSelected.includes(user.id);

                return (
                  <label 
                    key={user.id} 
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isCurrentlyChecked ? 'bg-brand/5 text-brand' : 'text-slate-600 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isCurrentlyChecked}
                        onChange={() => handleEmployeeCheckboxChange(user.id)}
                        className="accent-brand w-3.5 h-3.5 cursor-pointer rounded-sm"
                      />
                      <span className="truncate font-semibold text-slate-700">{user.name}</span>
                    </div>

                    {/* Badge Penunjuk Status Relasi */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] shrink-0 font-medium ${
                      isOriginallyMember 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' 
                        : user.division_name 
                          ? 'bg-slate-100 text-slate-500' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                    }`}>
                      {isOriginallyMember ? 'Anggota Aktif' : (user.division_name || 'Tanpa Divisi')}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="p-4 text-center text-xs font-medium text-slate-400">Karyawan tidak ditemukan</p>
            )}
          </div>
        </div>

        {/* Form Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/divisions')}
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
      
      {/* 🥞 MODAL KONFIRMASI DENGAN KALKULASI STRUKTUR DATA DIFF */}
      <ConfirmationModal
        type="brand"
        isOpen={isModalOpen}
        isPending={isPending}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          // 🔥 KALKULASI UTAMA (DIFFING ARRAY ID)
          // add_user_ids: Yang ada di list pilihan baru tetapi sebelumnya BUKAN anggota asli
          const add_user_ids = currentSelected.filter(id => !initialMembers.includes(id));
          
          // remove_user_ids: Yang ada di daftar anggota asli tetapi sekarang DI-KOSONGKAN centangnya
          const remove_user_ids = initialMembers.filter(id => !currentSelected.includes(id));

          updateDivisionMutation({
            name,
            description: description.trim() || null,
            add_user_ids,
            remove_user_ids
          });
        }}
        title="Konfirmasi Perubahan Divisi"
        message="Apakah seluruh pengaturan informasi data dan mutasi anggota divisi ini sudah benar?"
        confirmLabel="Ya, Simpan"
      />

    </div>
  );
}