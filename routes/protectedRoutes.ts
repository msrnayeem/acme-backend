import express from "express";
import { validateJwt } from "../middlewares/validateJwt";
import { getUserProfile } from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// Protect the /profile route
router.get("/profile", authenticate, getUserProfile);

export default router;
