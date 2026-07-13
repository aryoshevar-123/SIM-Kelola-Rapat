import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import axios from 'axios';
import { 
  FiArrowLeft, FiSave, FiAlertCircle, FiUsers, 
  FiVideo, FiMapPin, FiSearch, FiCalendar, FiClock 
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.jsx';

export default function MeetingCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [meetingType, setMeetingType] = useState('offline'); 
  const [roomId, setRoomId] = useState('');
  const [onlineLink, setOnlineLink] = useState('');

  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchParticipantQuery, setSearchParticipantQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  const { data: rooms = [] } = useQuery({
    queryKey: ['roomsDropdown'],
    queryFn: async () => {
      const response = await axios.get('/api/rooms');
      return response.data.rooms || response.data;
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['usersDropdown'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data.users || response.data;
    }
  });

  const { mutate: createMeeting, isPending } = useMutation({
    mutationFn: async (newMeetingData) => {
      const response = await axios.post('/api/meetings', newMeetingData);
      return response.data;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      showToast("Jadwal rapat baru berhasil diagendakan!", "success");
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      navigate('/meetings');
    },
    onError: (error) => {
      setIsModalOpen(false);
      const msg = error.response?.data?.message || "Gagal menjadwalkan rapat.";
      setServerError(msg);
      showToast(msg, "error");
    }
  });

  const handleParticipantCheckboxChange = (userId) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = "Topik agenda rapat wajib diisi!";
    if (!date) newErrors.date = "Tanggal pelaksanaan wajib diisi!";
    if (!startTime) newErrors.startTime = "Jam mulai wajib diisi!";
    if (!endTime) newErrors.endTime = "Jam selesai wajib diisi!";

    if (startTime && endTime && startTime >= endTime) {
      newErrors.startTime = "Jam mulai harus lebih awal daripada jam selesai!";
    }

    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        newErrors.date = "Tidak dapat menjadwalkan rapat pada tanggal masa lalu!";
      }
    }

    if (meetingType === 'offline' && !roomId) {
      newErrors.roomId = "Silakan pilih ruangan fisik tempat rapat diselenggarakan!";
    }
    if (meetingType === 'online' && !onlineLink.trim()) {
      newErrors.onlineLink = "Tautan pertemuan virtual (Zoom/GMeet) wajib diisi!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});     

    if (!validateForm()) return;

    setIsModalOpen(true);
  };

  const filteredParticipants = users.filter(user => 
    user.name?.toLowerCase().includes(searchParticipantQuery.toLowerCase()) ||
    user.division_name?.toLowerCase().includes(searchParticipantQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => navigate('/meetings')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Jadwalkan Rapat Baru</h2>
          <p className="text-xs text-slate-400 font-medium">Buat reservasi waktu, alokasi ruangan, dan undang anggota tim</p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium animate-fadeIn">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="flex flex-col gap-1.5 md:col-span-4">
            <label className="text-xs font-semibold text-slate-600">Topik / Judul Rapat *</label>
            <input 
              type="text" 
              placeholder="Contoh: Sinkronisasi Sprint Mingguan Tim Developer"
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                errors.title ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <FiCalendar className="text-slate-400" /> Tanggal Rapat *
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors({ ...errors, date: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white transition-colors ${
                errors.date ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.date && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.date}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <FiClock className="text-slate-400" /> Jam Mulai *
            </label>
            <input 
              type="time" 
              value={startTime} 
              onChange={(e) => {
                setStartTime(e.target.value);
                if (errors.startTime) setErrors({ ...errors, startTime: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white transition-colors ${
                errors.startTime ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-brand"
              }`}
            />
            {errors.startTime && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.startTime}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <FiClock className="text-slate-400" /> Jam Selesai *
            </label>
            <input 
              type="time" 
              value={endTime} 
              onChange={(e) => {
                setEndTime(e.target.value);
                if (errors.endTime) setErrors({ ...errors, endTime: '' }); 
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none bg-white transition-colors ${
                errors.endTime ? "border-slate-200 focus:border-brand" : "border-slate-200 focus:border-brand"
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-4">
            <label className="text-xs font-semibold text-slate-600">Deskripsi / Agenda Pembahasan (Opsional)</label>
            <textarea 
              rows="3"
              placeholder="Tulis poin-poin agenda rapat yang akan dibahas..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Metode Pertemuan *</label>
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              <button
                type="button"
                onClick={() => { setMeetingType('offline'); setOnlineLink(''); setErrors({}); }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                  meetingType === 'offline' 
                    ? 'bg-brand/5 border-brand text-brand shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FiMapPin className="w-4 h-4" /> Offline Terpusat
              </button>
              <button
                type="button"
                onClick={() => { setMeetingType('online'); setRoomId(''); setErrors({}); }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                  meetingType === 'online' 
                    ? 'bg-brand/5 border-brand text-brand shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FiVideo className="w-4 h-4" /> Rapat Virtual (Online)
              </button>
            </div>
          </div>

          {meetingType === 'offline' && (
            <div className="flex flex-col gap-1.5 max-w-xl animate-fadeIn">
              <label className="text-xs font-semibold text-slate-600">Alokasi Ruangan Rapat *</label>
              <select
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  if (errors.roomId) setErrors({ ...errors, roomId: '' });
                }}
                className={`w-full px-3 py-2 border bg-white rounded-lg text-sm focus:outline-none transition-colors ${
                  errors.roomId ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-brand"
                }`}
              >
                <option value="">-- Pilih Ruangan Fisik Tersedia --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} (Kapasitas: {room.capacity} Orang)
                  </option>
                ))}
              </select>
              {errors.roomId && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.roomId}</p>}
            </div>
          )}

          {meetingType === 'online' && (
            <div className="flex flex-col gap-1.5 max-w-xl animate-fadeIn">
              <label className="text-xs font-semibold text-slate-600">Tautan Rapat Virtual (Link Meeting) *</label>
              <input
                type="text"
                placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                value={onlineLink}
                onChange={(e) => {
                  setOnlineLink(e.target.value);
                  if (errors.onlineLink) setErrors({ ...errors, onlineLink: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                  errors.onlineLink ? "border-rose-400 focus:border-rose-500 bg-rose-50/10" : "border-slate-200 focus:border-brand"
                }`}
              />
              {errors.onlineLink && <p className="text-[11px] text-rose-500 font-medium mt-0.5 flex items-center gap-1"><FiAlertCircle /> {errors.onlineLink}</p>}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FiUsers className="w-4 h-4 text-brand" />
              Undang Partisipan Anggota (Opsional)
            </label>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Cari dan beri centang pada karyawan yang wajib menghadiri agenda rapat ini
            </p>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FiSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari nama karyawan atau divisi penempatan..."
              value={searchParticipantQuery}
              onChange={(e) => setSearchParticipantQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand focus:bg-white transition-all"
            />
          </div>

          <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto bg-white p-2 divide-y divide-slate-50 shadow-inner">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((user) => (
                <label 
                  key={user.id} 
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    selectedParticipants.includes(user.id) ? 'bg-brand/5 text-brand' : 'text-slate-600 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(user.id)}
                      onChange={() => handleParticipantCheckboxChange(user.id)}
                      className="accent-brand w-3.5 h-3.5 cursor-pointer rounded-sm"
                    />
                    <span className="truncate font-semibold text-slate-700">{user.name}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] shrink-0 font-medium">
                    {user.division_name || 'Umum'}
                  </span>
                </label>
              ))
            ) : (
              <p className="p-4 text-center text-xs font-medium text-slate-400">Karyawan tidak ditemukan</p>
            )}
          </div>
          
          {selectedParticipants.length > 0 && (
            <p className="text-[11px] text-brand font-semibold animate-fadeIn">
             {selectedParticipants.length} Anggota tim masuk daftar undangan notifikasi.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/meetings')}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors shadow-sm cursor-pointer disabled:bg-slate-300"
          >
            <FiSave className="w-4 h-4" />
            {isPending ? "Menyimpan..." : "Agendakan Rapat"}
          </button>
        </div>

      </form>
      
      <ConfirmationModal
        type="brand"
        isOpen={isModalOpen}
        isPending={isPending}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          createMeeting({
            title,
            description: description.trim() || null,
            date,
            start_time: startTime,
            end_time: endTime,
            room_id: meetingType === 'offline' && roomId ? parseInt(roomId) : null,
            online_link: meetingType === 'online' && onlineLink.trim() ? onlineLink.trim() : null,
            participant_ids: selectedParticipants 
          });
        }}
        title="Konfirmasi Reservasi Rapat"
        message={`Sistem akan melakukan verifikasi ketersediaan jadwal serta menyebarkan notifikasi undangan rapat kepada ${selectedParticipants.length} peserta terpilih.`}
        confirmLabel="Ya, Agendakan"
      />

    </div>
  );
}