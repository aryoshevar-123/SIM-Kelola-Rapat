import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FiArrowLeft, FiEdit2, FiUsers, FiCalendar, FiClock, FiMail, FiShield, FiAlertCircle } from 'react-icons/fi';

export default function DivisionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: division, isLoading, isError, error } = useQuery({
    queryKey: ['divisionDetails', id],
    queryFn: async () => {
      const response = await axios.get(`/api/divisions/${id}`);
      return response.data.division;
    }
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Menghimpun seluruh data anggota divisi...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium max-w-3xl mx-auto">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Gagal memuat detail divisi: {error.response?.data?.message || error.message}</span>
      </div>
    );
  }

  const formattedCreatedAt = division?.created_at 
    ? new Date(division.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/divisions')}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{division.name}</h2>
            <p className="text-xs text-slate-400 font-medium">Informasi menyeluruh dan manajemen internal struktur divisi</p>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/divisions/edit/${division.id}`)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
          Edit Profil Divisi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Peran & Tanggung Jawab</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {division.description || "Tidak ada deskripsi tertulis yang ditambahkan untuk divisi operasional ini."}
            </p>
          </div>
          
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-slate-500">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium uppercase">Dibuat Pada</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{formattedCreatedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium uppercase">Pembaruan Sistem</p>
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {division.updated_at ? new Date(division.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform" />
          <div className="p-4 bg-brand/10 text-brand rounded-2xl mb-3">
            <FiUsers className="w-8 h-8" />
          </div>
          <h4 className="text-2xl font-black text-slate-800 tracking-tight">{division.total_members || 0}</h4>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Total Anggota Terdaftar</p>
          <p className="text-[11px] text-slate-400 mt-2 max-w-[200px]">Karyawan memegang hak akses fungsional di divisi ini</p>
        </div>

      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">Daftar Anggota Tim</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-3">Nama Anggota</th>
                <th className="px-6 py-3">Kontak Email</th>
                <th className="px-6 py-3">Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {division.members && division.members.length > 0 ? (
                division.members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                          {member.profile_picture ? (
                            <img src={member.profile_picture} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-brand/10 text-brand font-bold flex items-center justify-center text-[10px]">
                              {member.name ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{member.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <FiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{member.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        member.role?.toLowerCase() === 'admin' || member.role?.toLowerCase() === 'operator'
                          ? 'bg-indigo-50 text-brand border border-brand/10'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <FiShield className="w-3 h-3" />
                        {member.role}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-xs font-medium text-slate-400">
                    Belum ada anggota karyawan yang ditugaskan di divisi ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}