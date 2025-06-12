import express from "express";
import {
  create,
  index,
  show,
  update,
  destroy,
} from "../controllers/ProductController";
import { upload, uploadMultiple } from "../middlewares/upload";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// Public route - anyone can view products
router.get("/", index);
router.get("/:id", show);

// Protected routes - only authenticated users can access
router.post("/", authenticate, uploadMultiple, create);
router.put("/:id", authenticate, uploadMultiple, update);
router.delete("/:id", authenticate, destroy);

export default router;
