import express from 'express';
import {
    getRooms,
    getRoomDetails,
    createRoom,
    updateRoom,
    deleteRoom
} from '../controllers/roomController.js';
import { protectRoute, authorizeRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protectRoute, getRooms);
router.get('/:id', protectRoute, getRoomDetails);

router.post('/', protectRoute, authorizeRoute('admin'), createRoom);
router.put('/:id', protectRoute, authorizeRoute('admin'), updateRoom);
router.delete('/:id', protectRoute, authorizeRoute('admin'), deleteRoom);

export default router;