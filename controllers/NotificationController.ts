import { Request, Response } from 'express';
import {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
} from '../models/NotificationModel';
import { sendResponse, handleError, RequestHandler } from '../utils/responseHandler';

export const getNotifications: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const notifications = await getUserNotifications(userId);
        sendResponse(res, 200, true, notifications);
    } catch (error) {
        handleError(res, error);
    }
};

export const markAsRead: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const notificationId = Number(req.params.id);

        if (isNaN(notificationId)) {
            sendResponse(res, 400, false, null, 'Invalid notification ID');
            return;
        }

        await markNotificationAsRead(notificationId, userId);
        sendResponse(res, 200, true, null, 'Notification marked as read');
    } catch (error) {
        handleError(res, error);
    }
};

export const markAllAsRead: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        await markAllNotificationsAsRead(userId);
        sendResponse(res, 200, true, null, 'All notifications marked as read');
    } catch (error) {
        handleError(res, error);
    }
};

export const removeNotification: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const notificationId = Number(req.params.id);

        if (isNaN(notificationId)) {
            sendResponse(res, 400, false, null, 'Invalid notification ID');
            return;
        }

        await deleteNotification(notificationId, userId);
        sendResponse(res, 200, true, null, 'Notification deleted successfully');
    } catch (error) {
        handleError(res, error);
    }
};

export const getUnreadNotificationCount: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const count = await getUnreadCount(userId);
        sendResponse(res, 200, true, { count });
    } catch (error) {
        handleError(res, error);
    }
};