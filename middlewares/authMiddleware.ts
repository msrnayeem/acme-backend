import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
 
interface JwtPayload {
  userId: number;
  iat: number;
  exp: number;
}
 
// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
 
//   if (!token) {
//     res.status(401).json({
//       success: false,
//       message: "Authentication required",
//     });
//     return;
//   }
 
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
 
//     if (decoded.exp < Date.now() / 1000) {
//       res.status(401).json({
//         success: false,
//         message: "Token expired",
//       });
//       return;
//     }
 
//     (req as any).user = {
//       userId: decoded.userId,
//       tokenExp: new Date(decoded.exp * 1000).toISOString(),
//     };
 
//     next();
//   } catch (error) {
//     res.status(403).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//     return;
//   }
// };
 
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next();
};