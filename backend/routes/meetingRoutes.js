import express from 'express';
import {
    getMeetings,
    getMeetingDetails,
    createMeeting,
    updateMeeting,
    deleteMeeting
} from '../controllers/meetingController.js';
import { protectRoute, authorizeRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getMeetings);
router.get('/:id', getMeetingDetails);

router.post('/', authorizeRoute('admin', 'operator'), createMeeting);
router.put('/:id', authorizeRoute('admin', 'operator'), updateMeeting);
router.delete('/:id', authorizeRoute('admin', 'operator'), deleteMeeting);

export default router;