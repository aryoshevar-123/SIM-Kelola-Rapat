import React, { useState } from 'react';
import MeetingActionDropdown from '../../components/common/MeetingActionDropdown.jsx';
import Table from '../../components/common/Table.jsx';
import { FiPlus, FiSearch, FiMoreVertical } from 'react-icons/fi'; // 🔥 Hapus FiChevronLeft & Right karena tidak dipakai di sini

export default function MeetingPage() {
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const mockMeetings = [
    { display_id: "MEE-001", title: "Sinkronisasi Tim Developer", date: "2026-07-02", start_time: "09:00", end_time: "10:30", room: "Ruang Sakura (Lt. 2)", status: "Selesai", created_by: "Aryo Sheva R.", updated_at: "2026-07-01 14:00" },
    { display_id: "MEE-002", title: "Review Mingguan UI/UX Intern", date: "2026-07-05", start_time: "13:00", end_time: "14:30", room: "Online", status: "Mendatang", created_by: "Manager HRD", updated_at: "2026-07-03 09:15" },
    { display_id: "MEE-003", title: "Rapat Pleno Direksi Bulanan", date: "2026-07-10", start_time: "15:00", end_time: "17:00", room: "Aula Utama (Lt. 3)", status: "Mendatang", created_by: "Admin Sistem", updated_at: "2026-07-05 10:00" },
    { display_id: "MEE-004", title: "Evaluasi Vendor IT", date: "2026-06-28", start_time: "10:00", end_time: "11:00", room: "Ruang Rapat Kecil", status: "Batal", created_by: "Aryo Sheva R.", updated_at: "2026-06-27 16:30" },
    { display_id: "MEE-005", title: "Daily Standup Sprint 3", date: "2026-07-01", start_time: "08:30", end_time: "09:00", room: "Online", status: "Selesai", created_by: "Lead Developer", updated_at: "2026-07-01 09:00" },
    { display_id: "MEE-006", title: "Branding & Marketing Strategy", date: "2026-07-06", start_time: "10:00", end_time: "12:00", room: "Ruang Kreatif (Lt. 1)", status: "Mendatang", created_by: "Tim Marketing", updated_at: "2026-07-04 11:20" },
    { display_id: "MEE-007", title: "Interview Kandidat Frontend", date: "2026-07-02", start_time: "14:00", end_time: "15:00", room: "Ruang Rapat Kecil", status: "Mendatang", created_by: "Manager HRD", updated_at: "2026-07-02 08:00" },
    { display_id: "MEE-008", title: "Sosialisasi SOP Libur Nasional", date: "2026-06-25", start_time: "15:30", end_time: "16:30", room: "Aula Utama (Lt. 3)", status: "Selesai", created_by: "Admin Sistem", updated_at: "2026-06-25 17:00" },
    { display_id: "MEE-009", title: "Koordinasi Deployment Express API", date: "2026-07-03", start_time: "20:00", end_time: "21:30", room: "Online", status: "Mendatang", created_by: "Aryo Sheva R.", updated_at: "2026-07-03 12:00" },
    { display_id: "MEE-010", title: "Kick-off Project Dashboard Kampus", date: "2026-07-12", start_time: "09:30", end_time: "11:30", room: "Ruang Sakura (Lt. 2)", status: "Mendatang", created_by: "Product Owner", updated_at: "2026-07-05 16:45" },
    { display_id: "MEE-011", title: "Sinkronisasi Tim Developer Duplikat", date: "2026-07-02", start_time: "09:00", end_time: "10:30", room: "Ruang Sakura (Lt. 2)", status: "Selesai", created_by: "Aryo Sheva R.", updated_at: "2026-07-01 14:00" }
  ];
  
  const toggleDropdown = (id) => {
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-700';
      case 'Mendatang': return 'bg-brand/10 text-brand';
      case 'Batal': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const meetingColumns = [
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
      header: "Judul Rapat",
      accessor: "title",
      className: "tbl-title max-w-xs truncate"
    },
    {
      header: "Jadwal (WIB)",
      render: (row) => (
        <div>
          <p className="tbl-title">{row.date}</p>
          <p className="tbl-text mt-0.5">{row.start_time} - {row.end_time}</p>
        </div>
      )
    },
    {
      header: "Ruangan",
      render: (row) => (
        /* 🔥 Pembaruan: Menggunakan tbl-title untuk online, dan tbl-text untuk ruang biasa */
        <span className={row.room.toLowerCase() === 'online' ? 'font-semibold text-brand tbl-title' : 'tbl-text'}>
          {row.room}
        </span>
      )
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      header: "Dibuat Oleh",
      accessor: "created_by"
    },
    {
      header: "Aksi",
      className: "text-center relative",
      render: (row) => (
        <>
          <button 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => toggleDropdown(row.display_id)}
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>
          {activeDropdownId === row.display_id && (
            <MeetingActionDropdown
              status={row.status}
              onClose={() => setActiveDropdownId(null)}
              onEdit={() => console.log("Edit rapat:", row.display_id)}
              onCancel={() => console.log("Batal rapat:", row.display_id)}
              onDelete={() => console.log("Hapus rapat:", row.display_id)}
              onReschedule={() => console.log("Jadwalkan ulang rapat:", row.display_id)}
            />
          )}
        </>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Action Bar (Search & Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari ID atau Judul Rapat..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">
          <FiPlus className="w-4 h-4" />
          Buat Rapat Baru
        </button>
      </div>

      <Table 
        columns={meetingColumns} 
        data={mockMeetings} 
        totalItems={mockMeetings.length}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={(page) => {
          setCurrentPage(page);
          setActiveDropdownId(null); // 🔥 Reset status dropdown agar tertutup otomatis saat ganti page
        }}
      />

    </div>
  );
}