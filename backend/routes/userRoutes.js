import express from 'express';
import {
    getUsers,
    getUserDetails,
    createUserByAdmin,
    updateUser,
    deleteUser,
    toggleUserActivation
} from '../controllers/userController.js';
import { protectRoute, authorizeRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectRoute, authorizeRoute('admin'));

router.get('/', getUsers);
router.get('/:id', getUserDetails);
router.post('/', createUserByAdmin);
router.put('/:id', updateUser);
router.put('/:id/activate', toggleUserActivation);
router.delete('/:id', deleteUser);

export default router;