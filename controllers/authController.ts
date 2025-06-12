import { Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  updateUserByEmail,
} from "../models/UserModel";
import dotenv from "dotenv";
import { generateOTP } from "../utils/generateOtp";
import { sendOTPEmail, sendResetPasswordEmail } from "../utils/mailer";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

// register user  and send OTP
export const register: RequestHandler = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(email, hashedPassword, name);

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const userUpdated = await updateUserByEmail(email, { otp, otpExpiresAt });

    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "User registered, OTP sent", userUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const login: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (!(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!user.verified) {
    res.status(401).json({ error: "User not verified" });
    return;
  }

  if (user.status !== "active") {
    res.status(403).json({ error: "Your account is not active. Please contact support." });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  
  // Set cookie with correct domain for production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // true for HTTPS in production
    sameSite: isProduction ? "none" : "lax", // "none" required for cross-domain in production
    maxAge: 3600000, // 1 hour
    domain: isProduction ? ".logicmatrix.tech" : undefined, // Share cookie across subdomains
    path: "/" // Ensure cookie is available for all paths
  });

  console.log(`Login successful for user: ${email}, Token set in cookie`);

  res.json({ 
    message: "Login successful", 
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    }, 
    token 
  });
};

// logout user
export const logout: RequestHandler = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// verify otp
export const verifyOtp: RequestHandler = async (req: Request, res: Response) => {
  const { email, otp } = req.body || {};

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  if (!otp) {
    res.status(400).json({ error: "otp is required" });
    return;
  }
  const user = await findUserByEmail(email);

  if (!user) {
    res.status(400).json({ error: "user not exist" });
    return;
  }
  if (user.otp !== otp) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }

  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    res.status(400).json({ error: "OTP expired" });
    return;
  }

  const userUpdated = await updateUserByEmail(email, {
    otp: null,
    otpExpiresAt: null,
    verified: true,
  });

  res.status(200).json({ message: "OTP verified successfully" });
};

// request reset password
export const requestPasswordReset: RequestHandler = async (req: Request, res: Response) => {
  const { email } = req.body || {};

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await updateUserByEmail(email, { otp, otpExpiresAt });
  await sendResetPasswordEmail(email, otp);

  res.status(200).json({ message: "OTP sent to email for password reset" });
};

// reset password
export const resetPassword: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  if (!password) {
    res.status(400).json({ error: "new password is required" });
    return;
  }

  const user = await findUserByEmail(email);

  if (!user) {
    res.status(400).json({ error: "Invalid User" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  // await updateUserPasswordByEmail(email, hashed);
  await updateUserByEmail(email, {
    password: hashed,
    otp: null,
    otpExpiresAt: null,
  });

  res.status(200).json({ message: "Password has been reset successfully" });
};

// resend otp
export const resendotp: RequestHandler = async (req: Request, res: Response) => {
  const { email, type } = req.body;
  // console.log(email, type);

  if (!email || !type) {
    res.status(400).json({ error: "Email and type are required" });
    return;
  }

  if (!["register", "resetpassword"].includes(type)) {
    res.status(400).json({ error: "Invalid type provided" });
    return;
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // 10 minutes
    await updateUserByEmail(email, { otp, otpExpiresAt });
    await updateUserByEmail(email, { otp, otpExpiresAt });

    if (type === "register") {
      await sendOTPEmail(email, otp);
    } else if (type === "resetpassword") {
      await sendResetPasswordEmail(email, otp);
    }

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};