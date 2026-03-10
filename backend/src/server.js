import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import connectDB from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import webhookRoutes from './routes/webhook.js';
import productRoutes from './routes/products.js';
import leadRoutes from './routes/leads.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/upload.js'; // ✅ NEW: upload route

dotenv.config();

// Needed for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check environment variables
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "loaded" : "missing");
console.log("CLERK_WEBHOOK_SECRET:", process.env.CLERK_WEBHOOK_SECRET ? "loaded" : "missing");
console.log("Mongo URI:", process.env.MONGODB_URI ? "loaded" : "missing");

// Connect to MongoDB
connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const app = express();
const port = process.env.PORT || 8080;

// CORS — allow Next.js frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ✅ NEW: Serve uploaded images as static files
// e.g. http://localhost:8080/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Webhooks FIRST — raw body required
app.use('/api/webhooks', webhookRoutes);

// JSON middleware
app.use(express.json());

// Clerk auth middleware
try {
  app.use(clerkMiddleware());
  console.log("Clerk middleware initialized");
} catch (err) {
  console.error("Error initializing Clerk middleware:", err);
}

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes); // ✅ NEW: register upload route

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    port,
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Sales Assistant API',
    status: 'running',
    endpoints: [
      '/api/products',
      '/api/leads',
      '/api/orders',
      '/api/payments',
      '/api/webhooks/clerk',
      '/api/upload', // ✅ NEW
    ],
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});