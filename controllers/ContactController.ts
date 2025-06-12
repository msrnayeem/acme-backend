import { Request, Response } from 'express';
import { ContactStatus } from '@prisma/client';
import {
    createContactMessage,
    getAllMessages,
    updateMessageStatus,
} from '../models/ContactModel';
import { sendResponse, handleError, RequestHandler } from '../utils/responseHandler';

export const create: RequestHandler = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            sendResponse(res, 400, false, null, 'All fields are required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            sendResponse(res, 400, false, null, 'Invalid email format');
            return;
        }

        // Create message but don't include in response
        await createContactMessage({
            name,
            email,
            subject,
            message
        });

        // Send response with just status and message
        sendResponse(res, 201, true, null, 'Message sent successfully');
    } catch (error) {
        handleError(res, error);
    }
};

export const getAll: RequestHandler = async (req, res) => {
    try {
        const messages = await getAllMessages();
        sendResponse(res, 200, true, messages);
    } catch (error) {
        handleError(res, error);
    }
};

export const updateStatus: RequestHandler = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        if (isNaN(id)) {
            sendResponse(res, 400, false, null, 'Invalid message ID');
            return;
        }

        if (!Object.values(ContactStatus).includes(status)) {
            sendResponse(res, 400, false, null, 'Invalid status value');
            return;
        }

        const updatedMessage = await updateMessageStatus(id, status);
        sendResponse(res, 200, true, updatedMessage, 'Status updated successfully');
    } catch (error) {
        handleError(res, error);
    }
};