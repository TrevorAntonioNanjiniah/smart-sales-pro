import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import connectDB from './config/database.js';

// Routes
import webhookRoutes  from './routes/webhook.js';
import productRoutes  from './routes/products.js';
import leadRoutes     from './routes/leads.js';
import orderRoutes    from './routes/orders.js';
import paymentRoutes  from './routes/payments.js';
import uploadRoutes   from './routes/upload.js';
import n8nRoutes      from './routes/n8n.js';
import sellerRoutes   from './routes/sellers.js'; 

dotenv.config();

// Environment Variable Checks
console.log("CLERK_SECRET_KEY:",        process.env.CLERK_SECRET_KEY        ? "✅ loaded" : "❌ missing");
console.log("CLERK_WEBHOOK_SECRET:",    process.env.CLERK_WEBHOOK_SECRET    ? "✅ loaded" : "❌ missing");
console.log("Mongo URI:",               process.env.MONGODB_URI             ? "✅ loaded" : "❌ missing");
console.log("CLOUDINARY_CLOUD_NAME:",   process.env.CLOUDINARY_CLOUD_NAME   ? "✅ loaded" : "❌ missing");
console.log("CLOUDINARY_API_KEY:",      process.env.CLOUDINARY_API_KEY      ? "✅ loaded" : "❌ missing");
console.log("CLOUDINARY_API_SECRET:",   process.env.CLOUDINARY_API_SECRET   ? "✅ loaded" : "❌ missing");
console.log("N8N_WEBHOOK_URL:",         process.env.N8N_WEBHOOK_URL         ? "✅ loaded" : "❌ missing");

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const app = express();
const port = process.env.PORT || 8080;

// CORS - Updated to allow multiple frontend ports
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Webhooks FIRST (raw body required, before express.json())
app.use('/api/webhooks', webhookRoutes);

// JSON Middleware
app.use(express.json());

// Clerk Auth Middleware
try {
  app.use(clerkMiddleware());
  console.log("✅ Clerk middleware initialized");
} catch (err) {
  console.error("❌ Error initializing Clerk middleware:", err);
}

// API Routes
app.use('/api/products',  productRoutes);
app.use('/api/leads',     leadRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/upload',    uploadRoutes);
app.use('/api/n8n',       n8nRoutes);
app.use('/api/sellers',   sellerRoutes);  

// Test Route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    port,
    allowedFrontends: allowedOrigins,
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Sales Assistant API',
    status: 'running',
    port,
    frontendUrls: allowedOrigins,
    endpoints: [
      '/api/products',
      '/api/leads',
      '/api/orders',
      '/api/payments',
      '/api/webhooks/clerk',
      '/api/upload',
      '/api/n8n',
      '/api/sellers',       
    ],
  });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`✅ Allowed frontend origins:`, allowedOrigins);
});