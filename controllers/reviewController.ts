import { Request, Response } from 'express';
import * as ReviewModel from '../models/reviewModel';
import { sendResponse, handleError, RequestHandler } from '../utils/responseHandler';

export const createReview: RequestHandler = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;
        const userId = (req as any).user.userId;

        if (!rating || !productId) {
            sendResponse(res, 400, false, null, 'Rating and product ID are required');
            return;
        }

        const review = await ReviewModel.createReview({
            rating,
            comment,
            userId,
            productId,
        });

        sendResponse(res, 201, true, review);
    } catch (error) {
        handleError(res, error);
    }
};

export const getProductReviews: RequestHandler = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (isNaN(productId)) {
            sendResponse(res, 400, false, null, 'Invalid product ID');
            return;
        }

        const reviews = await ReviewModel.getProductReviews(productId, skip, limit);
        sendResponse(res, 200, true, reviews);
    } catch (error) {
        handleError(res, error);
    }
};

export const getAllReviews: RequestHandler = async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const reviews = await ReviewModel.getAllReviews(skip, limit);
        sendResponse(res, 200, true, reviews);
    } catch (error) {
        handleError(res, error);
    }
};

export const getReview: RequestHandler = async (req, res) => {
    try {
        const review = await ReviewModel.getReviewById(Number(req.params.id));
        if (!review) {
            sendResponse(res, 404, false, null, 'Review not found');
            return;
        }
        sendResponse(res, 200, true, review);
    } catch (error) {
        handleError(res, error);
    }
};

export const updateReview: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { rating, comment } = req.body;
        const userId = (req as any).user.userId;

        if (isNaN(id)) {
            sendResponse(res, 400, false, null, 'Invalid review ID');
            return;
        }

        const review = await ReviewModel.getReviewById(id);
        if (!review) {
            sendResponse(res, 404, false, null, 'Review not found');
            return;
        }

        if (review.userId !== userId) {
            sendResponse(res, 403, false, null, 'Not authorized to update this review');
            return;
        }

        const updatedReview = await ReviewModel.updateReview(id, {
            rating,
            comment,
        });

        sendResponse(res, 200, true, updatedReview);
    } catch (error) {
        handleError(res, error);
    }
};

export const deleteReview: RequestHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const userId = (req as any).user.userId;

        if (isNaN(id)) {
            sendResponse(res, 400, false, null, 'Invalid review ID');
            return;
        }

        const review = await ReviewModel.getReviewById(id);
        if (!review) {
            sendResponse(res, 404, false, null, 'Review not found');
            return;
        }

        if (review.userId !== userId) {
            sendResponse(res, 403, false, null, 'Not authorized to delete this review');
            return;
        }

        await ReviewModel.deleteReview(id);
        sendResponse(res, 200, true, null, 'Review deleted successfully');
    } catch (error) {
        handleError(res, error);
    }
};
