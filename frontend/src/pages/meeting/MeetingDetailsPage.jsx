import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FiArrowLeft, FiEdit2, FiCalendar, FiClock, FiVideo, 
  FiMapPin, FiInfo, FiAlertCircle, FiUserCheck, FiPlay, FiCheckSquare 
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

export default function MeetingDetailsPage() {
  const { id } = useParams(); // 🆔 ID Meeting
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // 📡 1. FETCH DATA: Mengambil data pokok rincian rapat
  const { data: meeting, isLoading: isLoadingMeeting, isError: isErrorMeeting } = useQuery({
    queryKey: ['meetingDetails', id],
    queryFn: async () => {
      const response = await axios.get(`/api/meetings/${id}`);
      return response.data.meeting;
    }
  });

  // 📡 2. FETCH DATA: Mengambil daftar absensi
  const { data: attendanceData = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['meetingAttendance', id],
    queryFn: async () => {
      const response = await axios.get(`/api/attendance/meeting/${id}`);
      return response.data.attendance || [];
    }
  });

  // 📡 3. MUTASI DATA: Mengubah status internal rapat (scheduled -> ongoing -> completed)
  const { mutate: updateMeetingStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async (newStatus) => {
      // Menembak controller updateMeeting backend kamu
      const response = await axios.put(`/api/meetings/${id}`, { status: newStatus });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetingDetails', id] });
      showToast(data.message || "Status operational rapat berhasil diperbarui!", "success");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Gagal memperbarui status operasional rapat.";
      showToast(msg, "error");
    }
  });

  // 📡 4. MUTASI DATA: Memperbarui status catatan kehadiran per individu
  const { mutate: changeAttendanceStatus } = useMutation({
    mutationFn: async ({ attendanceId, status }) => {
      const response = await axios.put(`/api/attendance/${attendanceId}`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetingAttendance', id] });
      showToast(data.message || "Status kehadiran berhasil diperbarui!", "success");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Gagal mengubah status kehadiran.";
      showToast(msg, "error");
    }
  });

  // 🔮 MAPPING STRUKTUR STATUS KEHADIRAN (POSTGRESQL -> UI BADGE)
  const getAttendanceBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'absent': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'permission': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'late': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getAttendanceLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'Hadir';
      case 'absent': return 'Alpa';
      case 'permission': return 'Izin';
      case 'late': return 'Terlambat';
      default: return status;
    }
  };

  const getMeetingStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'scheduled': return 'Mendatang';
      case 'ongoing': return 'Berlangsung';
      case 'canceled': return 'Batal';
      default: return status;
    }
  };

  const getMeetingStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ongoing': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'canceled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (isLoadingMeeting || isLoadingAttendance) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Menghimpun data logistik rapat dan absensi...</p>
      </div>
    );
  }

  if (isErrorMeeting) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium max-w-3xl mx-auto">
        <FiAlertCircle className="w-5 h-5 shrink-0" />
        <span>Gagal memuat detail rapat: Rapat tidak ditemukan atau akses ditolak.</span>
      </div>
    );
  }

  const isMeetingLocked = meeting.status === 'completed' || meeting.status === 'canceled' || meeting.status === 'cancelled';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 🧭 NAVIGATION TOP BAR DENGAN SMART ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/meetings')}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{meeting.title}</h2>
            <p className="text-xs text-slate-400 font-medium">Informasi lengkap, logistik tempat, dan manajemen absensi</p>
          </div>
        </div>

        {/* 🎛️ AREA DYNAMIC ACTION CONTROLLER */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 🔥 TOMBOL 1: START MEETING (Hanya muncul jika status 'scheduled') */}
          {meeting.status === 'scheduled' && (
            <button
              onClick={() => updateMeetingStatus('ongoing')}
              disabled={isUpdatingStatus}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:bg-slate-300"
            >
              <FiPlay className="w-4 h-4" />
              Mulai Rapat
            </button>
          )}

          {/* 🔥 TOMBOL 2: FINISH MEETING (Hanya muncul jika status 'ongoing') */}
          {meeting.status === 'ongoing' && (
            <button
              onClick={() => updateMeetingStatus('completed')} // Mengacu pada status 'completed' pengunci database kamu
              disabled={isUpdatingStatus}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:bg-slate-300"
            >
              <FiCheckSquare className="w-4 h-4" />
              Selesai Rapat
            </button>
          )}

          {/* TOMBOL EDIT DATA (Diaktifkan jika rapat belum selesai / batal) */}
          {!isMeetingLocked && (
            <button 
              onClick={() => navigate(`/meetings/edit/${meeting.id}`)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              Edit Jadwal
            </button>
          )}

        </div>
      </div>

      {/* 📊 GRID UTAMA DETAIL RAPAT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* BLOK KIRI: Detail Informasi Rapat */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card Topik */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-md text-[10px] font-bold uppercase tracking-wider ${getMeetingStatusStyle(meeting.status)}`}>
                {getMeetingStatusLabel(meeting.status)}
              </span>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-2.5 leading-snug">
                {meeting.title}
              </h3>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiInfo className="w-3.5 h-3.5" /> Deskripsi Pembahasan
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {meeting.description || "Tidak ada deskripsi tertulis."}
              </p>
            </div>
          </div>

          {/* Card Lokasi Hibrida */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metode & Tempat Pertemuan</h4>
            {meeting.room_id ? (
              <div className="flex items-start gap-3.5 p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                <div className="p-2.5 bg-white border border-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Ruangan Fisik</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{meeting.room_name}</p>
                </div>
              </div>
            ) : meeting.online_link ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-sky-50/40 border border-sky-100 rounded-xl">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 bg-white border border-sky-100 text-sky-600 rounded-xl shrink-0">
                    <FiVideo className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Virtual Meeting</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 truncate max-w-xs">{meeting.online_link}</p>
                  </div>
                </div>
                <a href={meeting.online_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-lg shrink-0 text-center cursor-pointer hover:bg-sky-700 transition-colors">Gabung</a>
              </div>
            ) : <p className="text-xs italic text-slate-400">Belum diset</p>}
          </div>

        </div>

        {/* BLOK KANAN: Waktu & Penyelenggara */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu Pelaksanaan</h4>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <FiCalendar className="text-slate-400" />
              <span>{new Date(meeting.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <FiClock className="text-slate-400" />
              <span>{meeting.start_time?.substring(0, 5)} - {meeting.end_time?.substring(0, 5)} WIB</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Penyelenggara</h4>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center">
                {meeting.creator_name ? meeting.creator_name[0].toUpperCase() : '?'}
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">{meeting.creator_name || 'System Admin'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL MANAJEMEN ABSENSI & CATATAN KEHADIRAN */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FiUserCheck className="text-brand w-4 h-4" /> Manifes Kehadiran Anggota
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
            {attendanceData.length} Karyawan Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-3">Nama Karyawan</th>
                <th className="px-6 py-3">Status Saat Ini</th>
                <th className="px-6 py-3 text-right">Aksi Catatan Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.length > 0 ? (
                attendanceData.map((row) => (
                  <tr key={row.attendance_id} className="hover:bg-slate-50/40 transition-colors">
                    
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{row.user_name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{row.user_email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 border rounded-md text-[10px] font-bold ${getAttendanceBadge(row.attendance_status)}`}>
                        {getAttendanceLabel(row.attendance_status)}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      {isMeetingLocked ? (
                        <span className="text-[10px] text-slate-400 italic font-medium">Locked (Rapat Selesai/Batal)</span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={row.attendance_status}
                            onChange={(e) => changeAttendanceStatus({ 
                              attendanceId: row.attendance_id, 
                              status: e.target.value 
                            })}
                            className="text-[11px] font-bold bg-white border border-slate-200 rounded-lg p-1 text-slate-600 focus:outline-none focus:border-brand cursor-pointer"
                          >
                            <option value="present">Hadir</option>
                            <option value="absent">Alpa</option>
                            <option value="permission">Izin</option>
                            <option value="late">Terlambat</option>
                          </select>
                        </div>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-xs font-medium text-slate-400">
                    Tidak ada partisipan yang diundang dalam rapat ini.
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