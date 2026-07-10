import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiAlertCircle, FiUserPlus, FiSearch } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function DivisionCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  const { data: users = [] } = useQuery({
    queryKey: ['usersDropdown'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data.users || response.data;
    }
  });

  const { mutate: createDivision, isPending } = useMutation({
    networkMode: 'always',
    mutationFn: async (newDivisionData) => {
      const response = await axios.post('/api/divisions', newDivisionData);
      return response.data;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      showToast("Divisi baru berhasil dibuat dan karyawan dipindahkan!", "success");
      navigate('/divisions');
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || "Gagal menyimpan data divisi.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  const handleEmployeeCheckboxChange = (userId) => {
    if (selectedEmployees.includes(userId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== userId));
    } else {
      setSelectedEmployees([...selectedEmployees, userId]);
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

  const filteredEmployees = users.filter(user => 
    user.name?.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
    user.division_name?.toLowerCase().includes(searchEmployeeQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/divisions')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Divisi Baru</h2>
          <p className="text-xs text-slate-400 font-medium">Buat divisi sekaligus migrasikan anggota secara instan</p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium animate-fadeIn">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-5">
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Nama Divisi *</label>
            <input 
              type="text" 
              placeholder="Contoh: Quality Assurance"
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
            <label className="text-xs font-semibold text-slate-600">Deskripsi Tugas (Opsional)</label>
            <textarea 
              rows="3"
              placeholder="Jelaskan peran divisi operasional ini..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FiUserPlus className="w-4 h-4 text-brand" />
              Tarik Karyawan Langsung (Opsional)
            </label>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Pilih karyawan yang ingin langsung dipindahkan ke divisi baru ini
            </p>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari nama karyawan atau divisi lama..."
              value={searchEmployeeQuery}
              onChange={(e) => setSearchEmployeeQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand focus:bg-white transition-all"
            />
          </div>

          <div className="border border-slate-200 rounded-xl max-h-52 overflow-y-auto bg-white p-2 divide-y divide-slate-50 shadow-inner">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((user) => (
                <label 
                  key={user.id} 
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    selectedEmployees.includes(user.id) ? 'bg-brand/5 text-brand' : 'text-slate-600 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(user.id)}
                      onChange={() => handleEmployeeCheckboxChange(user.id)}
                      className="accent-brand w-3.5 h-3.5 cursor-pointer rounded-sm"
                    />
                    <span className="truncate font-semibold text-slate-700">{user.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] shrink-0 font-medium ${
                    user.division_name ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                  }`}>
                    {user.division_name || 'Tanpa Divisi'}
                  </span>
                </label>
              ))
            ) : (
              <p className="p-4 text-center text-xs font-medium text-slate-400 animate-pulse">Karyawan tidak ditemukan</p>
            )}
          </div>
          
          {selectedEmployees.length > 0 && (
            <p className="text-[11px] text-brand font-semibold animate-fadeIn">
              📌 {selectedEmployees.length} Karyawan siap dimigrasikan ke divisi baru ini.
            </p>
          )}
        </div>

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
            {isPending ? "Menyimpan..." : "Simpan Divisi"}
          </button>
        </div>

      </form>
      
      <ConfirmationModal
        type="brand"
        isOpen={isModalOpen}
        isPending={isPending}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          createDivision({
            name,
            description: description.trim() || null,
            employeeIds: selectedEmployees 
          });
        }}
        title="Konfirmasi Struktur Divisi"
        message={`Apakah Anda yakin ingin membuat divisi "${name}"? ${
          selectedEmployees.length > 0 ? `${selectedEmployees.length} karyawan terpilih akan langsung dipindahkan hak divisinya.` : ''
        }`}
        confirmLabel="Ya, Buat"
      />

    </div>
  );
}