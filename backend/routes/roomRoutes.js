import express from 'express';
import {
    getRooms,
    getRoomById,
    getRoomDetails,
    createRoom,
    updateRoom,
    deleteRoom
} from '../controllers/roomController.js';
import { protectRoute, authorizeRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protectRoute, getRooms);
router.get('/details/:id', protectRoute, getRoomDetails);
router.get('/:id', protectRoute, getRoomById);

router.post('/', protectRoute, authorizeRoute('admin'), createRoom);
router.put('/:id', protectRoute, authorizeRoute('admin'), updateRoom);
router.delete('/:id', protectRoute, authorizeRoute('admin'), deleteRoom);

export default router;