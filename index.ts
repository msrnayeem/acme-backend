import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import orderRoutes from "./routes/orderRoutes";
import notificationRoutes from './routes/notificationRoutes';
import contactRoutes from './routes/contactRoutes';
import amazonRoutes from "./routes/amazonRoutes";

dotenv.config();

const app: Express = express();
app.use(cookieParser());
const port = process.env.PORT;
const cors = require("cors");
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/amazon', amazonRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Typescript + Express API Server");
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`API available at http://localhost:${port}/api`);
});