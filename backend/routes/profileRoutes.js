import express from 'express';
import multer from 'multer';
import { updateMyProfile, getMyProfile, updateMyPassword } from '../controllers/profileController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }
});

router.use(protectRoute);

router.get('/', getMyProfile);
router.put('/', upload.single('profile_picture'), updateMyProfile);
router.put('/password', updateMyPassword);