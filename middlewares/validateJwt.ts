import jwt from "jsonwebtoken";
import { RequestHandler } from "express";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const validateJwt: RequestHandler = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }

    // @ts-ignore: allow attaching decoded user
    req.user = decoded;
    next();
  });
};