import { Attendance } from "../models/attendanceModel.js";
import { Meeting } from "../models/meetingModel.js";

export const getAttendanceByMeeting = async (req, res) => {
    const { meetingId } = req.params;
    const { id: userId, role: userRole } = req.user;
    try {
        const meeting = await Meeting.findOne({ id: meetingId });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const attendance = await Attendance.findAllByMeeting(meetingId);

        if (userRole !== 'admin' && meetingCheck.rows[0].created_by !== userId) {
            const isParticipant = attendance.some(row => row.user_id === userId);
            if (!isParticipant) return res.status(403).json({ message: 'Access denied. You are not part of this meeting.' });
        }

        res.status(200).json({ status: 'Success', results: attendance.length, attendance });
    } catch (error) {
        console.error("Error in getAttendanceByMeeting Controller:", error.message);
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
        const attendance = await Attendance.findOneWithMeetingContext(id);
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found.' });

        if (attendance.meeting_status === 'completed' || attendance.meeting_status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot update attendance. The meeting has already been locked or cancelled.' });
        }

        if (req.user.role !== 'admin' && attendance.created_by !== req.user.id && attendance.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this attendance record.' });
        }

        const updatedAttendance = await Attendance.update(id, status);
        res.status(200).json({ message: 'Attendance status updated successfully', attendance: updatedAttendance });
    } catch (error) {
        console.error("Error in updateAttendance Controller:", error.message);
        res.status(500).json({ error: 'Error in updateAttendance controller.' });
    }
};