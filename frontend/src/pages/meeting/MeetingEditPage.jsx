import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { 
  FiArrowLeft, FiSave, FiAlertCircle, FiUsers, 
  FiVideo, FiMapPin, FiSearch, FiCalendar, FiClock, FiActivity 
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function MeetingEditPage() {
  const { id } = useParams(); // 🆔 Ambil ID Meeting dari URL
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // 📝 STATE INPUT FORM
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('');
  
  // 🔮 STATE HIBRIDA
  const [meetingType, setMeetingType] = useState('offline'); 
  const [roomId, setRoomId] = useState('');
  const [onlineLink, setOnlineLink] = useState('');

  // 👥 STATE PESERTA
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchParticipantQuery, setSearchParticipantQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  // 📡 1. FETCH DATA: Detail Rapat Utama
  const { data: meeting, isLoading: isLoadingMeeting } = useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      const response = await axios.get(`/api/meetings/${id}`);
      return response.data.meeting;
    }
  });

  // 📡 2. FETCH DATA: Daftar Ruangan
  const { data: rooms = [] } = useQuery({
    queryKey: ['roomsDropdown'],
    queryFn: async () => {
      const response = await axios.get('/api/rooms');
      return response.data.rooms || response.data;
    }
  });

  // 📡 3. FETCH DATA: Daftar Karyawan
  const { data: users = [] } = useQuery({
    queryKey: ['usersDropdown'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data.users || response.data;
    }
  });

  // 📡 4. FETCH DATA: Partisipan Saat Ini (Attendance)
  const { data: currentAttendance = [] } = useQuery({
    queryKey: ['meetingAttendance', id],
    queryFn: async () => {
      const response = await axios.get(`/api/attendance/meeting/${id}`);
      return response.data.attendance || [];
    }
  });

  // 🔄 SINRONISASI DATA: Masukkan data DB ke State Form
  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title || '');
      setDescription(meeting.description || '');
      // Format tanggal YYYY-MM-DD untuk input date
      setDate(meeting.date ? meeting.date.split('T')[0] : '');
      // Format jam HH:mm untuk input time
      setStartTime(meeting.start_time?.substring(0, 5) || '');
      setEndTime(meeting.end_time?.substring(0, 5) || '');
      setStatus(meeting.status || 'scheduled');
      
      if (meeting.room_id) {
        setMeetingType('offline');
        setRoomId(meeting.room_id);
        setOnlineLink('');
      } else {
        setMeetingType('online');
        setOnlineLink(meeting.online_link || '');
        setRoomId('');
      }
    }
  }, [meeting]);

  // Sync Partisipan
  useEffect(() => {
    if (currentAttendance.length > 0) {
      const ids = currentAttendance.map(a => a.user_id);
      setSelectedParticipants(ids);
    }
  }, [currentAttendance]);

  // 📡 5. MUTASI DATA: PUT /api/meetings/:id
  const { mutate: updateMeeting, isPending } = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.put(`/api/meetings/${id}`, updatedData);
      return response.data;
    },
    onSuccess: (data) => {
      setIsModalOpen(false);
      showToast(data.message || "Perubahan jadwal rapat berhasil disimpan!", "success");
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', id] });
      navigate('/meetings');
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || "Gagal memperbarui rapat.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  const handleParticipantToggle = (userId) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Judul rapat wajib diisi!";
    if (!date) newErrors.date = "Tanggal wajib diisi!";
    if (!startTime || !endTime) newErrors.time = "Jam mulai & selesai wajib diisi!";
    if (startTime >= endTime) newErrors.time = "Waktu mulai harus lebih awal!";
    
    if (meetingType === 'offline' && !roomId) newErrors.roomId = "Pilih ruangan!";
    if (meetingType === 'online' && !onlineLink.trim()) newErrors.onlineLink = "Link virtual wajib diisi!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (isLoadingMeeting) return <div className="py-20 text-center animate-pulse text-slate-500">Menyinkronkan manifes rapat...</div>;

  const isCompleted = meeting?.status === 'completed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/meetings')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer">
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Agenda Rapat</h2>
          <p className="text-xs text-slate-400 font-medium">Lakukan penyesuaian jadwal, lokasi, atau pembatalan rapat</p>
        </div>
      </div>

      {isCompleted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-xs font-bold">
          <FiAlertCircle className="w-4 h-4" />
          <span>Rapat ini telah selesai dilaksanakan. Data telah dikunci dan tidak dapat diubah lagi.</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if(!isCompleted && validateForm()) setIsModalOpen(true); }} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Judul */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Topik Utama Rapat</label>
            <input 
              disabled={isCompleted}
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand outline-none disabled:bg-slate-50"
            />
            {errors.title && <p className="text-[10px] text-rose-500 font-bold">{errors.title}</p>}
          </div>

          {/* Status Rapat (🔥 Fitur Baru) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              Status Pelaksanaan
            </label>
            <select
              disabled={isCompleted}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-700 outline-none focus:border-brand disabled:opacity-60"
            >
              <option value="scheduled">Mendatang</option>
              <option value="canceled">Dibatalkan</option>
            </select>
          </div>

          {/* Tanggal */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Tanggal Pelaksanaan</label>
            <input 
              disabled={isCompleted}
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none disabled:bg-slate-50"
            />
          </div>

          {/* Jam */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Alokasi Waktu (Mulai - Selesai)</label>
            <div className="flex items-center gap-2">
              <input disabled={isCompleted} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
              <span className="text-slate-400 font-bold">-</span>
              <input disabled={isCompleted} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
            </div>
            {errors.time && <p className="text-[10px] text-rose-500 font-bold">{errors.time}</p>}
          </div>

          {/* Deskripsi */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Deskripsi Pembahasan</label>
            <textarea disabled={isCompleted} rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none resize-none" />
          </div>
        </div>

        {/* Metode Switching */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <label className="text-xs font-bold text-slate-700">Metode & Lokasi</label>
          <div className="flex gap-2">
            <button disabled={isCompleted} type="button" onClick={() => setMeetingType('offline')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold border rounded-xl transition-all ${meetingType === 'offline' ? 'bg-brand/5 border-brand text-brand' : 'bg-white text-slate-500'}`}>
              <FiMapPin /> Offline
            </button>
            <button disabled={isCompleted} type="button" onClick={() => setMeetingType('online')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold border rounded-xl transition-all ${meetingType === 'online' ? 'bg-brand/5 border-brand text-brand' : 'bg-white text-slate-500'}`}>
              <FiVideo /> Online
            </button>
          </div>

          {meetingType === 'offline' ? (
            <select disabled={isCompleted} value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm outline-none">
              <option value="">-- Pilih Ruangan --</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          ) : (
            <input disabled={isCompleted} type="text" placeholder="Tautan Rapat Virtual..." value={onlineLink} onChange={(e) => setOnlineLink(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" />
          )}
        </div>

        {/* Partisipan */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2"><FiUsers className="text-brand"/> Kelola Partisipan</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
            <input disabled={isCompleted} type="text" placeholder="Cari nama anggota..." value={searchParticipantQuery} onChange={(e) => setSearchParticipantQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white" />
          </div>
          <div className="border border-slate-200 rounded-xl max-h-40 overflow-y-auto p-2 divide-y divide-slate-50 shadow-inner">
            {users.filter(u => u.name.toLowerCase().includes(searchParticipantQuery.toLowerCase())).map(user => (
              <label key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <input disabled={isCompleted} type="checkbox" checked={selectedParticipants.includes(user.id)} onChange={() => handleParticipantToggle(user.id)} className="accent-brand" />
                  <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{user.division_name || 'Umum'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={() => navigate('/meetings')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg">Batal</button>
          {!isCompleted && (
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 px-6 py-2 bg-brand text-white text-sm font-bold rounded-lg hover:bg-brand-hover shadow-sm disabled:bg-slate-300">
              <FiSave /> {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          )}
        </div>
      </form>

      <ConfirmationModal
        type={status === 'canceled' ? 'danger' : 'brand'}
        isOpen={isModalOpen}
        isPending={isPending}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => updateMeeting({
          title, description, date, start_time: startTime, end_time: endTime,
          status,
          room_id: meetingType === 'offline' ? parseInt(roomId) : null,
          online_link: meetingType === 'online' ? onlineLink : null,
          participant_ids: selectedParticipants
        })}
        title="Konfirmasi Update Rapat"
        message={status === 'canceled' ? "Apakah Anda yakin ingin MEMBATALKAN rapat ini? Notifikasi pembatalan akan dikirim ke seluruh peserta." : "Simpan seluruh perubahan jadwal dan rincian rapat?"}
        confirmLabel={status === 'canceled' ? "Ya, Batalkan Rapat" : "Simpan"}
      />
    </div>
  );
}