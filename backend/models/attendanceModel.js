import pool from "../utils/db.js";

export const Attendance = {
    // 🔍 Ambil daftar absensi per Rapat
    findAllByMeeting: async (meetingId) => {
        const queryText = `
            SELECT
                a.id AS attendance_id, a.meeting_id, a.user_id, a.status AS attendance_status,
                u.name AS user_name, u.email AS user_email
            FROM attendance a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.meeting_id = $1
            ORDER BY u.name ASC;
        `;
        const result = await pool.query(queryText, [meetingId]);
        return result.rows;
    },

    // 🎯 Ambil detail absensi tunggal dengan informasi rapat pembungkusnya
    findOneWithMeetingContext: async (id) => {
        const queryText = `
            SELECT a.*, m.status AS meeting_status, m.created_by
            FROM attendance a
            INNER JOIN meetings m ON a.meeting_id = m.id
            WHERE a.id = $1;
        `;
        const result = await pool.query(queryText, [id]);
        return result.rows[0];
    },

    // ✏️ Ganti Status Presensi Karyawan secara individual
    update: async (id, status) => {
        const queryText = `
            UPDATE attendance 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await pool.query(queryText, [status.toLowerCase(), id]);
        return result.rows[0];
    },

    // ⚡ INJEKSI MASSAL: Menyimpan data absensi peserta baru saat rapat dibuat (Transaction)
    createMass: async (client, meetingId, userIds) => {
        const queryText = `
            INSERT INTO attendance (meeting_id, user_id, status)
            SELECT $1, unnest($2::int[]), 'absent';
        `;
        await client.query(queryText, [meetingId, userIds]);
    },

    // ⚡ UPSERT MASSAL: Mencegah error duplikasi baris saat melakukan update peserta rapat (Transaction)
    upsertMass: async (client, meetingId, userIds) => {
        const queryText = `
            INSERT INTO attendance (meeting_id, user_id, status)
            SELECT $1, unnest($2::int[]), 'absent'
            ON CONFLICT (meeting_id, user_id) DO NOTHING;
        `;
        await client.query(queryText, [meetingId, userIds]);
    }
};