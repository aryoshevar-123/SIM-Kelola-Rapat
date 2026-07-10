import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FiPlus, FiSearch, FiMoreVertical, FiUsers, FiAlertCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Table from '../../components/common/Table';
import ActionDropdown from '../../components/common/ActionDropdown'; 
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export default function DivisionPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState('');
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const { showToast } = useToast();

  const {
    data: divisions = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const response = await axios.get('/api/divisions');
      return response.data.divisions || response.data;
    }
  });

  const {mutate: deleteDivision, isPending: isDeleting} = useMutation({
    mutationFn: async (divisionId) => {
      const response = await axios.delete(`/api/divisions/${divisionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['divisions']);
      setIsDeleteModalOpen(false);
      setSelectedDivision(null);
      showToast("Divisi berhasil dihapus!", "success");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Gagal menghapus divisi.";
      showToast(errorMessage, "error");
      setIsDeleteModalOpen(false);
      setSelectedDivision(null);
    }
  });

  const divisionActions = [
    {
      label: 'Edit Divisi',
      icon: FiEdit2,
      onClick: (division) => navigate(`/divisions/edit/${division.id}`)
    },
    {
      label: 'Lihat Detail',
      icon: FiUsers,
      onClick: (division) => {
        navigate(`/divisions/details/${division.id}`);
      }
    },
    { divider: true },
    {
      label: 'Hapus Divisi',
      icon: FiTrash2,
      variant: 'danger',
      onClick: (division) => {
        setSelectedDivision(division);
        setIsDeleteModalOpen(true);
      }
    }
  ];

  const divisionColumns = [
    {
      header: "ID",
      render: (row) => (
        <div>
          <p className="tbl-id">{row.display_id || `DIV-${row.id}`}</p>
          <p className="tbl-meta mt-0.5">
            Upd: {row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}
          </p>
        </div>
      )
    },
    {
      header: "Nama Divisi",
      accessor: "name",
      className: "tbl-title font-semibold text-slate-800"
    },
    {
      header: "Jumlah Anggota",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-600">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
            <FiUsers className="w-3.5 h-3.5" />
          </div>
          <span className="tbl-text">
            <strong className="text-slate-800">{row.total_members || 0}</strong> Karyawan
          </span>
        </div>
      )
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (row) => (
        <ActionDropdown
          id={row.id}
          isOpen={activeDropdownId === row.id}
          onToggle={setActiveDropdownId}
          actions={divisionActions}
          rowData={row}
        />
      )
    }
  ];

  const filteredDivisions = divisions.filter(div =>
    div.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    div.display_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat data divisi dari server...</p>
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
            placeholder="Cari nama divisi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <button 
          onClick={() => {
            navigate('/divisions/create');
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          Tambah Divisi Baru
        </button>
      </div>

      <Table 
        columns={divisionColumns} 
        data={filteredDivisions} 
        totalItems={filteredDivisions.length}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          setActiveDropdownId('');
        }}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      <ConfirmationModal
        type="danger"
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDivision(null);
        }}
        onConfirm={() => {
          if (selectedDivision) deleteDivision(selectedDivision.id);
        }}
        title="Konfirmasi Hapus Divisi"
        message={`Apakah Anda yakin ingin menghapus "${selectedDivision?.name || 'divisi ini'}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
      />
    </div>
  );
}