import React, { useState } from 'react';
import { FiPlus, FiSearch, FiMoreVertical, FiUsers } from 'react-icons/fi';
import Table from '../../components/common/Table';

export default function DivisionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Mock Data yang disesuaikan dengan skema database relasional kamu
  const mockDivisions = [
    {
      id: 1, // ID asli untuk relasi backend
      display_id: "DIV-001",
      name: "IT Developer",
      total_members: 14, // Hasil agregasi COUNT(user.id) WHERE user.division_id = division.id
      description: "Divisi yang bertanggung jawab atas pengembangan dan pemeliharaan seluruh sistem informasi dan infrastruktur digital internal perusahaan.",
      created_at: "2026-01-01",
      updated_at: "2026-06-30 10:00"
    },
    {
      id: 2,
      display_id: "DIV-002",
      name: "Human Resources",
      total_members: 6,
      description: "Divisi yang mengelola siklus hidup karyawan, mulai dari rekrutmen, manajemen talenta, hingga kesejahteraan staf.",
      created_at: "2026-01-05",
      updated_at: "2026-05-12 09:15"
    },
    {
      id: 3,
      display_id: "DIV-003",
      name: "Finance & Accounting",
      total_members: 5,
      description: "Divisi yang mengatur arus kas, pembukuan keuangan perusahaan, pelaporan pajak, dan anggaran operasional tahunan.",
      created_at: "2026-01-10",
      updated_at: "2026-07-02 16:45"
    },
    {
      id: 4,
      display_id: "DIV-004",
      name: "Marketing & Branding",
      total_members: 9,
      description: "Divisi yang berfokus pada strategi perluasan pasar, manajemen media sosial korporat, serta promosi produk eksternal.",
      created_at: "2026-02-20",
      updated_at: "2026-06-25 11:00"
    }
  ];

  // Fungsi placeholder untuk aksi melihat detail divisi (menampilkan deskripsi & created_at)
  const handleViewDetail = (division) => {
    alert(
      `Detail Divisi: ${division.name}\n\n` +
      `Deskripsi: ${division.description}\n\n` +
      `Tanggal Dibuat: ${division.created_at}`
    );
  };

  // 🏛️ DEFINISI STRUKTUR KOLOM MANAJEMEN DIVISI
  const divisionColumns = [
    {
      header: "ID",
      render: (row) => (
        <div>
          <p className="tbl-id">{row.display_id}</p>
          <p className="tbl-meta mt-0.5">Upd: {row.updated_at}</p>
        </div>
      )
    },
    {
      header: "Nama Divisi",
      accessor: "name",
      className: "tbl-title"
    },
    {
      header: "Jumlah Anggota",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-600">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
            <FiUsers className="w-3.5 h-3.5" />
          </div>
          <span className="tbl-text">
            <strong className="text-slate-800">{row.total_members}</strong> Karyawan
          </span>
        </div>
      )
    },
    {
      header: "Aksi",
      className: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          {/* Tombol Cepat Detail untuk memicu intruksi deskripsi kamu */}
          <button 
            onClick={() => handleViewDetail(row)}
            className="px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Detail
          </button>
          
          <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <FiMoreVertical className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari nama divisi..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">
          <FiPlus className="w-4 h-4" />
          Tambah Divisi Baru
        </button>
      </div>

      {/* Komponen Tabel Reusable */}
      <Table 
        columns={divisionColumns} 
        data={mockDivisions} 
        totalItems={mockDivisions.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />

    </div>
  );
}