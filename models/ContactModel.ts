import { PrismaClient, ContactStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createContactMessage = async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) => {
    return prisma.contactMessage.create({
        data
    });
};

export const getAllMessages = async () => {
    return prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

export const updateMessageStatus = async (
    id: number,
    status: ContactStatus
) => {
    return prisma.contactMessage.update({
        where: { id },
        data: { status }
    });
};