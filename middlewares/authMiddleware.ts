import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
  userId: number;
  iat: number;
  exp: number;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // // Enhanced logging
  // console.log("Auth Headers:", req.headers.authorization);
  // console.log("Auth Cookies:", req.cookies);
  // console.log("JWT Secret exists:", !!process.env.JWT_SECRET);

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  // if (token) {
  //   console.log("Token:", token);
  // }

  if (!token) {
    // console.log("No token found in either cookies or headers");
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Check token expiration
    if (decoded.exp < Date.now() / 1000) {
      // console.log("Token expired");
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    // Add user info to request
    (req as any).user = {
      userId: decoded.userId,
      tokenExp: new Date(decoded.exp * 1000).toISOString(),
    };

    // console.log("Authentication successful for user:", decoded.userId);
    next();
  } catch (error) {
    // console.log("Token verification failed:", error);
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }
};