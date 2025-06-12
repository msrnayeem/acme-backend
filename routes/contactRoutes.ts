import express from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
    create,
    getAll,
    updateStatus,
} from '../controllers/ContactController';

const router = express.Router();

// Public route - anyone can submit a contact message
router.post('/', create);

// Protected routes - only authenticated users (admin) can access
router.get('/', authenticate, getAll);
router.patch('/:id/status', authenticate, updateStatus);

export default router;