import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FiArrowLeft, FiEdit2, FiUsers, FiMapPin, FiCalendar, FiClock, FiAlertCircle, FiActivity } from 'react-icons/fi';

export default function RoomDetailsPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const { data: room, isLoading, isError, error } = useQuery({
    queryKey: ['roomDetails', id],
    queryFn: async () => {
      const response = await axios.get(`/api/rooms/details/${id}`);
      return response.data.room; 
    }
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Menghitung matriks jadwal dan utilitas ruangan...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium max-w-3xl mx-auto">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Gagal memuat detail ruangan: {error.response?.data?.message || error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/rooms')}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{room.name}</h2>
            <p className="text-xs text-slate-400 font-medium">Spesifikasi logistik dan manifes jadwal penggunaan ruangan</p>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/rooms/edit/${room.id}`)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
          Edit Profil Ruangan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fasilitas & Spesifikasi</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-100 rounded-xl">
              <div className="p-2 bg-white border border-slate-100 rounded-lg text-slate-500 shrink-0">
                <FiUsers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Daya Tampung</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{room.capacity} Orang Maksimal</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-100 rounded-xl">
              <div className="p-2 bg-white border border-slate-100 rounded-lg text-slate-500 shrink-0">
                <FiActivity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Kondisi Saat Ini</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold mt-1.5 ${
                  room.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'Tersedia' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {room.status}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-start gap-3">
            <div className="p-2 bg-indigo-50/50 text-brand rounded-lg shrink-0">
              <FiMapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Keterangan Lokasi / Hub</p>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1">
                {room.location_details}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full translate-x-10 -translate-y-10" />
          <div className="p-4 bg-indigo-50 text-brand rounded-2xl mb-3">
            <FiCalendar className="w-8 h-8" />
          </div>
          <h4 className="text-3xl font-black text-slate-800 tracking-tight">{room.today_meetings_count || 0}</h4>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Rapat Diagendakan Hari Ini</p>
          <p className="text-[10px] text-slate-400 mt-2 max-w-[180px]">Frekuensi okupansi penggunaan ruangan pada tanggal berjalan</p>
        </div>

      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">Manifesto Jadwal Penggunaan Ruangan</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-3">Topik Agenda / Rapat</th>
                <th className="px-6 py-3">Tanggal Pelaksanaan</th>
                <th className="px-6 py-3">Alokasi Waktu (WIB)</th>
                <th className="px-6 py-3">Penyelenggara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {room.meetings && room.meetings.length > 0 ? (
                room.meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-slate-50/50 transition-colors text-xs font-medium">
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{meeting.title}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      <span>
                        {new Date(meeting.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-100 px-2 py-1 rounded-md w-max">
                        <FiClock className="w-3 h-3 text-slate-400" />
                        <span>{meeting.start_time.substring(0, 5)} - {meeting.end_time.substring(0, 5)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      <span>{meeting.organizer_name || 'System Admin'}</span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-xs font-medium text-slate-400">
                    Belum ada agenda rapat yang dijadwalkan menggunakan ruangan ini dalam waktu dekat.
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