import express from 'express';
import { 
    getNotifications, 
    getNotificationDetails,
    markAsRead, 
    markAllAsRead,
    deleteAllReadNotifications 
} from '../controllers/notificationController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getNotifications);
router.put('/mark-all', markAllAsRead);
router.delete('/clear-read', deleteAllReadNotifications); 

router.get('/:id', getNotificationDetails); 
router.put('/:id/read', markAsRead);

export default router;