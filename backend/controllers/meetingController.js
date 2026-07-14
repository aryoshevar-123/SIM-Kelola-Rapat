import { Meeting } from '../models/meetingModel.js';
import { Attendance } from '../models/attendanceModel.js';
import { Notification } from '../models/notificationModel.js';
import { isPastDate } from '../utils/dateHelper.js';
import pool from '../utils/db.js';

export const getMeetings = async (req, res) => {
    const { id: userId, role: userRole } = req.user;
    try {
        const meetings = await Meeting.findAll({ userId, userRole });
        res.status(200).json({ status: 'Success', results: meetings.length, meetings });
    } catch (error) {
        console.error("Error in getMeetings Controller:", error.message);
        res.status(500).json({ error: 'Error in getMeetings controller.' });
    }
};

export const getMeetingDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const meeting = await Meeting.findOne({ id }, true);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        res.status(200).json({ status: 'Success', meeting });
    } catch (error) {
        console.error("Error in getMeetingDetails Controller:", error.message);
        res.status(500).json({ error: 'Error in getMeetingDetails controller.' });
    }
};

export const createMeeting = async (req, res) => {
    const { title, description, date, start_time, end_time, room_id, online_link, participant_ids } = req.body;

    if (!title || !date || !start_time || !end_time) return res.status(400).json({ message: 'Title, date, start time, and end time are required' });
    if (isPastDate(date)) return res.status(400).json({ message: 'Cannot schedule a meeting on a past date' });
    if (start_time >= end_time) return res.status(400).json({ message: 'Start time must be earlier than end time' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await Meeting.create(client, { title, description, date, start_time, end_time, room_id, online_link, createdBy: req.user.id });

        if (!result.success && result.type === 'ROOM_CONFLICT') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Room is already reserved for another meeting.' });
        }

        if (participant_ids && Array.isArray(participant_ids) && participant_ids.length > 0) {
            await Attendance.createMass(client, result.meeting.id, participant_ids);
            await Notification.createMass(client, {
                senderId: req.user.id, receiverIds: participant_ids, type: 'invitation', message: `Anda diundang ke agenda rapat baru: "${title}"`
            });
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Meeting scheduled successfully', meeting: result.meeting });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error in createMeeting Controller transaction:", error.message);
        res.status(500).json({ error: 'Error in createMeeting controller' });
    } finally {
        client.release();
    }
};

export const updateMeeting = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, start_time, end_time, room_id, online_link, status, participant_ids } = req.body;

    if (date && isPastDate(date)) return res.status(400).json({ message: 'Cannot update meeting to a past date.' });
    if (start_time && end_time && start_time >= end_time) return res.status(400).json({ message: 'Start time must be earlier than end time' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await Meeting.update(client, id, { title, description, date, start_time, end_time, room_id, online_link, status }, { userId: req.user.id, userRole: req.user.role });

        if (!result.success) {
            await client.query('ROLLBACK');
            if (result.type === 'NOT_FOUND') return res.status(404).json({ message: 'Meeting not found' });
            if (result.type === 'UNAUTHORIZED') return res.status(403).json({ message: 'Unauthorized to update this meeting schedule' });
            if (result.type === 'COMPLETED_LOCKED') return res.status(400).json({ message: 'This meeting has already been completed and locked.' });
            if (result.type === 'ROOM_CONFLICT') return res.status(400).json({ message: 'Room booking conflict with another scheduled meeting.' });
        }

        if (participant_ids && Array.isArray(participant_ids) && participant_ids.length > 0) {
            await Attendance.upsertMass(client, id, participant_ids);

            let notifType = 'update';
            let dynamicMsg = `Jadwal rapat "${title || result.meeting.title}" telah diperbarui.`;
            
            if (status === 'ongoing') {
                notifType = 'start';
                dynamicMsg = `Rapat "${title || result.meeting.title}" telah dimulai. Silakan segera bergabung!`;
            } else if (status === 'canceled' || status === 'cancelled') {
                notifType = 'canceled';
                dynamicMsg = `Rapat "${title || result.meeting.title}" telah dibatalkan oleh pihak penyelenggara.`;
            } else if (start_time || end_time || date) {
                notifType = 'reschedule';
                dynamicMsg = `Rapat "${title || result.meeting.title}" mengalami perubahan jadwal pelaksanaan.`;
            }

            await Notification.createMass(client, { senderId: req.user.id, receiverIds: participant_ids, type: notifType, message: dynamicMsg });
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Meeting updated successfully', meeting: result.meeting });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error in updateMeeting Controller transaction:", error.message);
        res.status(500).json({ error: 'Error in updateMeeting controller' });
    } finally {
        client.release();
    }
};

export const deleteMeeting = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Meeting.delete(id, { userId: req.user.id, userRole: req.user.role });

        if (!result.success) {
            if (result.type === 'NOT_FOUND') return res.status(404).json({ message: 'Meeting not found' });
            if (result.type === 'UNAUTHORIZED') return res.status(403).json({ message: 'Unauthorized to cancel this meeting' });
            if (result.type === 'NOT_CANCELED') return res.status(400).json({ message: 'Cannot delete an active meeting. Please cancel the meeting status first.' });
        }
        res.status(200).json({ message: 'Meeting deleted successfully from database' });
    } catch (error) {
        console.error("Error in deleteMeeting Controller:", error.message);
        res.status(500).json({ error: 'Error in deleteMeeting controller' });
    }
};