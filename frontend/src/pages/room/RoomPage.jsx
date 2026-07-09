import React, { useState } from 'react';
import { FiPlus, FiSearch, FiMoreVertical } from 'react-icons/fi';
import Table from '../../components/common/Table';

export default function RoomPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Mock Data Ruangan yang diperbanyak agar tampilan portofoliomu bagus
  const roomsData = [
    { id: "RM-01", name: "Ruang Sakura (Lt. 2)", capacity: 12, floor: "Lantai 2", status: "Tersedia", updated_at: "2026-07-05 16:45" },
    { id: "RM-02", name: "Aula Utama (Lt. 3)", capacity: 50, floor: "Lantai 3", status: "Sibuk", updated_at: "2026-07-05 16:45" },
    { id: "RM-03", name: "Ruang Rapat Kecil", capacity: 6, floor: "Lantai 1", status: "Tersedia", updated_at: "2026-07-05 16:45" },
    { id: "RM-04", name: "Ruang Kreatif (Lt. 1)", capacity: 15, floor: "Lantai 1", status: "Sibuk", updated_at: "2026-07-05 16:45" },
    { id: "RM-05", name: "Ruang Aster (Lt. 2)", capacity: 8, floor: "Lantai 2", status: "Tersedia", updated_at: "2026-07-05 16:45" },
  ];

  // Definisikan struktur kolom ruangan
  const roomColumns = [
    { 
      header: "ID", 
      render: (row) => (
        <div>
          <p className="tbl-id">{row.id}</p>
          <p className="tbl-meta mt-0.5">Upd: {row.updated_at}</p>
        </div>
      )
    },
    { 
      header: "Nama Ruangan", 
      accessor: "name",
      className: "tbl-title max-w-xs truncate"
    },
    { 
      header: "Kapasitas", 
      render: (row) => <span className="text-slate-600 font-medium">{row.capacity} Orang</span> 
    },
    { 
      header: "Lokasi / Lantai", 
      accessor: "floor",
      className: "text-slate-500"
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
        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <FiMoreVertical className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 🔥 Action Bar Baru: Menggantikan Judul Statis Sebelumnya */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Bar Ruangan */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari kode atau nama ruangan..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        {/* Tombol Tambah Ruangan */}
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">
          <FiPlus className="w-4 h-4" />
          Tambah Ruangan Baru
        </button>
      </div>

      {/* Komponen Tabel Reusable */}
      <Table 
        columns={roomColumns} 
        data={roomsData} 
        totalItems={roomsData.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />

    </div>
  );
}