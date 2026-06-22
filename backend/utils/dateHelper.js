export const getTodayDateString = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000; // Selisih menit ke milidetik
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString();
    return localISOTime.split('T')[0]; // Mengambil bagian 'YYYY-MM-DD'
};

export const isPastDate = (dateStr) => {
    const today = getTodayDateString();
    return dateStr < today;
};