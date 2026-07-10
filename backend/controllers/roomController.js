import pool from "../utils/db.js";

export const getRooms = async (req, res) => {
    try {
        const queryText = `
            SELECT 
                r.id,
                r.display_id,
                r.name,
                r.capacity,
                r.location_details,
                r.created_at,
                r.updated_at,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM meetings m
                        WHERE m.room_id = r.id
                          AND m.date = CURRENT_DATE
                          AND NOW()::time BETWEEN m.start_time AND m.end_time
                    ) THEN 'Sibuk'
                    ELSE 'Tersedia'
                 END AS status
            FROM rooms r
            ORDER BY r.name ASC;
        `;

        const result = await pool.query(queryText);
    
        res.status(200).json({
            status: 'Success',
            results: result.rows.length,
            rooms: result.rows
        });
    } catch (error) {
        console.error("Error in getRooms:", error.message);
        res.status(500).json({ error: 'Error in getRooms controller' });
    }
};

export const getRoomDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
            SELECT 
                r.id, r.display_id, r.name, r.capacity, r.location_details, r.created_at, r.updated_at,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM meetings m 
                        WHERE m.room_id = r.id AND m.date = CURRENT_DATE AND NOW()::time BETWEEN m.start_time AND m.end_time
                    ) THEN 'Sibuk' ELSE 'Tersedia' 
                END AS status,
                (SELECT COUNT(*)::int FROM meetings m WHERE m.room_id = r.id AND m.date = CURRENT_DATE) AS today_meetings_count,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'id', m.id,
                        'title', m.title,
                        'date', m.date,
                        'start_time', m.start_time,
                        'end_time', m.end_time,
                        'organizer_name', u.name
                     ) ORDER BY m.date ASC, m.start_time ASC)
                     FROM meetings m
                     LEFT JOIN users u ON m.created_by = u.id
                     WHERE m.room_id = r.id AND m.date >= CURRENT_DATE
                    ), '[]'
                ) AS meetings
            FROM rooms r
            WHERE r.id = $1;
        `;
        const result = await pool.query(queryText, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        
        res.status(200).json({ status: 'Success', room: result.rows[0] });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Error in getRoomDetails controller' });

    }
};

export const getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({
            status: 'Success',
            room: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getRoomById controller' });
    }
};

export const createRoom = async (req, res) => {
    const { name, capacity, location_details } = req.body;

    if (!name || !capacity) {
        return res.status(400).json({ message: 'Room name and capacity are required' });
    }

    try {
        const roomExists = await pool.query('SELECT * FROM rooms WHERE name = $1', [name]);
        if (roomExists.rowCount > 0) {
            return res.status(400).json({ message: 'Room name already exists' });
        }

        const queryText = `
            INSERT INTO rooms (name, capacity, location_details) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const newRoom = await pool.query(queryText, [name, capacity, location_details || null]);

        res.status(201).json({
            message: 'Room created successfully',
            room: newRoom.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in createRoom controller' });
    }
};

export const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { name, capacity, location_details } = req.body;

    if (!name || !capacity) {
        return res.status(400).json({ message: 'Room name and capacity are required' });
    }

    try {
        const queryText = `
            UPDATE rooms 
            SET name = $1, capacity = $2, location_details = $3, updated_at = NOW() 
            WHERE id = $4 
            RETURNING *
        `;
        const result = await pool.query(queryText, [name, capacity, location_details || null, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({
            message: 'Room updated successfully',
            room: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateRoom controller' });
    }
};

export const deleteRoom = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const checkFutureMeetingsQuery = `
            SELECT COUNT(*)::int AS future_count 
            FROM meetings 
            WHERE room_id = $1 
              AND (
                date > CURRENT_DATE 
                OR (date = CURRENT_DATE AND end_time > NOW()::time)
              )
        `;
        const checkResult = await client.query(checkFutureMeetingsQuery, [id]);
        const futureMeetingsCount = checkResult.rows[0].future_count;

        if (futureMeetingsCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                message: `Tidak dapat menghapus ruangan. Masih terdapat ${futureMeetingsCount} agenda rapat mendatang yang dijadwalkan di ruangan ini.` 
            });
        }

        const detachPastMeetingsQuery = `
            UPDATE meetings 
            SET room_id = NULL 
            WHERE room_id = $1
        `;
        await client.query(detachPastMeetingsQuery, [id]);

        const deleteRoomQuery = 'DELETE FROM rooms WHERE id = $1 RETURNING *';
        const deleteResult = await client.query(deleteRoomQuery, [id]);

        if (deleteResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Ruangan tidak ditemukan.' });
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Ruangan berhasil dihapus secara permanen, riwayat rapat masa lalu telah diamankan.',
            deletedRoom: deleteResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error dalam deleteRoom controller:", error.message);
        res.status(500).json({ error: 'Internal Server Error pada penghapusan ruangan' });
    } finally {
        client.release();
    }
};