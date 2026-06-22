import express from 'express';
import { getAttendanceByMeeting, updateAttendance } from '../controllers/attendanceController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/meeting/:meetingId', getAttendanceByMeeting);
router.put('/:id', updateAttendance);

export default router;