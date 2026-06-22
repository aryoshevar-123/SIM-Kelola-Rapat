import pool from "../utils/db.js";

export const getAttendanceByMeeting = async (req, res) => {
    const { meetingId } = req.params;
    const { id: userId, role: userRole } = req.user;

    try {
        const meetingCheck = await pool.query('SELECT created_by FROM meetings WHERE id = $1', [meetingId]);
        if (meetingCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const queryText = `
            SELECT
                a.id AS attendance_id,
                a.meeting_id,
                a.user_id,
                a.status AS attendance_status,
                u.name AS user_name,
                u.email AS user_email
            FROM attendance a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.meeting_id = $1
            ORDER BY u.name ASC;
        `;
        const result = await pool.query(queryText, [meetingId]);

        if (userRole !== 'admin' && meetingCheck.rows[0].created_by !== userId) {
            const isParticipant = result.rows.some(row => row.user_id === userId);
            if (!isParticipant) {
                return res.status(403).json({ message: 'Access denied. You are not part of this meeting.' });
            }
        }

        res.status(200).json({
            status: 'Success',
            results: result.rowCount,
            attendance: result.rows
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in getAttendanceByMeeting controller.' });
    }
};

export const updateAttendance = async (req, res) => {
    const { id } = req.params; 
    const { status } = req.body; 

    const validStatuses = ['present', 'absent', 'permission', 'late'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid attendance status. Choose present, absent, permission, or late.' });
    }

    try {
        const attendanceCheckText = `
            SELECT a.*, m.status AS meeting_status, m.created_by
            FROM attendance a
            INNER JOIN meetings m ON a.meeting_id = m.id
            WHERE a.id = $1;
        `;
        const attendanceCheck = await pool.query(attendanceCheckText, [id]);
        
        if (attendanceCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }

        const attendance = attendanceCheck.rows[0];

        if (attendance.meeting_status === 'completed' || attendance.meeting_status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot update attendance. The meeting has already been locked or cancelled.' });
        }

        if (req.user.role !== 'admin' && attendance.created_by !== req.user.id && attendance.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this attendance record.' });
        }

        const queryText = `
            UPDATE attendance 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await pool.query(queryText, [status.toLowerCase(), id]);

        res.status(200).json({
            message: 'Attendance status updated successfully',
            attendance: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error in updateAttendance controller.' });
    }
};