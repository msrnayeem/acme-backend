import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export const createNotification = async (data: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
}) => {
    return prisma.notification.create({
        data,
        include: { user: true },
    });
};

export const getUserNotifications = async (userId: number) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};

export const markNotificationAsRead = async (id: number, userId: number) => {
    return prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
    });
};

export const markAllNotificationsAsRead = async (userId: number) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
};

export const deleteNotification = async (id: number, userId: number) => {
    return prisma.notification.deleteMany({
        where: { id, userId },
    });
};

export const getUnreadCount = async (userId: number) => {
    return prisma.notification.count({
        where: { userId, isRead: false },
    });
};