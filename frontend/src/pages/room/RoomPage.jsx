import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FiPlus, FiSearch, FiMoreVertical, FiAlertCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaRegBuilding } from 'react-icons/fa';
import Table from '../../components/common/Table';
import ActionDropdown from '../../components/common/ActionDropdown';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export default function RoomPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: rooms = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await axios.get('/api/rooms');
      return response.data.rooms || response.data;
    }
  });

  const { 
    mutate: deleteRoom, 
    isPending: isDeleting 
  } = useMutation({
    mutationFn: async (roomId) => {
      const response = await axios.delete(`/api/rooms/${roomId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsDeleteModalOpen(false);
      setSelectedRoom(null);
      showToast("Ruangan berhasil dihapus!", "success");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Gagal menghapus ruangan.";
      showToast(errorMessage, "error");
      setIsDeleteModalOpen(false);
      setSelectedRoom(null);
    }
  })

  const roomActions = [
    {
      label: 'Edit Ruangan',
      icon: FiEdit2,
      onClick: (room) => {
        navigate(`/rooms/edit/${room.id}`);
      }
    },
    {
      label: 'Lihat Detail',
      icon: FaRegBuilding,
      onClick: (room) => {
        navigate(`/rooms/details/${room.id}`);
      }
    },
    { divider: true },
    {
      label: 'Hapus Ruangan',
      icon: FiTrash2,
      variant: 'danger',
      onClick: (room) => {
        setIsDeleteModalOpen(true);
        setSelectedRoom(room);
      }
    }
  ];

  const roomColumns = [
    { 
      header: "ID", 
      render: (row) => (
        <div>
          <p className="tbl-id">{row.display_id || `RM-${row.id}`}</p>
          <p className="tbl-meta mt-0.5">
            Upd: {row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}
          </p>
        </div>
      )
    },
    { 
      header: "Nama Ruangan", 
      accessor: "name",
      className: "tbl-title max-w-xs truncate font-semibold text-slate-800"
    },
    { 
      header: "Kapasitas", 
      render: (row) => <span className="text-slate-600 font-medium">{row.capacity} Orang</span> 
    },
    { 
      header: "Lokasi / Detail", 
      accessor: "location_details", 
      className: "text-slate-500 text-xs font-medium"
    },
    { 
      header: "Status", 
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
          row.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Tersedia' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {row.status}
        </span>
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
          actions={roomActions}
          rowData={row}
        />
      )
    }
  ];

  const filteredRooms = rooms.filter(room => 
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.display_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location_details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Menghubungkan ke sistem ruangan...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium max-w-3xl mx-auto">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Gagal memuat data ruangan: {error.response?.data?.message || error.message}</span>
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
            placeholder="Cari kode atau nama ruangan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <button 
          onClick={() => navigate('/rooms/create')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">
          <FiPlus className="w-4 h-4" />
          Tambah Ruangan Baru
        </button>
      </div>

      <Table 
        columns={roomColumns} 
        data={filteredRooms} 
        totalItems={filteredRooms.length}
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
          setSelectedRoom(null);
        }}
        onConfirm={() => {
          if (selectedRoom) deleteRoom(selectedRoom.id);
        }}
        title="Konfirmasi Hapus Ruangan"
        message={`Apakah Anda yakin ingin menghapus "${selectedRoom?.name || 'ruangan ini'}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
      />
    </div>
  );
}