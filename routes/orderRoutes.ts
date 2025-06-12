import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  deleteOrder,
} from "../controllers/orderController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// thsese are user routes
router.post("/", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id/cancel", authenticate, cancelOrder);

// these are admin routes
router.patch("/:id/status", authenticate, updateOrderStatus);
router.get("/admin/all", authenticate, getAllOrders);
router.delete("/:id", authenticate, deleteOrder);


export default router;