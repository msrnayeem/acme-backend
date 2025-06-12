import { Router } from 'express';
import {
  getDashboardStats,
  getListings,
  getOrders,
  getSingleProduct,
  getProductByASIN,
  updateProduct
} from '../controllers/amazonController';

const router = Router();

// Stats
router.get('/dashboard/stats', getDashboardStats);

// Products
router.get('/products/:sku', getSingleProduct);
router.get('/products/asin/:asin', getProductByASIN);
router.patch('/products/:sku', updateProduct);
router.get('/products', getListings);

// Orders
router.get('/orders', getOrders);

export default router;
