import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Table({ 
  columns, 
  data = [], 
  totalItems = 0, 
  currentPage = 1, 
  onPageChange,           // Fungsi untuk mengubah halaman dari parent component
  itemsPerPage = 10       // Default 10 data per halaman sesuai keinginanmu
}) {
  
  // 🧮 1. Logika Perhitungan Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  
  // Hitung indeks data awal dan akhir untuk halaman yang aktif saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Potong data asli agar hanya menampilkan maksimal 10 data untuk halaman berjalan
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  // Hitung teks info status baris (misal: Menampilkan 1-10 dari 11 data)
  const displayStart = data.length === 0 ? 0 : indexOfFirstItem + 1;
  const displayEnd = Math.min(indexOfLastItem, data.length);

  // Membuat array nomor halaman untuk tombol angka (misal: [1, 2])
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, index) => (
                /* 🔥 PERUBAHAN DI SINI: Menyuntikkan tbl-header secara otomatis untuk seluruh tabel */
                <th 
                  key={index} 
                  className={`px-6 py-4 tbl-header ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-200 text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 text-sm">
                  Tidak ada data yang tersedia.
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
      
      {/* Footer & Dynamic Pagination Index */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
        <span className="font-medium">
          Menampilkan <strong className="text-slate-700">{displayStart}-{displayEnd}</strong> dari <strong className="text-slate-700">{data.length}</strong> data
        </span>
        
        <div className="flex items-center gap-2">
          {/* Tombol Sebelumnya */}
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {/* Render Angka Halaman secara Dinamis */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => onPageChange(number)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  currentPage === number
                    ? "bg-brand text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {number}
              </button>
            ))}
          </div>

          {/* Tombol Selanjutnya */}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}