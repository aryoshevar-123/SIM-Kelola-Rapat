import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiMoreVertical } from 'react-icons/fi';
import Table from '../../components/common/Table.jsx';
import ActionDropdown from '../../components/common/ActionDropdown.jsx';
import ConfirmationModal from '../../components/common/ConfirmationModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function UserPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [activeDropdownId, setActiveDropdownId] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [activeUserRow, setActiveUserRow] = useState(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });

  const {
    data: users = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data.users;
    }
  });

  const {
    mutate: toggleUserActivation,
    isPending: isTogglingActivation
  } = useMutation({
    mutationFn: async (userId) => {
      const activationStatus = users.find(user => user.id === userId)?.is_active;

      const is_active = !activationStatus;

      const response = await axios.put(`/api/users/${userId}/activate`, { is_active });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsActivationModalOpen(false);
      setSelectedUser(null);
      showToast("Status pengguna berhasil diubah!", "success");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Gagal mengubah status pengguna.";
      showToast(errorMessage, "error");
      setIsActivationModalOpen(false);
      setSelectedUser(null);
    }
  });

  const { 
    mutate: deleteUser, 
    isPending: isDeleting 
  } = useMutation({
    mutationFn: async (userId) => {
      const response = await axios.delete(`/api/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      showToast("Pengguna berhasil dihapus!", "success");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Gagal menghapus pengguna.";
      showToast(errorMessage, "error");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  });

  const userActions = [
    {
      label: 'Edit User',
      icon: FiEdit2,
      onClick: (user) => {
        console.log("Edit User ID:", user.id);
        navigate(`/users/edit/${user.id}`);
      }
    },
    {
      label: 'Ubah Status',
      icon: FiUserCheck,
      onClick: (user) => {
        setSelectedUser(user);
        setIsActivationModalOpen(true);
      }
    },
    {divider: true},
    {
      label: 'Delete User',
      icon: FiTrash2,
      variant: 'danger',
      onClick: (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
      }
    }
  ];

  const handleToggleDropdown = (e, rowData) => {
    e.stopPropagation();
    
    if (activeUserRow?.id === rowData.id) {
      setActiveUserRow(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    
    setActiveUserRow(rowData);
    setDropdownCoords({
      top: rect.bottom + window.scrollY,
      left: rect.right - 160 + window.scrollX 
    });
  };

  const userColumns = [
    {
      header: "ID",
      render: (row) => {
        if (!row.updated_at) return <span className="tbl-meta mt-0.5">-</span>;
        
        const neatUpdatedDateFormat = new Date(row.updated_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        return (
          <div>
            <p className="tbl-id">{row.display_id}</p>
            <p className="tbl-meta mt-0.5">Upd: {neatUpdatedDateFormat}</p>
          </div>
        );
      }
    },
    {
      header: "Pengguna",
      className: "tbl-title", 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
            {row.profile_picture ? (
              <img src={row.profile_picture} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                {row.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="tbl-title truncate">{row.name}</p>
            <p className="tbl-meta text-slate-400 truncate">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      header: "Divisi", 
      accessor: "division_name"
    },
    {
      header: "Akses",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
          row.role === 'admin' || row.role === 'operator' ? 'bg-indigo-50 text-brand border border-brand/20' : 'bg-slate-100 text-slate-600'
        }`}>
          {row.role}
        </span>
      )
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          row.is_active === true ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_active === true ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {row.is_active === true ? 'Aktif' : 'Non-Aktif'}
        </span>
      )
    },
    {
      header: "Terdaftar",
      render: (row) => {
        if (!row.created_at) return <span className="tbl-text">-</span>;
        
        const neatCreatedDateFormat = new Date(row.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        return (
          <span className="tbl-text font-medium text-slate-600">
            {neatCreatedDateFormat}
          </span>
        )
      }
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (row) => (
        <ActionDropdown
          id={row.id}
          isOpen={activeDropdownId === row.id}
          onToggle={setActiveDropdownId}
          actions={userActions}
          rowData={row}
        />
      )
    }
  ];

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat data pengguna dari server...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Gagal memuat data: {error.response?.data?.message || error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari nama, ID, atau email pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <button 
          onClick={() => navigate('/users/create')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      <div className={isDeleting ? "opacity-50 pointer-events-none" : ""}>
        <Table 
          columns={userColumns} 
          data={filteredUsers} 
          totalItems={filteredUsers.length}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => {
            setCurrentPage(page);
            setActiveDropdownId(null);
          }}
        />
      </div>
      
      <ConfirmationModal
        type="danger"
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          if (selectedUser) deleteUser(selectedUser.id);
        }}
        title="Konfirmasi Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${selectedUser?.name || 'pengguna ini'}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
      />

      <ConfirmationModal
        type="brand"
        isOpen={isActivationModalOpen}
        isPending={isDeleting}
        onClose={() => {
          setIsActivationModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          if (selectedUser) toggleUserActivation(selectedUser.id);
        }}
        title="Konfirmasi Aktivasi Pengguna"
        message={`Apakah Anda yakin ingin ${selectedUser?.is_active ? "menonaktifkan" : "mengaktifkan"} akun ${selectedUser?.name || 'pengguna ini'}?`}
        confirmLabel={selectedUser?.is_active ? "Nonaktifkan" : "Aktifkan"}
      />
    </div>
  );
}