import { Request, Response } from 'express';
import * as CartModel from '../models/cartModel';
import { sendResponse, handleError, RequestHandler } from '../utils/responseHandler';

interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
    };
}

export const addToCart: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        const userId = (req as AuthenticatedRequest).user.userId;

        if (!productId || quantity < 1) {
            sendResponse(res, 400, false, null, 'Invalid product ID or quantity');
            return;
        }

        const cartItem = await CartModel.addToCart(userId, productId, quantity);
        sendResponse(res, 201, true, cartItem);
    } catch (error) {
        handleError(res, error);
    }
};

export const getCart: RequestHandler = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        const cart = await CartModel.getCart(userId);
        sendResponse(res, 200, true, cart);
    } catch (error) {
        handleError(res, error);
    }
};

export const updateCartItem: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        const userId = (req as AuthenticatedRequest).user.userId;

        if (!productId || quantity < 0) {
            sendResponse(res, 400, false, null, 'Invalid product ID or quantity');
            return;
        }

        const updatedItem = await CartModel.updateCartItem(userId, productId, quantity);
        sendResponse(res, 200, true, updatedItem);
    } catch (error) {
        handleError(res, error);
    }
};

export const removeFromCart: RequestHandler = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.productId);
        const userId = (req as AuthenticatedRequest).user.userId;

        if (isNaN(productId)) {
            sendResponse(res, 400, false, null, 'Invalid product ID');
            return;
        }

        await CartModel.removeFromCart(userId, productId);
        sendResponse(res, 200, true, null, 'Item removed from cart');
    } catch (error) {
        handleError(res, error);
    }
};

export const clearCart: RequestHandler = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthenticatedRequest).user.userId;
        await CartModel.clearCart(userId);
        sendResponse(res, 200, true, null, 'Cart cleared successfully');
    } catch (error) {
        handleError(res, error);
    }
};