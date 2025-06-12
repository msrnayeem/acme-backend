import express from "express";
import {
  register,
  login,
  logout,
  verifyOtp,
  requestPasswordReset,
  resetPassword,
  resendotp,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendotp);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;