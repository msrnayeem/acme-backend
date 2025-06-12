import express from 'express';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getAllReviews,
} from '../controllers/reviewController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.get('/', authenticate, getAllReviews);
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
