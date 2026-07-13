import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch, FiMoreVertical, FiAlertCircle } from 'react-icons/fi';
import Table from '../../components/common/Table.jsx';
import ActionDropdown from '../../components/common/ActionDropdown.jsx'; 
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export default function MeetingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // 📥 STATE BARU: Kontrol modal untuk pembatalan rapat
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 📡 FETCH DATA: Mengambil data rapat dari GET /api/meetings
  const {
    data: meetings = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const response = await axios.get('/api/meetings');
      return response.data.meetings || response.data;
    }
  });

  // 📡 MUTASI DATA 1: Membatalkan rapat via PUT /api/meetings/:id dengan payload status 'canceled'
  const { mutate: cancelMeeting, isPending: isCanceling } = useMutation({
    mutationFn: async (meetingId) => {
      const response = await axios.put(`/api/meetings/${meetingId}`, { status: 'canceled' });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setIsCancelModalOpen(false);
      setSelectedMeeting(null);
      showToast(data.message || "Rapat berhasil dibatalkan!", "success");
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || "Gagal membatalkan rapat.";
      showToast(errMsg, "error");
      setIsCancelModalOpen(false);
      setSelectedMeeting(null);
    }
  });

  // 📡 MUTASI DATA 2: Menghapus rapat via DELETE /api/meetings/:id
  const { mutate: deleteMeeting, isPending: isDeleting } = useMutation({
    networkMode: 'always',
    mutationFn: async (meetingId) => {
      const response = await axios.delete(`/api/meetings/${meetingId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setIsDeleteModalOpen(false);
      setSelectedMeeting(null);
      showToast(data.message || "Rapat berhasil dihapus secara permanen!", "success");
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || "Gagal menghapus data rapat.";
      showToast(errMsg, "error");
      setIsDeleteModalOpen(false);
      setSelectedMeeting(null);
    }
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'scheduled': return 'Mendatang';
      case 'ongoing': return 'Berlangsung';
      case 'canceled': case 'cancelled': return 'Batal';
      default: return status;
    }
  };

  const getStatusBadge = (status) => {
    const label = getStatusLabel(status);
    switch (label) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-700';
      case 'Mendatang': return 'bg-brand/10 text-brand';
      case 'Berlangsung': return 'bg-amber-100 text-amber-700 font-bold animate-pulse';
      case 'Batal': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // 🏛️ STRUKTUR KOLOM TABEL MANAJEMEN RAPAT
  const meetingColumns = [
    {
      header: "ID",
      render: (row) => (
        <div>
          <p className="tbl-id">{row.display_id || `MEE-${row.id}`}</p>
          <p className="tbl-meta mt-0.5">
            Upd: {row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}
          </p>
        </div>
      )
    },
    {
      header: "Judul Rapat",
      accessor: "title",
      className: "tbl-title max-w-xs truncate font-semibold text-slate-800"
    },
    {
      header: "Jadwal (WIB)",
      render: (row) => (
        <div>
          <p className="tbl-title">
            {new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="tbl-text mt-0.5">
            {row.start_time?.substring(0, 5)} - {row.end_time?.substring(0, 5)}
          </p>
        </div>
      )
    },
    {
      header: "Ruangan",
      render: (row) => {
        const isOnline = !row.room_id && row.online_link;
        const roomName = row.room_id ? row.room_name : (isOnline ? "Online" : "Belum diset");
        return (
          <span className={isOnline ? 'font-semibold text-brand tbl-title' : 'tbl-text text-slate-600'}>
            {roomName}
          </span>
        );
      }
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      )
    },
    {
      header: "Dibuat Oleh",
      accessor: "creator_name"
    },
    {
      header: "Aksi",
      className: "text-center relative",
      render: (row) => {
        const dynamicActions = [
          {
            label: 'Lihat Detail',
            onClick: (meeting) => navigate(`/meetings/details/${meeting.id}`)
          },
          {
            label: 'Edit Jadwal',
            onClick: (meeting) => navigate(`/meetings/edit/${meeting.id}`)
          },
          { divider: true },
          {
            label: 'Batalkan Rapat',
            variant: 'danger',
            onClick: (meeting) => {
              setSelectedMeeting(meeting);
              // 🔥 PEMBARUAN: Buka modal konfirmasi batal rapat
              setIsCancelModalOpen(true);
              setActiveDropdownId(null);
            }
          }
        ];

        if (row.status === 'completed') {
          dynamicActions.pop();
          dynamicActions.pop();
          dynamicActions.pop();
        }

        if (row.status === 'canceled' || row.status === 'cancelled') {
          dynamicActions.pop();
          dynamicActions.push({
            label: 'Hapus Rapat',
            variant: 'danger',
            onClick: (meeting) => {
              setSelectedMeeting(meeting);
              setIsDeleteModalOpen(true);
              setActiveDropdownId(null);
            }
          });
        }

        return (
          <ActionDropdown
            id={row.id}
            isOpen={activeDropdownId === row.id}
            onToggle={setActiveDropdownId}
            actions={dynamicActions} 
            rowData={row}
          />
        );
      }
    }
  ];

  // 🔍 LOGIKA PENCARIAN CLIENT-SIDE
  const filteredMeetings = meetings.filter(meeting => 
    meeting.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.display_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.creator_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Menghimpun matriks jadwal rapat...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium max-w-3xl mx-auto">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Gagal memuat agenda rapat: {error.response?.data?.message || error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari ID atau Judul Rapat..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <button 
          onClick={() => navigate('/meetings/create')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          Buat Rapat Baru
        </button>
      </div>

      {/* Komponen Reusable Table */}
      <Table 
        columns={meetingColumns} 
        data={filteredMeetings} 
        totalItems={filteredMeetings.length}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={(page) => {
          setCurrentPage(page);
          setActiveDropdownId(null);
        }}
      />

      {/* 🔥 MODAL DIALOG BARU: Konfirmasi Pembatalan Rapat */}
      <ConfirmationModal
        type="danger"
        isOpen={isCancelModalOpen}
        isPending={isCanceling}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedMeeting(null);
        }}
        onConfirm={() => {
          if (selectedMeeting) cancelMeeting(selectedMeeting.id);
        }}
        title="Konfirmasi Pembatalan Rapat"
        message={`Apakah Anda yakin ingin membatalkan agenda rapat "${selectedMeeting?.title || ''}"? Seluruh alokasi ruangan akan dibebaskan dan notifikasi pembatalan segera dikirim ke peserta.`}
        confirmLabel="Ya, Batalkan Rapat"
      />

      {/* Modal Dialog Konfirmasi Aksi Hapus */}
      <ConfirmationModal
        type="danger"
        isOpen={isDeleteModalOpen}
        isPending={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMeeting(null);
        }}
        onConfirm={() => {
          if (selectedMeeting) deleteMeeting(selectedMeeting.id);
        }}
        title="Konfirmasi Hapus Rapat"
        message={`Apakah Anda yakin ingin menghapus agenda rapat "${selectedMeeting?.title || ''}" secara permanen?`}
        confirmLabel="Hapus Permanen"
      />

    </div>
  );
}