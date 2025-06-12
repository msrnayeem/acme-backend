// File: routes/categoryRoutes.ts
import express from "express";
import {
  create,
  show,
  showByName,
  update,
  destroy,
  index,
} from "../controllers/categoryController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// Public routes - anyone can view categories
router.get("/", index);
router.get("/name/:name", showByName);
router.get("/:id", show);

// Protected routes - only authenticated users can modify categories
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, destroy);

export default router;
