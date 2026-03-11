// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import connectDB from './config/database.js';

// Routes
import webhookRoutes from './routes/webhook.js';
import productRoutes from './routes/products.js';
import leadRoutes from './routes/leads.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import n8nRoutes from './routes/n8nWebhook.js'; // ✅ n8n routes

dotenv.config();

// Environment checks
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "loaded" : "missing");
console.log("CLERK_WEBHOOK_SECRET:", process.env.CLERK_WEBHOOK_SECRET ? "loaded" : "missing");
console.log("Mongo URI:", process.env.MONGODB_URI ? "loaded" : "missing");
console.log("N8N Webhook URL:", process.env.N8N_WEBHOOK_URL ? "loaded" : "not configured");

// Connect to MongoDB
connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const app = express();
const port = process.env.PORT || 8080;

// CORS — allow frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhooks FIRST — raw body required
app.use('/api/webhooks', webhookRoutes);


// JSON & URL-encoded middleware with higher limits for images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Clerk auth middleware
try {
  app.use(clerkMiddleware());
  console.log("Clerk middleware initialized");
} catch (err) {
  console.error("Error initializing Clerk middleware:", err);
}

// API routes
app.use('/api/products', productRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/n8n-webhook', n8nRoutes); // ✅ n8n webhook routes

// Test & health routes
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    port,
  });
});

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
      '/api/n8n-webhook',
      '/api/health',
    ],
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📤 n8n webhook endpoint: /api/n8n-webhook`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});