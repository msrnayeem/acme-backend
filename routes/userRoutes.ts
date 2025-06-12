import express from 'express';
import {
    getUserProfile,
    getUsers,
    updateUser,
    deleteUser,
    getUserStatistics
} from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/statsofusers', authenticate, getUserStatistics);

// Protected routes - require authentication
router.get('/profile', authenticate, getUserProfile);
router.get('/', authenticate, getUsers);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;