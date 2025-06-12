import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

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
const port = process.env.PORT || 5000;

// Apply middlewares
app.use(cookieParser());

// Updated CORS configuration for domain setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://acme.logicmatrix.tech", // Your frontend domain
  process.env.CLIENT_URL || "http://152.42.179.250:3000"
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true, // Essential for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cookie', 
      'X-Requested-With', 
      'Accept', 
      'Origin'
    ],
    exposedHeaders: ['Set-Cookie']
  })
);

// Add explicit CORS headers middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }
  
  next();
});

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