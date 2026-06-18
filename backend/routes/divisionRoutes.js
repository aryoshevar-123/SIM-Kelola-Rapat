import express from 'express';
import {
    getDivisions,
    getDivisionDetails,
    createDivision,
    updateDivision,
    deleteDivision
} from '../controllers/divisionController.js';
import { protectRoute, authorizeRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protectRoute, getDivisions);
router.get('/:id', protectRoute, getDivisionDetails);

router.post('/', protectRoute, authorizeRoute('admin'), createDivision);
router.put('/:id', protectRoute, authorizeRoute('admin'), updateDivision);
router.delete('/:id', protectRoute, authorizeRoute('admin'), deleteDivision);

export default router;