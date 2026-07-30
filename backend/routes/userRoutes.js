import express from 'express';
import {
    getUsers,
    getUserDetails,
    createUserByAdmin,
    updateUser,
    deleteUser,
    toggleUserActivation,
} from '../controllers/userController.js';
import { protectRoute, authorizeRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectRoute);

router.get('/', getUsers);
router.get('/:id', getUserDetails);

router.post('/',  authorizeRoute('admin'), createUserByAdmin);
router.put('/:id',  authorizeRoute('admin'), updateUser);
router.put('/:id/activate',  authorizeRoute('admin'), toggleUserActivation);
router.delete('/:id', authorizeRoute('admin'), deleteUser);

export default router;