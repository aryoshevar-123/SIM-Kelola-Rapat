import pool from '../utils/db.js';

export const Meeting = {
    // 🔍 Ambil seluruh rapat berdasarkan segmentasi hak akses pengguna (Role-Based)
    findAll: async ({ userId, userRole }) => {
        let queryText = `
            SELECT
                m.*, r.name AS room_name, r.location_details AS room_location,
                u.name AS creator_name, u.email AS creator_email
            FROM meetings m
            LEFT JOIN rooms r ON m.room_id = r.id
            LEFT JOIN users u ON m.created_by = u.id
        `;
        let queryParams = [];

        if (userRole === 'admin') {
            queryText += ' ORDER BY m.date DESC, m.start_time ASC;';
        } else if (userRole === 'operator') {
            queryText += ` 
                LEFT JOIN attendance a ON m.id = a.meeting_id
                WHERE m.created_by = $1 OR a.user_id = $1
                GROUP BY m.id, r.id, u.id
                ORDER BY m.date DESC, m.start_time ASC;
            `;
            queryParams.push(userId);
        } else {
            queryText += ` 
                INNER JOIN attendance a ON m.id = a.meeting_id
                WHERE a.user_id = $1 AND (m.status != 'cancelled' AND m.status != 'canceled')
                ORDER BY m.date DESC, m.start_time ASC;
            `;
            queryParams.push(userId);
        }

        const result = await pool.query(queryText, queryParams);
        return result.rows;
    },

    // 🎯 Pencarian Detail Rapat Tunggal
    findOne: async (criteria, includeDetails = false) => {
        let queryText = includeDetails
            ? `SELECT m.*, r.name AS room_name, u.name AS creator_name, u.profile_picture AS creator_picture FROM meetings m LEFT JOIN rooms r ON m.room_id = r.id LEFT JOIN users u ON m.created_by = u.id WHERE `
            : `SELECT m.* FROM meetings m WHERE `;
        
        const values = [];
        if (criteria.id !== undefined) {
            queryText += 'm.id = $1;';
            values.push(criteria.id);
        } else {
            return null;
        }

        const result = await pool.query(queryText, values);
        return result.rows[0];
    },

    // ➕ Kueri Tambah Rapat (Menerima Klien Transaksi dari Controller)
    create: async (client, { title, description, date, start_time, end_time, room_id, online_link, createdBy }) => {
        if (room_id) {
            const overlapCheckText = `
                SELECT id FROM meetings
                WHERE room_id = $1 AND date = $2 AND status != 'canceled' AND status != 'cancelled'
                    AND ((start_time <= $3 AND end_time > $3) OR (start_time < $4 AND end_time >= $4) OR (start_time >= $3 AND end_time <= $4));
            `;
            const overlapCheck = await client.query(overlapCheckText, [room_id, date, start_time, end_time]);
            if (overlapCheck.rowCount > 0) return { success: false, type: 'ROOM_CONFLICT' };
        }

        const insertMeetingText = `
            INSERT INTO meetings (title, description, date, start_time, end_time, room_id, online_link, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        const result = await client.query(insertMeetingText, [
            title, description || null, date, start_time, end_time, room_id || null, online_link || null, createdBy
        ]);
        return { success: true, meeting: result.rows[0] };
    },

    // ✏️ Kueri Perbaruan Rapat (Menerima Klien Transaksi dari Controller)
    update: async (client, id, { title, description, date, start_time, end_time, room_id, online_link, status }, { userId, userRole }) => {
        const meetingResult = await client.query('SELECT * FROM meetings WHERE id = $1 FOR UPDATE', [id]);
        if (meetingResult.rowCount === 0) return { success: false, type: 'NOT_FOUND' };

        const meeting = meetingResult.rows[0];
        if (meeting.created_by !== userId && userRole !== 'admin') return { success: false, type: 'UNAUTHORIZED' };
        if (meeting.status === 'completed') return { success: false, type: 'COMPLETED_LOCKED' };

        const finalStatus = status || meeting.status;

        if (room_id !== null && (finalStatus === 'scheduled' || finalStatus === 'ongoing')) {
            const actualRoomId = room_id !== undefined ? room_id : meeting.room_id;
            if (actualRoomId) {
                const overlapCheckText = `
                    SELECT id FROM meetings WHERE room_id = $1 AND date = $2 AND id != $3 AND status != 'canceled' AND status != 'cancelled'
                        AND ((start_time <= $4 AND end_time > $4) OR (start_time < $5 AND end_time >= $5) OR (start_time >= $4 AND end_time <= $5));
                `;
                const overlapCheck = await client.query(overlapCheckText, [
                    actualRoomId, date || meeting.date, id, start_time || meeting.start_time, end_time || meeting.end_time
                ]);
                if (overlapCheck.rowCount > 0) return { success: false, type: 'ROOM_CONFLICT' };
            }
        }

        const queryText = `
            UPDATE meetings 
            SET title = $1, description = $2, date = $3, start_time = $4, end_time = $5, room_id = $6, online_link = $7, status = $8 WHERE id = $9 RETURNING *;
        `;
        const updatedResult = await client.query(queryText, [
            title || meeting.title, description !== undefined ? description : meeting.description, date || meeting.date,
            start_time || meeting.start_time, end_time || meeting.end_time, room_id !== undefined ? room_id : meeting.room_id,
            online_link !== undefined ? online_link : meeting.online_link, finalStatus, id
        ]);

        return { success: true, meeting: updatedResult.rows[0] };
    },

    // 🗑️ Hapus Rapat Permanen
    delete: async (id, { userId, userRole }) => {
        const meeting = await Meeting.findOne({ id });
        if (!meeting) return { success: false, type: 'NOT_FOUND' };
        if (meeting.created_by !== userId && userRole !== 'admin') return { success: false, type: 'UNAUTHORIZED' };
        if (meeting.status !== 'canceled' && meeting.status !== 'cancelled') return { success: false, type: 'NOT_CANCELED' };

        await pool.query('DELETE FROM meetings WHERE id = $1', [id]);
        return { success: true };
    },

    // ==========================================
    // ⚡ INTER-DOMAIN HELPERS (UNTUK DOMAIN ROOM)
    // ==========================================

    // 🏁 Ambil list ID Ruangan yang sedang terpakai saat ini (Real-time status)
    findOccupiedRoomIds: async () => {
        const queryText = `
            SELECT DISTINCT room_id FROM meetings 
            WHERE date = CURRENT_DATE AND NOW()::time BETWEEN start_time AND end_time AND status != 'canceled' AND status != 'cancelled';
        `;
        const result = await pool.query(queryText);
        return result.rows.map(row => row.room_id);
    },

    // 📊 Ambil tumpukan agenda rapat mendatang khusus milik satu ruangan
    findDetailsByRoom: async (roomId) => {
        const queryText = `
            SELECT 
                COUNT(*)::int AS today_meetings_count,
                COALESCE(
                    json_agg(json_build_object(
                        'id', m.id, 'title', m.title, 'date', m.date, 'start_time', m.start_time, 'end_time', m.end_time, 'organizer_name', u.name
                     ) ORDER BY m.date ASC, m.start_time ASC) FILTER (WHERE m.id IS NOT NULL), '[]'
                ) AS meetings_list
            FROM meetings m
            LEFT JOIN users u ON m.created_by = u.id
            WHERE m.room_id = $1 AND m.date >= CURRENT_DATE;
        `;
        const result = await pool.query(queryText, [roomId]);
        return result.rows[0] || { today_meetings_count: 0, meetings_list: [] };
    },

    // 🔢 Hitung agenda rapat masa depan (Untuk validasi penghapusan ruangan)
    countFutureByRoom: async (client, roomId) => {
        const queryText = `
            SELECT COUNT(*)::int AS future_count FROM meetings 
            WHERE room_id = $1 AND (date > CURRENT_DATE OR (date = CURRENT_DATE AND end_time > NOW()::time)) AND status != 'canceled' AND status != 'cancelled';
        `;
        const result = await client.query(queryText, [roomId]);
        return result.rows[0].future_count;
    },

    // 🔗 Putus relasi (Set NULL) rapat masa lalu jika ruangan dihapus
    detachPastByRoom: async (client, roomId) => {
        await client.query('UPDATE meetings SET room_id = NULL WHERE room_id = $1;', [roomId]);
    }
};