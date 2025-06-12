import express from 'express';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;