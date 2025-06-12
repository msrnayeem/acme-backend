import express from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getUnreadNotificationCount,
} from '../controllers/NotificationController';

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authenticate);

// Get all notifications for the authenticated user
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadNotificationCount);

// Mark a specific notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete a specific notification
router.delete('/:id', removeNotification);

export default router;