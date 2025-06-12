import { Request, Response } from 'express';

interface ApiResponse {
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
}

export const sendResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    data?: any,
    message?: string
): void => {
    const response: ApiResponse = {
        success,
        ...(data && { data }),
        ...(message && { message }),
    };
    res.status(statusCode).json(response);
};

export const handleError = (res: Response, error: unknown): void => {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    sendResponse(res, 500, false, null, message);
};

export type RequestHandler = (req: Request, res: Response) => Promise<void>;