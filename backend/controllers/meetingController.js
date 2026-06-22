import pool from '../utils/db.js';
import { isPastDate } from '../utils/dateHelper.js';

export const getMeetings = async (req, res) => {
    try {
        const queryText = `
            SELECT
                m.*,
                r.name AS room_name,
                r.location_details AS room_location,
                u.name AS creator_name,
                u.email AS creator_email
            FROM meetings m
            LEFT JOIN rooms r ON m.room_id = r.id
            LEFT JOIN users u ON m.created_by = u.id
        `;

        let queryParams = [];

        if (userRole === 'admin') {
            queryText += 'ORDER BY m.date DESC, m.start_time ASC;';
        }
        else if (userRole === 'operator') {
            queryText += ` 
                LEFT JOIN attendance a ON m.id = a.meeting_id
                WHERE m.created_by = $1 OR a.user_id = $1
                GROUP BY m.id, r.id, u.id
                ORDER BY m.date DESC, m.start_time ASC;
            `;
            queryParams.push(userId);
        }
        else {
            queryText += ` 
                INNER JOIN attendance a ON m.id = a.meeting_id
                WHERE a.user_id = $1 AND m.status != 'cancelled'
                ORDER BY m.date DESC, m.start_time ASC;
            `;
            queryParams.push(userId);
        }

        const result = await pool.query(queryText, queryParams);

        res.status(200).json({
            status: 'Success',
            results: result.rows.length,
            meetings: result.rows
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getMeetings controller.' });
    }
};

export const getMeetingDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
            SELECT m.*, r.name AS room_name, u.name AS creator_name
            FROM meetings m
            LEFT JOIN rooms r ON m.room_id = r.id
            LEFT JOIN users u ON m.created_by = u.id
            WHERE m.id = $1;
        `;
        const result = await pool.query(queryText, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({ status: 'Success', meeting: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getMeetingDetails controller.' });
    }
};

export const createMeeting = async (req, res) => {
    const {
        title,
        description,
        date,
        start_time,
        end_time,
        room_id,
        online_link,
        participant_ids
    } = req.body;

    if (!title || !date || !start_time || !end_time) {
        return res.status(400).json({ message: 'Title, date, start time, and end time are required' });
    }

    if (isPastDate(date)) {
        return res.status(400).json({ message: 'Cannot schedule a meeting on a past date' });
    }

    if (start_time >= end_time) {
        return res.status(400).json({ message: 'Start time must be earlier than end time' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (room_id) {
            const overlapCheckText = `
                SELECT * FROM meetings
                WHERE room_id = $1
                    AND date = $2
                    AND status != 'canceled'
                    AND (
                        (start_time <= $3 AND end_time > $3) OR
                        (start_time < $4 AND end_time >= $4) OR  
                        (start_time >= $3 AND end_time <= $4)
                    );
            `;
            const overlapCheck = await pool.query(
                overlapCheckText, [room_id, date, start_time, end_time]
            );

            if (overlapCheck.rowCount > 0) {
                return res.status(400).json({
                    message: 'Room is already reserved for another meeting.'
                });
            }
        }

        const insertMeetingText = `
            INSERT INTO meetings (title, description, date, start_time, end_time, room_id, online_link, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const newMeeting = await pool.query(insertMeetingText, [
            title, 
            description || null, 
            date, 
            start_time, 
            end_time, 
            room_id || null, 
            online_link || null, 
            req.user.id
        ]);
        const meetingData = newMeeting.rows[0];

        if (participant_ids && Array.isArray(participant_ids) && participant_ids.length > 0) {
            const insertAttendanceText = `
                INSERT INTO attendance (meeting_id, user_id, status)
                SELECT $1, unnest($2::int[]), 'absent';
            `;
            await client.query(insertAttendanceText, [meetingData.id, participant_ids]);
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Meeting scheduled successfully',
            meeting: newMeeting.rows[0]
        })
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error.message);
        res.status(500).json({ error: 'Error in createMeeting controller' });
    } finally {
        client.release();
    }
};

export const updateMeeting = async (req, res) => {
    const { id } = req.params;
    const { 
        title, 
        description, 
        date, 
        start_time, 
        end_time, 
        room_id, 
        online_link, 
        status,
        participant_ids
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const meetingResult = await pool.query('SELECT * FROM meetings WHERE id = $1', [id]);
        if (meetingResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const meeting = meetingResult.rows[0];

        if (meeting.created_by !== req.user.id && req.user.role !== 'admin') {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Unauthorized to update this meeting schedule' });
        }

        if (meeting.status === 'completed') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'This meeting has already been completed and locked.' });
        }

        if (date && isPastDate(date)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Cannot update meeting to a past date.' });
        }

        const finalStatus = status || meeting.status;

        if (room_id !== null && (finalStatus === 'scheduled' || finalStatus === 'ongoing')){
            const actualRoomId = room_id !== undefined ? room_id : meeting.room_id;

            if (actualRoomId) {
                const overlapCheckText = `
                    SELECT * FROM meetings 
                    WHERE room_id = $1 
                        AND date = $2
                        AND id != $3
                        AND status != 'canceled'
                        AND (
                            (start_time <= $4 AND end_time > $4) OR
                            (start_time < $5 AND end_time >= $5) OR
                            (start_time >= $4 AND end_time <= $5)
                        );
                `;
                const overlapCheck = await pool.query(overlapCheckText, [
                    actualRoomId, 
                    date || meeting.date, 
                    id, 
                    start_time || meeting.start_time, 
                    end_time || meeting.end_time
                ]);

                if (overlapCheck.rowCount > 0) {
                    return res.status(400).json({ message: 'Room booking conflict with another scheduled meeting.' });
                }
            }
        }
        
        const queryText = `
            UPDATE meetings 
            SET 
                title = $1, 
                description = $2, 
                date = $3, 
                start_time = $4, 
                end_time = $5, 
                room_id = $6, 
                online_link = $7,
                status = $8
            WHERE id = $9
            RETURNING *;
        `;
        const updatedResult = await pool.query(queryText, [
            title || meeting.title, 
            description !== undefined ? description : meeting.description, 
            date || meeting.date, 
            start_time || meeting.start_time, 
            end_time || meeting.end_time, 
            room_id !== undefined ? room_id : meeting.room_id, 
            online_link !== undefined ? online_link : meeting.online_link,
            finalStatus,
            id
        ]);

        if (participant_ids && Array.isArray(participant_ids)) {
            const insertAttendanceText = `
                INSERT INTO attendance (meeting_id, user_id, status)
                SELECT $1, unnest($2::int[]), 'absent'
                ON CONFLICT (meeting_id, user_id) DO NOTHING;
            `;
            await client.query(insertAttendanceText, [id, participant_ids]);
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Meeting updated successfully',
            meeting: updatedResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateMeeting controller' });
    } finally {
        client.release();
    }
};

export const deleteMeeting = async (req, res) => {
    const { id } = req.params;
    try {
        const meetingResult = await pool.query('SELECT * FROM meetings WHERE id = $1', [id]);
        if (meetingResult.rowCount === 0) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        if (meetingResult.rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to cancel this meeting' });
        }
        
        const meeting = meetingResult.rows[0];

        if (meeting.status !== 'canceled') {
            return res.status(400).json({ 
                message: 'Cannot delete an active meeting. Please cancel the meeting status first before deleting it permanently.' 
            });
        }

        await pool.query('DELETE FROM meetings WHERE id = $1', [id]);
        res.status(200).json({ message: 'Meeting deleted successfully from database' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in deleteMeeting controller' });
    }
};